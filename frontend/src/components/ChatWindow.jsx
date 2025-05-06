// src/components/ChatWindow.js
import React from "react";

const ChatWindow = ({ messages }) => {
    return (
      <div className="chat-window">
        {messages.map((message, index) => (
          <div key={index} className="chat-message">
            {/* Show text if available */}
            {message.text && <p>{message.text}</p>}
  
            {/* Show file preview or download link */}
            {message.fileUrl && (
              <>
                {message.fileType === "pdf" && (
                  <div>
                    <a href={message.fileUrl} download target="_blank" rel="noopener noreferrer">
                      Download PDF
                    </a>
                    <iframe
                      src={message.fileUrl}
                      width="500"
                      height="400"
                      style={{ border: "1px solid #ccc", marginTop: "10px" }}
                      title="PDF Preview"
                    />
                  </div>
                )}
                {["jpg", "jpeg", "png"].includes(message.fileType) && (
                  <img
                    src={message.fileUrl}
                    alt="Uploaded Image"
                    width="300"
                    height="auto"
                    style={{ marginTop: "10px" }}
                  />
                )}
                {message.fileType === "mp4" && (
                  <video width="300" height="200" controls style={{ marginTop: "10px" }}>
                    <source src={message.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  export default ChatWindow;
  