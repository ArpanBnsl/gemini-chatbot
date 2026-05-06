const API_BASE = "http://localhost:8000/api";

export async function createChat() {
  const res = await fetch(`${API_BASE}/chats`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function listChats() {
  const res = await fetch(`${API_BASE}/chats`);
  if (!res.ok) throw new Error("Failed to list chats");
  return res.json();
}

export async function getChat(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}`);
  if (!res.ok) throw new Error("Failed to get chat");
  return res.json();
}

export async function deleteChat(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete chat");
  return res.json();
}

export async function uploadDocument(chatId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/chats/${chatId}/upload-document`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function uploadImage(chatId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/chats/${chatId}/upload-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload image");
  }
  return res.json();
}

export async function sendMessage(chatId, message) {
  const formData = new FormData();
  formData.append("message", message);
  const res = await fetch(`${API_BASE}/chats/${chatId}/message`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send message");
  }
  return res.json();
}
