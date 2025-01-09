import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface UserHeaderProps {
  id: string;
  avatar: string;
  username: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ avatar, username, id }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`header-user d-flex align-items-center mb-2 ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      <img
        src={avatar}
        alt="avatar"
        className="rounded-circle"
        style={{ width: "70px", height: "70px", objectFit: "cover" }}
      />
      <span className="ms-2 fw-bold">
        <a
          href={`/accounts/${id}`}
          style={{
            fontSize: "20px",
            marginLeft: "5px",
            color: theme === "light" ? "#FDBFDA" : "#B8C9F4",

            fontWeight: 400,
            textDecoration: "none",
            fontFamily: "Grandstander",
          }}
        >
          {username}
        </a>{" "}
      </span>
    </div>
  );
};

export default UserHeader;
