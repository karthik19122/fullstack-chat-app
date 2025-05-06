import { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // To simulate bot typing

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    const lower = input.toLowerCase();

    let reply = "Sorry, I didn’t understand. Please try asking something else.";

    if (
      lower.includes("login") ||
      lower.includes("log in")
    ) {
      reply = "Make sure your username and password are correct. Try resetting your password if needed.";
    } else if (
      lower.includes("language")
    ) {
      reply = "You can change the language from the top-right corner of the app.";
    } else if (
      lower.includes("chat not working") ||
      lower.includes("can't send") ||
      lower.includes("not sending") ||
      lower.includes("message issue")
    ) {
      reply = "Try refreshing the page. If the issue persists, check your internet connection.";
    } else if (
      lower.includes("report") || lower.includes("abuse")
    ) {
      reply = "Click on the user's profile and select 'Report'.";
    } else if (
      lower.includes("delete account") ||
      lower.includes("remove my account")
    ) {
      reply = "Go to Settings > Account > Delete Account.";
    } else if (
      lower.includes("how to use") || lower.includes("help")
    ) {
      reply = "To start, select a user from the sidebar and start chatting!";
    }

    // Show typing indicator before replying
    setIsTyping(true);
    
    // Simulate a bot delay (typing effect)
    setTimeout(() => {
      const botMessage = { from: "bot", text: reply };
      setMessages([...messages, userMessage, botMessage]);
      setInput("");
      setIsTyping(false);  // Stop typing indicator once response is shown
    }, 1000);  // Delay response by 1 second
  };

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-2">Help Assistant 🤖</h2>
      <div className="flex-1 overflow-y-auto mb-2 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-sm p-2 rounded ${msg.from === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="text-sm text-gray-500">Bot is typing...</div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="border rounded px-2 py-1 flex-1"
          placeholder="Ask me something..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;


