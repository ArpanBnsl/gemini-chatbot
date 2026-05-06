import ReactMarkdown from "react-markdown";
import { HiOutlineDocumentText, HiOutlinePhoto } from "react-icons/hi2";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const msgType = message.type || "text";

  // ---------- Document Upload Card ----------
  if (msgType === "doc_upload") {
    return (
      <div className="message-row user">
        <div className="message-avatar user-avatar">👤</div>
        <div className="upload-card doc-card">
          <div className="upload-card-icon doc-icon">
            <HiOutlineDocumentText size={22} />
          </div>
          <div className="upload-card-info">
            <div className="upload-card-label">Document Uploaded</div>
            <div className="upload-card-name">{message.content}</div>
            {message.extracted_length && (
              <div className="upload-card-meta">
                {message.extracted_length.toLocaleString()} characters extracted
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Image Upload Card ----------
  if (msgType === "img_upload") {
    const src = message.image_data
      ? `data:${message.image_mime};base64,${message.image_data}`
      : null;

    return (
      <div className="message-row user">
        <div className="message-avatar user-avatar">👤</div>
        <div className="upload-card img-card">
          {src && (
            <img src={src} alt={message.content} className="upload-card-image" />
          )}
          <div className="upload-card-info">
            <div className="upload-card-icon-inline">
              <HiOutlinePhoto size={14} />
            </div>
            <div className="upload-card-name">{message.content}</div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Normal Text Message ----------
  return (
    <div className={`message-row ${isUser ? "user" : "bot"}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "bot-avatar"}`}>
        {isUser ? "👤" : "✦"}
      </div>
      <div className={`message-bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}
