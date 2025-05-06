import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { formatDateHeader } from "../lib/formatDateHeader";
import { ChevronDown } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage._id !== lastMessageId &&
        lastMessage.senderId !== authUser._id
      ) {
        setNewMessageAlert(true);
        setLastMessageId(lastMessage._id);
      }

      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleScrollToBottom = () => {
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    setNewMessageAlert(false);
  };

  const handleScroll = () => {
    if (messageEndRef.current) {
      const scrollPosition = messageEndRef.current.getBoundingClientRect().top;
      if (scrollPosition < window.innerHeight) {
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  };

  const showNotification = (message) => {
    if (
      document.visibilityState !== "visible" &&
      Notification.permission === "granted"
    ) {
      new Notification(`New message from ${selectedUser.fullName || "User"}`, {
        body: message.text || "📎 File Attachment",
        icon: selectedUser.profilePic || "/avatar.png",
      });
    }
  };

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const groupedMessages = messages.reduce((groups, message) => {
    const dateKey = formatDateHeader(message.createdAt);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});

  const highlightMentionsAndLinks = (text) => {
    const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return text.split(mentionRegex).map((part, index) => {
      if (mentionRegex.test(part)) {
        return (
          <span key={index} className="text-blue-500 font-bold">
            {part}
          </span>
        );
      } else if (urlRegex.test(part)) {
        const url = part.startsWith("www.") ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleEditMessage = (messageId, text) => {
    setEditingMessage(messageId);
    setEditText(text);
  };

  const handleSaveEdit = () => {
    editMessage(editingMessage, editText);  // Call editMessage from useChatStore
    setEditingMessage(null);
    setEditText("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      {newMessageAlert && (
        <div
          className="bg-blue-500 text-white text-center py-2"
          onClick={handleScrollToBottom}
          style={{
            cursor: "pointer",
          }}
        >
          New message arrived! Click to scroll down.
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          Object.entries(groupedMessages).map(([dateLabel, dayMessages]) => (
            <div key={dateLabel}>
              <div className="text-center text-xs text-gray-500 my-4">
                {dateLabel}
              </div>
              {dayMessages.map((message) => {
                const isOwnMessage = message.senderId === authUser._id;

                return (
                  <div
                    key={message._id}
                    className={`chat ${isOwnMessage ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-image avatar">
                      <div className="size-10 rounded-full border">
                        <img
                          src={
                            isOwnMessage
                              ? authUser.profilePic || "/avatar.png"
                              : selectedUser.profilePic || "/avatar.png"
                          }
                          alt="profile"
                        />
                      </div>
                    </div>

                    <div className="chat-header mb-1">
                      <time className="text-xs opacity-50 ml-1">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>

                    <div
                      className="chat-bubble flex flex-col max-w-xs"
                      style={{
                        backgroundColor: isOwnMessage
                          ? authUser.themeColor || "#dcfce7"
                          : selectedUser.themeColor || "#000000",
                      }}
                    >
                      {message.fileType === "image" && message.fileUrl && (
                        <img
                          src={message.fileUrl}
                          alt="Attachment"
                          className="rounded-md mb-2 max-w-full sm:max-w-[200px]"
                        />
                      )}

                      {message.fileType === "video" && message.fileUrl && (
                        <video
                          controls
                          className="rounded-md mb-2 max-w-full sm:max-w-[250px]"
                        >
                          <source src={message.fileUrl} />
                          Your browser does not support the video tag.
                        </video>
                      )}

                      {message.fileType === "doc" && message.fileUrl && (
                        <a
                          href={message.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline mb-2 text-sm"
                        >
                          📎 {message.fileUrl.split("/").pop()}
                        </a>
                      )}

                      {message.text && (
                        <p>{highlightMentionsAndLinks(message.text)}</p>
                      )}

                      {isOwnMessage && (
                        <div className="flex space-x-2 text-xs mt-2">
                          <button
                            onClick={() =>
                              handleEditMessage(message._id, message.text)
                            }
                            className="text-blue-500"
                          >
                            Edit
                          </button>
                        </div>
                      )}

                      {editingMessage === message._id && (
                        <div className="flex mt-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="border rounded p-2 mr-2 flex-1"
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="bg-blue-500 text-white p-2 rounded"
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messageEndRef}></div>
      </div>

      {showScrollButton && (
        <button
          onClick={handleScrollToBottom}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition transform"
          title="Scroll to bottom"
        >
          <ChevronDown size={24} />
        </button>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
