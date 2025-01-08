import React from "react";
import "./CreateNewButton.css";

interface ButtonProps {
  name: string;
  purpose: string;
  link: string;
}

const CreateNewButton: React.FC<ButtonProps> = ({ name, purpose, link }) => {
  return (
    <div className="btn-formcreate">
      <div className="btn-formcreate">
        {name} <a href={link}>{purpose}</a>
      </div>
    </div>
  );
};

export default CreateNewButton;
