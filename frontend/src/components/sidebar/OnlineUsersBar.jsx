import { MOCK_USERS } from "../../data/mockData";
import { useChat } from "../../context/ChatContext";

export default function OnlineUsersBar() {
  const { createNewConversation } = useChat();
  const onlineUsers = MOCK_USERS.filter((u) => u.online);

  return (
    <div className="online-stories-section">
      <div className="stories-heading">
        <span>Online Now</span>
        <span style={{ color: "var(--accent-emerald)", fontSize: 11 }}>● {onlineUsers.length} Active</span>
      </div>

      <div className="stories-scroll">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="story-item"
            title={`Chat with ${user.username} (${user.preferredLanguage.toUpperCase()})`}
            onClick={() => createNewConversation(user)}
          >
            <div className="story-avatar-ring">
              <img
                src={user.avatar}
                alt={user.username}
                className="story-avatar-img"
              />
            </div>
            <span className="story-name">{user.username.split(" ")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
