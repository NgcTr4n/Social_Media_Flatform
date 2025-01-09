import React, { useState, useEffect } from "react";
import "./ChatApp.css";
import ava1 from "../../assets/ava/ava1.jpg";
import { useTheme } from "../../contexts/ThemeContext";

interface Contact {
  name: string;
  avatar: string;
  messages: { text: string; sender: boolean; timestamp: string }[];
}

interface SidebarMessageProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

const SidebarMessage: React.FC<SidebarMessageProps> = ({
  contacts,
  onSelectContact,
}) => {
  const { theme } = useTheme();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleIndex, setVisibleIndex] = useState<Set<number>>(new Set());
  const [scrollDirection, setScrollDirection] = useState<string | null>(null);

  // Handle scroll direction logic
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    const direction = currentScrollY > document.body.scrollTop ? "down" : "up";
    setScrollDirection(direction);
    document.body.scrollTop = currentScrollY; // Reset the scroll position
  };

  // Observe elements entering or leaving the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.id);
          if (entry.isIntersecting) {
            // Add the element to the visible state to trigger animation
            setVisibleIndex((prev) => new Set(prev).add(index));
          } else {
            // Remove the element from visible state when it goes out of view
            setVisibleIndex((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the element is visible
    );

    const contactElements = document.querySelectorAll(".contact");
    contactElements.forEach((element) => observer.observe(element));

    // Handle scroll events
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleContactClick = (index: number) => {
    setActiveIndex(index);
    onSelectContact(contacts[index]);
  };

  return (
    <div className="sidebar-message">
      <div className="contacts">
        {contacts.map((contact, index) => (
          <div
            key={index}
            id={String(index)}
            className={`contact ${
              theme === "dark" ? "dark-theme" : "light-theme"
            } ${activeIndex === index ? "active" : ""} 
              // ${visibleIndex.has(index) ? "visible" : ""} 
              // ${scrollDirection === "down" ? "scroll-down" : ""}
              // ${scrollDirection === "up" ? "scroll-up" : ""}
            `}
            onClick={() => handleContactClick(index)}
          >
            <div className="avatar">
              <img
                src={contact.avatar}
                alt={contact.name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  boxShadow: "0px 4px 4px 0px #FFF",
                }}
              />
            </div>
            <div className="name">{contact.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarMessage;
