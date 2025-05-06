import { X } from "lucide-react";

const MessageItem = ({ message, removeMessage }) => {
  return (
    <div className="message-item mb-4 flex items-start">
      <div className="message-content">
        {message.text && <p>{message.text}</p>}

        {message.fileUrl && message.fileType === "image" && (
          <img
            src={message.fileUrl}
            alt="Message attachment"
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}

        {message.fileUrl && message.fileType === "video" && (
          <video controls className="w-32 h-20 object-cover rounded-lg">
            <source src={message.fileUrl} />
          </video>
        )}

        {message.fileUrl && message.fileType === "pdf" && (
          <a href={message.fileUrl} download>
            📎 {message.fileUrl} (PDF) - Download
          </a>
        )}

        {message.fileUrl && message.fileType === "doc" && (
          <span>📎 {message.fileUrl}</span>
        )}
      </div>

      <button onClick={() => removeMessage(message._id)} className="text-red-500">
        <X size={14} />
      </button>
    </div>
  );
};

export default MessageItem;
