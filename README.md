# ✦ Gemini Chatbot

A full-stack AI chatbot powered by **Google's Gemini API** with support for text conversations, document Q&A (PDF/TXT), image analysis (PNG/JPG), and multi-chat session management.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Features

### Core
- 💬 **Chat Interface** – Natural conversation with Gemini AI
- 📄 **Document Upload** – Upload PDF/TXT files and ask questions about their content
- 🖼️ **Image Upload** – Upload PNG/JPG images for visual analysis
- 🧠 **Chat Context** – Maintains conversation history, uploaded documents, and images within a session
- 🔄 **New Chat / Reset** – Start fresh conversations with clean context

### Bonus
- 🖼️ **Image Preview** – See uploaded images displayed in the chat
- 📋 **Multi-Chat Sidebar** – Switch between multiple chat sessions
- ⏳ **Loading Indicators** – Visual feedback during file uploads and AI responses

---

## 📁 Project Structure

```
gemini-chatbot/
├── backend/
│   ├── main.py              # FastAPI server with all endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   └── .env                 # Your API key (create this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── api.js           # API client functions
│   │   ├── index.css        # Global styles & design system
│   │   ├── main.jsx         # React entry point
│   │   └── components/
│   │       ├── Sidebar.jsx      # Chat list sidebar
│   │       ├── ChatWindow.jsx   # Main chat area
│   │       ├── MessageBubble.jsx # Message display
│   │       └── MessageInput.jsx  # Input with upload buttons
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.10+** installed
- **Node.js 18+** and npm installed
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/gemini-chatbot.git
cd gemini-chatbot
```

### Step 2: Set Up the Backend

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create your .env file with your Gemini API key
cp .env.example .env
# Edit .env and replace 'your_gemini_api_key_here' with your actual key
```

**On Windows:**
```powershell
copy .env.example .env
notepad .env
```

### Step 3: Set Your Gemini API Key

Edit the `.env` file in the `backend/` directory:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 4: Set Up the Frontend

```bash
# Navigate to frontend (from project root)
cd frontend

# Install Node.js dependencies
npm install
```

---

## ▶️ Running the Application

### Start the Backend (Terminal 1)

```bash
cd backend
python main.py
```

The API server will start at: **http://localhost:8000**

You can verify it's running by visiting http://localhost:8000 in your browser.

### Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The React app will start at: **http://localhost:5173**

Open **http://localhost:5173** in your browser to use the chatbot.

---

## 📖 Example Usage

### 1. Document Q&A
1. Click **"New Chat"** to start a session
2. Click the 📄 **Document Upload** button
3. Select a PDF or TXT file
4. Type: *"Summarize the document"* → Send
5. Follow up: *"What was the third point mentioned?"*
6. The bot answers using document context + conversation history

### 2. Image Analysis
1. Click the 🖼️ **Image Upload** button
2. Select a PNG or JPG image
3. Type: *"What's in the image?"* → Send
4. Follow up: *"Is the person smiling?"*
5. The bot answers using the uploaded image

### 3. Context Reset
1. After chatting, click **"New Chat"**
2. Ask: *"What did I upload earlier?"*
3. The bot responds with fresh context: *"No files have been uploaded yet."*

### 4. Multi-Chat
- Create multiple chats using the **"New Chat"** button
- Switch between them using the sidebar
- Each chat maintains its own independent context

---

## 🌐 Deployment Instructions

### Backend Deployment (Render)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Set the **Root Directory** to `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** in Render dashboard:
   ```
   GEMINI_API_KEY=your_actual_api_key
   ```

4. **Deploy** – Render will build and start your backend.
   Note your backend URL (e.g., `https://gemini-chatbot-api.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Import your GitHub repository**:
   - Set the **Root Directory** to `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variable** in Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```

4. **Deploy** – Vercel will build and deploy your frontend.

### Alternative: Netlify Frontend Deployment

1. **Create a Netlify account** at [netlify.com](https://netlify.com)

2. **Build locally**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Drag and drop** the `dist/` folder to Netlify, or:
   - Connect GitHub repo
   - Set **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add redirects** – Create `frontend/public/_redirects`:
   ```
   /api/*  https://your-backend.onrender.com/api/:splat  200
   ```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chats` | List all chat sessions |
| `POST` | `/api/chats` | Create a new chat session |
| `GET` | `/api/chats/{id}` | Get chat details + messages |
| `DELETE` | `/api/chats/{id}` | Delete a chat session |
| `POST` | `/api/chats/{id}/upload-document` | Upload PDF/TXT document |
| `POST` | `/api/chats/{id}/upload-image` | Upload PNG/JPG image |
| `POST` | `/api/chats/{id}/message` | Send message & get AI response |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, React Markdown, React Icons |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **AI** | Google Gemini 2.0 Flash (via `google-genai` SDK) |
| **PDF Parsing** | PyMuPDF (fitz) |
| **Image Handling** | Pillow |

---

## 📝 License

MIT License – feel free to use, modify, and distribute.
