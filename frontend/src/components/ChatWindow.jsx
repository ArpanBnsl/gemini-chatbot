import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  chat,
  messages,
  isLoading,
  uploadingDoc,
  uploadingImg,
  onSendMessage,
  onUploadDocument,
  onUploadImage,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!chat) {
    return (
      <div className="chat-main">
        <div className="welcome-screen">
          <div className="welcome-icon">✦</div>
          <h2 className="welcome-title">Gemini Chatbot</h2>
          <p className="welcome-subtitle">
            Upload documents, share images, and have intelligent conversations
            powered by Google&apos;s Gemini AI.
          </p>
          <div className="welcome-features">
            <div className="welcome-feature">
              <div className="welcome-feature-icon">💬</div>
              <div className="welcome-feature-text">Natural Chat</div>
            </div>
            <div className="welcome-feature">
              <div className="welcome-feature-icon">📄</div>
              <div className="welcome-feature-text">Document Q&A</div>
            </div>
            <div className="welcome-feature">
              <div className="welcome-feature-icon">🖼️</div>
              <div className="welcome-feature-text">Image Analysis</div>
            </div>
            <div className="welcome-feature">
              <div className="welcome-feature-icon">🔄</div>
              <div className="welcome-feature-text">Multi-Chat</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-main">
      {/* Header */}
      <div className="chat-header">
        <span className="chat-header-title">{chat.title}</span>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && !isLoading && (
          <div className="welcome-screen" style={{ padding: "60px 20px" }}>
            <div className="welcome-icon" style={{ width: 60, height: 60, fontSize: 28 }}>✦</div>
            <h2 className="welcome-title" style={{ fontSize: 22 }}>How can I help you?</h2>
            <p className="welcome-subtitle" style={{ fontSize: 14 }}>
              Send a message, upload a document, or share an image to get started.
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {isLoading && (
          <div className="message-row bot">
            <div className="message-avatar bot-avatar">✦</div>
            <div className="message-bubble bot-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onUploadDocument={onUploadDocument}
        onUploadImage={onUploadImage}
        disabled={isLoading}
        isLoading={isLoading}
        uploadingDoc={uploadingDoc}
        uploadingImg={uploadingImg}
      />
    </div>
  );
}
