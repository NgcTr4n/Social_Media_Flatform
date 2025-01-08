import React from "react";
import "./FilledButton.css";

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
  return (
    <div className="btn-form">
      <button onClick={onClick} type={type} className="btn-filled">
        {children || btn_name}
      </button>
    </div>
  );
};

export default FilledButton;
