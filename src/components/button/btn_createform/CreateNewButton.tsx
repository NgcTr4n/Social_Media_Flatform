import React from "react";
import "./CreateNewButton.css";
import { useTheme } from "../../../contexts/ThemeContext";

interface ButtonProps {
  name: string;
  purpose: string;
  link: string;
}

const CreateNewButton: React.FC<ButtonProps> = ({ name, purpose, link }) => {
  const { theme } = useTheme();
  return (
    <div className="btn-formcreate">
      <div
        className={`btn-formcreate ${
          theme === "dark" ? "dark-theme" : "light-theme"
        }`}
      >
        {name} <a href={link}>{purpose}</a>
      </div>
    </div>
  );
};

export default CreateNewButton;
