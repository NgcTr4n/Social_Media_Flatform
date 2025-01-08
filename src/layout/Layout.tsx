import { ReactNode } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/header/Header";
import { CSSTransition } from "react-transition-group";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
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
