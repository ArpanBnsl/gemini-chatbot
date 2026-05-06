"""
Gemini Chatbot Backend - FastAPI
Handles chat, document upload (PDF/TXT), image upload (PNG/JPG),
in-memory chat context management, and multi-chat support.

Supports multiple document/image uploads per chat. Each upload is recorded
as a special message in the chat history so it appears inline. The Gemini
model receives ALL uploaded files as context for every request.
"""

import uuid
import base64
import io
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF
from PIL import Image
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Gemini Chatbot API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Gemini client (lazy-initialized)
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. Set it in .env file.")

MODEL_ID = "gemini-2.5-flash-lite"
_client = None


def get_gemini_client():
    """Lazy-initialize the Gemini client so the server can start without a key."""
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not configured. Set it in the .env file.",
            )
        _client = genai.Client(api_key=api_key)
    return _client

# ---------------------------------------------------------------------------
# In-memory chat store
# ---------------------------------------------------------------------------
# Each chat stores:
#   messages: list of {role, content, type, timestamp, ...}
#       type = "text" (default) | "doc_upload" | "img_upload"
#   documents: list of {name, text}            -- ALL uploaded docs
#   images:    list of {name, data, mime}       -- ALL uploaded images (base64)
chats: dict = {}


def _get_chat(chat_id: str) -> dict:
    if chat_id not in chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chats[chat_id]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file using PyMuPDF."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text_parts = []
    for page in doc:
        text_parts.append(page.get_text())
    doc.close()
    return "\n".join(text_parts).strip()


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Decode a TXT file."""
    return file_bytes.decode("utf-8", errors="replace").strip()


def build_gemini_contents(chat: dict, user_message: str) -> list:
    """
    Build the contents list for the Gemini API.
    Includes ALL uploaded documents and images as context,
    plus the full conversation history.
    """
    contents = []

    # Inject ALL uploaded documents as context at the start
    if chat["documents"]:
        doc_parts = []
        for i, doc in enumerate(chat["documents"]):
            doc_parts.append(
                f"[UPLOADED DOCUMENT {i+1}: {doc['name']}]\n{doc['text']}"
            )
        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text="\n\n".join(doc_parts))],
            )
        )
        contents.append(
            types.Content(
                role="model",
                parts=[types.Part.from_text(
                    text="I've received all the documents. I'll use their content to answer your questions."
                )],
            )
        )

    # Inject ALL uploaded images as context
    if chat["images"]:
        img_parts = []
        for img in chat["images"]:
            image_bytes = base64.b64decode(img["data"])
            img_parts.append(
                types.Part.from_bytes(data=image_bytes, mime_type=img["mime"])
            )
        img_parts.append(
            types.Part.from_text(
                text=f"I've uploaded {len(chat['images'])} image(s). Use all of them as context."
            )
        )
        contents.append(types.Content(role="user", parts=img_parts))
        contents.append(
            types.Content(
                role="model",
                parts=[types.Part.from_text(
                    text="I've received all the images. I'll use them to answer your questions."
                )],
            )
        )

    # Prior conversation messages (only text messages, skip upload markers)
    for msg in chat["messages"]:
        if msg.get("type") in ("doc_upload", "img_upload"):
            continue  # skip upload markers – content is already injected above
        role = "user" if msg["role"] == "user" else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["content"])],
            )
        )

    # Current user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)],
        )
    )
    return contents


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "ok", "message": "Gemini Chatbot API"}


@app.post("/api/chats")
def create_chat():
    """Create a new chat session."""
    chat_id = str(uuid.uuid4())
    chat = {
        "id": chat_id,
        "title": "New Chat",
        "created_at": datetime.utcnow().isoformat(),
        "messages": [],
        "documents": [],   # list of {name, text}
        "images": [],       # list of {name, data, mime}
    }
    chats[chat_id] = chat
    return {"id": chat_id, "title": chat["title"], "created_at": chat["created_at"]}


@app.get("/api/chats")
def list_chats():
    """List all chat sessions (id, title, created_at)."""
    result = []
    for c in chats.values():
        result.append({
            "id": c["id"],
            "title": c["title"],
            "created_at": c["created_at"],
            "message_count": len([m for m in c["messages"] if m.get("type", "text") == "text"]),
        })
    # Sort by created_at descending
    result.sort(key=lambda x: x["created_at"], reverse=True)
    return result


@app.get("/api/chats/{chat_id}")
def get_chat(chat_id: str):
    """Get full chat details including messages."""
    chat = _get_chat(chat_id)
    return {
        "id": chat["id"],
        "title": chat["title"],
        "created_at": chat["created_at"],
        "messages": chat["messages"],
        "documents": [{"name": d["name"]} for d in chat["documents"]],
        "images": [{"name": img["name"], "data": img["data"], "mime": img["mime"]} for img in chat["images"]],
    }


@app.delete("/api/chats/{chat_id}")
def delete_chat(chat_id: str):
    """Delete a chat session."""
    if chat_id not in chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    del chats[chat_id]
    return {"status": "deleted"}


@app.post("/api/chats/{chat_id}/upload-document")
async def upload_document(chat_id: str, file: UploadFile = File(...)):
    """Upload a PDF or TXT document and extract its text."""
    chat = _get_chat(chat_id)

    filename = file.filename or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    if ext not in ("pdf", "txt"):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    file_bytes = await file.read()

    if ext == "pdf":
        text = extract_text_from_pdf(file_bytes)
    else:
        text = extract_text_from_txt(file_bytes)

    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from the file.")

    # Append to documents list (keep ALL docs)
    chat["documents"].append({"name": filename, "text": text})

    # Add an inline upload message to chat history
    chat["messages"].append({
        "role": "user",
        "type": "doc_upload",
        "content": filename,
        "extracted_length": len(text),
        "preview": text[:300],
        "timestamp": datetime.utcnow().isoformat(),
    })

    return {
        "status": "ok",
        "filename": filename,
        "extracted_length": len(text),
        "preview": text[:500],
    }


@app.post("/api/chats/{chat_id}/upload-image")
async def upload_image(chat_id: str, file: UploadFile = File(...)):
    """Upload a PNG or JPG image."""
    chat = _get_chat(chat_id)

    filename = file.filename or ""
    content_type = file.content_type or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext not in ("png", "jpg", "jpeg") and content_type not in ("image/png", "image/jpeg"):
        raise HTTPException(status_code=400, detail="Only PNG and JPG images are supported.")

    file_bytes = await file.read()

    # Validate it's a real image
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    mime = "image/png" if ext == "png" else "image/jpeg"
    b64 = base64.b64encode(file_bytes).decode("utf-8")

    # Append to images list (keep ALL images)
    chat["images"].append({"name": filename, "data": b64, "mime": mime})

    # Add an inline upload message to chat history
    chat["messages"].append({
        "role": "user",
        "type": "img_upload",
        "content": filename,
        "image_data": b64,
        "image_mime": mime,
        "timestamp": datetime.utcnow().isoformat(),
    })

    return {
        "status": "ok",
        "filename": filename,
        "mime": mime,
        "image_data": b64,
    }


@app.post("/api/chats/{chat_id}/message")
async def send_message(
    chat_id: str,
    message: str = Form(...),
):
    """Send a message to the chatbot and get a response."""
    chat = _get_chat(chat_id)
    user_msg = message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Build contents for Gemini
    contents = build_gemini_contents(chat, user_msg)

    try:
        response = get_gemini_client().models.generate_content(
            model=MODEL_ID,
            contents=contents,
        )
        bot_reply = response.text or "I'm sorry, I couldn't generate a response."
    except Exception as e:
        bot_reply = f"Error communicating with Gemini: {str(e)}"

    # Save messages to history
    chat["messages"].append({
        "role": "user",
        "type": "text",
        "content": user_msg,
        "timestamp": datetime.utcnow().isoformat(),
    })
    chat["messages"].append({
        "role": "bot",
        "type": "text",
        "content": bot_reply,
        "timestamp": datetime.utcnow().isoformat(),
    })

    # Auto-title on first real text message
    text_msgs = [m for m in chat["messages"] if m.get("type") == "text"]
    if len(text_msgs) == 2 and chat["title"] == "New Chat":
        chat["title"] = user_msg[:50] + ("..." if len(user_msg) > 50 else "")

    return {
        "reply": bot_reply,
        "chat_title": chat["title"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
