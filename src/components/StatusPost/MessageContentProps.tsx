import React from "react";

interface MessageContentProps {
  image: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ image }) => {
  return (
    <div className="">
      <img
        src={image}
        alt="message"
        className="img-fluid rounded mb-2"
        style={{ maxWidth: "400px" }}
      />
    </div>
  );
};

export default MessageContent;
