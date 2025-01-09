import { ReactNode } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import { CSSTransition } from "react-transition-group";
import { useTheme } from "../contexts/ThemeContext"; // Import useTheme
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme } = useTheme(); // Lấy theme từ context

  return (
    <div
      className={`layout-container ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      {" "}
      {/* Áp dụng theme vào container */}
      <Sidebar />
      <div className="content">
        <Header />
        <div className="main-content">
          <CSSTransition
            in={true}
            appear={true}
            timeout={300}
            classNames="fade"
          >
            <div>{children}</div>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
};

export default Layout;
