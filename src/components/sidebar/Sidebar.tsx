import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import logo from "../../assets/logo/logo.png";
import avatar from "../../assets/ava/ava1.jpg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Btn_logout from "../button/btn_logout/Btn_logout";
import { auth } from "../../services/firebase";
import { AppDispatch } from "../../app/store";
import { useDispatch } from "react-redux";
import { fetchAccountByEmail } from "../../features/Account/accountSlice";
interface Account {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  avatar: string;
  birthday?: string;
  gender?: string;
  biography?: string;
}
interface NavLink {
  name: string;
  path: string;
  icon: React.ReactNode;
}
const navLinks: NavLink[] = [
  {
    name: "HOME",
    path: "/home",
    icon: <i className="bi bi-house-heart-fill"></i>,
  },
  {
    name: "EXPLORE",
    path: "/explore",
    icon: <i className="bi bi-search-heart-fill"></i>,
  },
  {
    name: "MESSAGES",
    path: "/messages",
    icon: <i className="bi bi-chat-heart-fill"></i>,
  },
  {
    name: "NOTIFICATIONS",
    path: "/notifications",
    icon: <i className="bi bi-heart-fill"></i>,
  },
  {
    name: "SETTING",
    path: "/setting",
    icon: <i className="bi bi-gear-fill"></i>,
  },
];
const Sidebar = () => {
  const dispatch: AppDispatch = useDispatch();

  const { pathname } = useLocation();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  const navigate = useNavigate();
  const handleMenuClick = (name: string) => {
    setActiveMenu(name);
    setHoveredMenu(null);
  };

  const isActive = (item: NavLink) => {
    return pathname === item.path || activeMenu === item.name;
  };
  const [formState, setFormState] = useState<Account>({
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    avatar: "",
    birthday: "",
    gender: "",
    biography: "",
  });
  useEffect(() => {
    const fetchAccount = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        try {
          const accountData = await dispatch(
            fetchAccountByEmail(currentUser.email)
          ).unwrap();
          setFormState(accountData);
          // setProfilePic(accountData.avatar || ava1);
          console.log(accountData.avatar);
        } catch (error) {
          console.error("Error fetching account:", error);
        }
      }
    };
    fetchAccount();
  }, [dispatch]);

  const Logout = () => {
    navigate("/");
  };
  const showAccountPage = () => {
    navigate(`/accounts/${formState.id}`);
  };
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img
            src={logo}
            style={{ width: "160px", height: "90px" }}
            alt="Logo"
          />
        </div>
        <div className="side__avatar__main d-flex flex-column align-items-center">
          <img
            src={formState.avatar}
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
            onClick={showAccountPage}
          />
          <div className="side__avatar__name">{formState.username}</div>
        </div>
        <div className="nav-links">
          {navLinks.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredMenu(item.name)}
              onMouseLeave={() => setHoveredMenu(null)}
              className={`nav-item-container ${
                hoveredMenu === item.name || isActive(item) ? "hovered" : ""
              }`}
            >
              <Link
                to={item.path}
                className={`nav-link ${isActive(item) ? "active" : ""}`}
                onClick={() => handleMenuClick(item.name)}
              >
                <div className="nav-link-item">
                  <div
                    className={`nav-item ${
                      isActive(item) ? "active-item" : ""
                    }`}
                  >
                    {item.icon && (
                      <span className="nav-icon" style={{ marginLeft: "20px" }}>
                        {item.icon}
                      </span>
                    )}
                    {window.innerWidth >= 960 && (
                      <p
                        className="sidebar-name"
                        style={{ marginLeft: "10px", marginBottom: "0" }}
                      >
                        {item.name}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="sidebar__btn" onClick={Logout}>
          <Btn_logout />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
