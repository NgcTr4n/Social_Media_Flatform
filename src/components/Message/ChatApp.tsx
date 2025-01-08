import React, { useState } from "react";
import SidebarMessage from "./SidebarMessage";
import ChatWindow from "./ChatWindow";
import "./ChatApp.css";
import ava1 from "../../assets/ava/ava1.jpg";
import ava2 from "../../assets/ava/ava2.jpg";
import ava3 from "../../assets/ava/ava3.jpg";
import gif_loading from "../../assets/react/sanrio-my-melody.gif";

interface Message {
  text: string;
  sender: boolean;
}

interface Contact {
  name: string;
  avatar: string;
  messages: Message[];
}

const ChatApp: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const contacts: Contact[] = [
    {
      name: "aa",
      avatar: ava3,
      messages: [
        { text: "Hello NgcTr4n02!", sender: true },
        { text: "Hi! How are you?", sender: false },
      ],
    },
    {
      name: "girlsaesthetic9350",
      avatar: ava2,
      messages: [
        { text: "Hey!", sender: true },
        { text: "How's it going?", sender: false },
      ],
    },
  ];

  const handleSendMessage = (newMessage: string) => {
    if (selectedContact) {
      const updatedContact = { ...selectedContact };
      updatedContact.messages.push({ text: newMessage, sender: true });
      setSelectedContact(updatedContact); // Update selected contact
    }
  };

  return (
    <div className="chat-app">
      <SidebarMessage
        contacts={contacts}
        onSelectContact={(contact) => setSelectedContact(contact)}
      />
      {selectedContact ? (
        <ChatWindow
          contactName={selectedContact.name}
          messages={selectedContact.messages}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="no-chat-window">
          <div className="loading-animation">
            <img
              src={gif_loading}
              alt="Hello Kitty"
              className="hello-kitty"
              style={{
                width: "300px",
              }}
            />
            <div className="hearts-loading">
              {Array.from({ length: 15 }).map((_, index) => (
                <span key={index} className="heart-loading"></span>
              ))}
            </div>
          </div>
          <p
            style={{
              marginTop: "10px",
              fontSize: "24px",
              color: "#797171",
              fontFamily: "Margarine",
            }}
          >
            Select a contact to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
