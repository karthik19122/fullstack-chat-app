import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { uploadFile } from "./FileUpload";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadFile(file);
      const fileUrl = response?.fileUrl;

      let type = "doc";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type === "application/pdf") type = "pdf";

      setFilePreview(fileUrl || file.name);
      setFileType(type);
      setText("");
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    }
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !filePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        fileUrl: filePreview,
        fileType: fileType,
        scheduleTime: isScheduled && scheduleTime ? scheduleTime.toISOString() : null,
      });

      if (isScheduled && scheduleTime) {
        toast.success(`Message scheduled for ${scheduleTime.toLocaleString()}`);
      } else {
        toast.success("Message sent!");
      }

      setText("");
      removeFile();
      setShowEmojiPicker(false);
      setIsTyping(false);
      setScheduleTime(null);
      setIsScheduled(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!isTyping) setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <div className="p-4 w-full">
      {/* Media Preview Blocks */}
      {filePreview && fileType === "image" && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={filePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {filePreview && fileType === "video" && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <video
              src={filePreview}
              controls
              className="w-32 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {filePreview && fileType === "doc" && (
        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
          <span>📎 {filePreview}</span>
          <button onClick={removeFile} className="text-red-500">
            <X size={14} />
          </button>
        </div>
      )}

      {filePreview && fileType === "pdf" && (
        <div className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
          <a href={filePreview} download className="text-blue-500">
            📎 {filePreview} (PDF) - Download
          </a>
          <button onClick={removeFile} className="text-red-500">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="mb-2 text-sm text-zinc-400">User is typing...</div>
      )}

      {/* Scheduling Option */}
      <div className="mb-2 flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={() => setIsScheduled(!isScheduled)}
          />
          Schedule Message
        </label>

        {isScheduled && (
          <DatePicker
            selected={scheduleTime}
            onChange={(date) => setScheduleTime(date)}
            showTimeSelect
            timeIntervals={1}
            dateFormat="Pp"
            minDate={new Date()}
            className="input input-sm input-bordered w-full sm:w-auto"
            placeholderText="Select Date & Time"
          />
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
        <div className="flex-1 flex gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="btn btn-circle btn-sm"
          >
            <Smile size={20} />
          </button>

          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleInputChange}
          />

          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !filePreview}
        >
          <Send size={22} />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
