import React from "react";
import "./FilledButton.css";
import { useTheme } from "../../../contexts/ThemeContext";

interface ButtonProps {
  btn_name?: string; // Optional if needed
  onClick?: () => void; // Optional if needed
  type?: "button" | "submit" | "reset"; // Type for the button
  children: React.ReactNode; // Add this line to include children
}

const FilledButton: React.FC<ButtonProps> = ({
  btn_name,
  onClick,
  type,
  children,
}) => {
  const { theme } = useTheme(); // Lấy theme từ context

  return (
    <div
      className={`btn-form ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      <button onClick={onClick} type={type} className="btn-filled">
        {children || btn_name}
      </button>
    </div>
  );
};

export default FilledButton;
