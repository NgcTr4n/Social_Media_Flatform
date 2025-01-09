import React from "react";
import "./Btn_logout.css";
import { useTheme } from "../../../contexts/ThemeContext";
const Btn_logout = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`btn_logout ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      <button className="btn">Logout</button>
    </div>
  );
};

export default Btn_logout;
