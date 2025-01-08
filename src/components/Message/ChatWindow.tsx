import React, { useState, useEffect, useRef } from "react";
import "./ChatApp.css";

interface Message {
  text: string;
  sender: boolean;
}

interface ChatWindowProps {
  contactName: string;
  messages: Message[];
  onSendMessage: (newMessage: string) => void;
  className?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  contactName,
  messages,
  onSendMessage,
  className = "",
}) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when messages change or a new message is sent
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = chatMessagesRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className={`chat-window ${className}`}>
      {/* Header */}
      <div
        className="chat-window-header"
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        <div className="chat-header">
          <span>{contactName}</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        className="chat-messages"
        ref={chatMessagesRef} // Reference to the message container
      >
        {messages.map((message, index) => (
          <div
            key={message.text + index}
            className={`message-chat ${message.sender ? "sender" : "receiver"}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Typing..."
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage(); // Send on Enter key
          }}
        />
        <button onClick={handleSendMessage}>SEND</button>
      </div>

      {/* Scroll to bottom element */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;
