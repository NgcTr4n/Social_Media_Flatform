import React, { useEffect, useState } from "react";
import SidebarMessage from "./SidebarMessage";
import ChatWindow from "./ChatWindow";
import "./ChatApp.css";
import gif_loading from "../../assets/react/2e10c08f3afcc5f6286134b4c8e8cf19.gif";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
  addMessagesToContact,
  fetchAccountById,
} from "../../features/Account/accountSlice";
import { useTheme } from "../../contexts/ThemeContext";

interface Message {
  text: string;
  sender: boolean;
  timestamp: string;
}

interface Contact {
  name: string;
  avatar: string;
  messages: Message[];
}
interface Account {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  avatar: string;
  birthday?: string;
  gender?: string;
  biography?: string;
  followers?: string[];
  following?: string[];
  contacts?: { [key: string]: Contact };
  messages?: Message[];
}
const ChatApp: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isFetchingContacts, setIsFetchingContacts] = useState<boolean>(false);

  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser && currentUser.following && !isFetchingContacts) {
        if (contacts.length === 0) {
          setIsFetchingContacts(true);
          try {
            const fetchedContacts: Contact[] = [];

            for (const followingId of currentUser.following) {
              const contactData = await dispatch(
                fetchAccountById(followingId)
              ).unwrap();

              if (
                contactData.followers &&
                contactData.followers.includes(currentUser.id)
              ) {
                fetchedContacts.push({
                  name: contactData.username,
                  avatar: contactData.avatar,
                  messages:
                    contactData.messages?.map((msg) => ({
                      ...msg,
                      sender: msg.sender, // No need to compare, just use the boolean directly
                    })) ?? [],
                });
              }
            }

            setContacts(fetchedContacts);
          } catch (error) {
            console.error("Error fetching contacts:", error);
          } finally {
            setIsFetchingContacts(false);
          }
        }
      }
    };

    fetchContacts();
  }, [currentUser, dispatch, isFetchingContacts, contacts.length]);

  if (!currentUser) {
    return <div>No user logged in</div>;
  }

  const handleSendMessage = async (newMessage: string) => {
    if (selectedContact) {
      const updatedContact = { ...selectedContact };
      updatedContact.messages.push({
        text: newMessage,
        sender: true,
        timestamp: new Date().toISOString(),
      });
      setSelectedContact(updatedContact);

      try {
        const contactId = selectedContact.name;

        const messageData = {
          text: newMessage,
          sender: true,
          timestamp: new Date().toISOString(),
        };

        console.log("Dispatching message:", messageData); // Log the message being dispatched

        const resultAction = await dispatch(
          addMessagesToContact({
            currentUserId: currentUser.id,
            contactId,
            messages: [messageData],
          })
        );

        if (addMessagesToContact.rejected.match(resultAction)) {
          console.error("Error dispatching action:", resultAction.payload);
        } else {
          console.log("Message sent successfully!");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
  };
  return (
    <div className="chat-app">
      {contacts.length > 0 ? (
        <SidebarMessage
          contacts={contacts}
          onSelectContact={handleSelectContact}
        />
      ) : (
        <div>No contacts available</div>
      )}

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
