import { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import * as api from "./api";
import "./index.css";

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [toast, setToast] = useState(null);

  // Show a toast notification
  const showToast = useCallback((message, duration = 3000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  // Refresh chat list
  const refreshChats = useCallback(async () => {
    try {
      const list = await api.listChats();
      setChats(list);
    } catch (err) {
      console.error("Failed to list chats:", err);
    }
  }, []);

  // Load a specific chat
  const loadChat = useCallback(async (chatId) => {
    try {
      const chatData = await api.getChat(chatId);
      setActiveChat(chatData);
      setMessages(chatData.messages || []);
      setActiveChatId(chatId);
    } catch (err) {
      console.error("Failed to load chat:", err);
      showToast("Failed to load chat");
    }
  }, [showToast]);

  // Initialize - load chat list
  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  // Handle creating a new chat
  const handleNewChat = async () => {
    try {
      const newChat = await api.createChat();
      await refreshChats();
      await loadChat(newChat.id);
      showToast("New chat created");
    } catch (err) {
      console.error("Failed to create chat:", err);
      showToast("Failed to create chat");
    }
  };

  // Handle selecting a chat
  const handleSelectChat = async (chatId) => {
    if (chatId === activeChatId) return;
    await loadChat(chatId);
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId) => {
    try {
      await api.deleteChat(chatId);
      if (chatId === activeChatId) {
        setActiveChatId(null);
        setActiveChat(null);
        setMessages([]);
      }
      await refreshChats();
      showToast("Chat deleted");
    } catch (err) {
      console.error("Failed to delete chat:", err);
      showToast("Failed to delete chat");
    }
  };

  // Handle sending a message
  const handleSendMessage = async (text) => {
    if (!activeChatId) return;

    // Optimistically add user message
    const userMsg = {
      role: "user",
      type: "text",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await api.sendMessage(activeChatId, text);

      // Add bot response
      const botMsg = { role: "bot", type: "text", content: result.reply };
      setMessages((prev) => [...prev, botMsg]);

      // Update chat title if changed
      if (result.chat_title) {
        setActiveChat((prev) => (prev ? { ...prev, title: result.chat_title } : prev));
        await refreshChats();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const errMsg = {
        role: "bot",
        type: "text",
        content: `⚠️ Error: ${err.message}. Please check your API key and try again.`,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document upload – adds inline upload card to chat
  const handleUploadDocument = async (file) => {
    if (!activeChatId) return;
    setUploadingDoc(true);
    showToast(`Uploading ${file.name}...`);

    try {
      const result = await api.uploadDocument(activeChatId, file);

      // Add inline upload message (matches what backend stored)
      const uploadMsg = {
        role: "user",
        type: "doc_upload",
        content: result.filename,
        extracted_length: result.extracted_length,
        preview: result.preview,
      };
      setMessages((prev) => [...prev, uploadMsg]);
      showToast(`📄 ${result.filename} uploaded (${result.extracted_length} chars)`);
      await refreshChats();
    } catch (err) {
      console.error("Upload failed:", err);
      showToast(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Handle image upload – adds inline image card to chat
  const handleUploadImage = async (file) => {
    if (!activeChatId) return;
    setUploadingImg(true);
    showToast(`Uploading ${file.name}...`);

    try {
      const result = await api.uploadImage(activeChatId, file);

      // Add inline upload message (matches what backend stored)
      const uploadMsg = {
        role: "user",
        type: "img_upload",
        content: result.filename,
        image_data: result.image_data,
        image_mime: result.mime,
      };
      setMessages((prev) => [...prev, uploadMsg]);
      showToast(`🖼️ ${result.filename} uploaded successfully`);
      await refreshChats();
    } catch (err) {
      console.error("Upload failed:", err);
      showToast(`❌ Upload failed: ${err.message}`);
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <ChatWindow
        chat={activeChat}
        messages={messages}
        isLoading={isLoading}
        uploadingDoc={uploadingDoc}
        uploadingImg={uploadingImg}
        onSendMessage={handleSendMessage}
        onUploadDocument={handleUploadDocument}
        onUploadImage={handleUploadImage}
      />

      {/* Toast notification */}
      {toast && <div className="upload-toast">{toast}</div>}
    </div>
  );
}
