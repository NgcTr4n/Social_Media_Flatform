import React from "react";

interface NotificationProps {
  name: string;
  action: string;
  type: string;
}

const NotificationItem: React.FC<NotificationProps> = ({
  name,
  action,
  type,
}) => {
  return (
    <div className={`notification-item ${type}`}>
      <strong>{name}</strong>{" "}
      <span
        style={{
          marginLeft: "10px",
        }}
      >
        {action}
      </span>
    </div>
  );
};

export default NotificationItem;
