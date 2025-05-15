import React, { useState } from "react";
import "./AssistBotHelp.css";

const AssistBotHelp = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm AssistBot. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    const reply = getBotReply(input);

    setMessages((prev) => [...prev, userMessage, { from: "bot", text: reply }]);
    setInput("");
  };

  const getBotReply = (msg) => {
    const message = msg.toLowerCase();

    if (message.includes("payroll")) {
      return "You can view your payroll under the 'Payroll' tab on the left sidebar.";
    } else if (message.includes("leave")) {
      return "To file a leave request, go to Requisition > Leave Request.";
    } else if (message.includes("password")) {
      return "If you forgot your password, you can reset it from the login page via 'Forgot Password'.";
    } else if (message.includes("hello") || message.includes("hi")) {
      return "Hello! How can I assist you today?";
    } else if (message.includes("profile")) {
      return "You can view or edit your profile under the 'Profile' section.";
    } else {
      return "I'm not sure how to help with that. Can you try rephrasing your question?";
    }
  };

  return (
    <>
      {/* AssistBot Help Banner */}
      <div className="assistbot-banner">
        <h1 className="assistbot-banner-title">ASSISTBOT HELP</h1>
      </div>

      {/* AssistBot Help Content */}
      <div className="assistbot-container">
        <h2>AssistBot Help</h2>
        <div className="chat-box">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </>
  );
};

export default AssistBotHelp;