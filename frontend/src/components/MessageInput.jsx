import { useRef, useState } from "react";
import { HiOutlineDocumentText, HiOutlinePhoto, HiOutlinePaperAirplane } from "react-icons/hi2";

export default function MessageInput({
  onSendMessage,
  onUploadDocument,
  onUploadImage,
  disabled,
  isLoading,
  uploadingDoc,
  uploadingImg,
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
  const docInputRef = useRef(null);
  const imgInputRef = useRef(null);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || disabled) return;
    onSendMessage(msg);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadDocument(file);
    e.target.value = "";
  };

  const handleImgChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = "";
  };

  return (
    <div className="input-area">
      <div className="input-row">
        <div className="input-actions">
          {/* Document Upload Button */}
          <button
            id="upload-document-btn"
            className={`input-action-btn ${uploadingDoc ? "uploading" : ""}`}
            onClick={() => docInputRef.current?.click()}
            title="Upload Document (PDF/TXT)"
            disabled={disabled || uploadingDoc}
          >
            {uploadingDoc ? <div className="spinner" /> : <HiOutlineDocumentText />}
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: "none" }}
            onChange={handleDocChange}
          />

          {/* Image Upload Button */}
          <button
            id="upload-image-btn"
            className={`input-action-btn ${uploadingImg ? "uploading" : ""}`}
            onClick={() => imgInputRef.current?.click()}
            title="Upload Image (PNG/JPG)"
            disabled={disabled || uploadingImg}
          >
            {uploadingImg ? <div className="spinner" /> : <HiOutlinePhoto />}
          </button>
          <input
            ref={imgInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            style={{ display: "none" }}
            onChange={handleImgChange}
          />
        </div>

        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            id="message-input"
            rows={1}
            placeholder="Type a message..."
            value={text}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        <button
          id="send-btn"
          className="send-btn"
          onClick={handleSend}
          disabled={!text.trim() || disabled || isLoading}
          title="Send message"
        >
          {isLoading ? <div className="spinner" /> : <HiOutlinePaperAirplane />}
        </button>
      </div>
    </div>
  );
}
