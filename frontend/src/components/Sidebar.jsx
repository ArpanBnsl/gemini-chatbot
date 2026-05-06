import { HiOutlineChatBubbleLeftRight, HiOutlineTrash } from "react-icons/hi2";
import { IoAddOutline } from "react-icons/io5";

export default function Sidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">✦</div>
          <h1>Gemini Chat</h1>
        </div>
        <button id="new-chat-btn" className="new-chat-btn" onClick={onNewChat}>
          <IoAddOutline size={18} />
          New Chat
        </button>
      </div>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            <p>No conversations yet.</p>
            <p style={{ marginTop: 4 }}>Start a new chat to begin!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              id={`chat-item-${chat.id}`}
              className={`chat-list-item ${chat.id === activeChatId ? "active" : ""}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="chat-list-item-icon">
                <HiOutlineChatBubbleLeftRight />
              </div>
              <div className="chat-list-item-text">
                <div className="chat-list-item-title">{chat.title}</div>
                <div className="chat-list-item-meta">
                  {chat.message_count} message{chat.message_count !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                className="chat-list-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                title="Delete chat"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
