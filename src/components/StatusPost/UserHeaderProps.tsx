import React from "react";

interface UserHeaderProps {
  id: string;
  avatar: string;
  username: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ avatar, username, id }) => {
  return (
    <div className="d-flex align-items-center mb-2">
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
            color: "#FDBFDA",
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
