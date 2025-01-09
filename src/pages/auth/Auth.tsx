import React, { useEffect, useRef, useState } from "react";
import logo from "../../assets/logo/logo_main.png";
import logo2 from "../../assets/logo/logo_main_2.png";

import "./Auth.css";
import FilledButton from "../../components/button/filled_button/FilledButton";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../app/store";
import { useDispatch } from "react-redux";
import { auth, storage } from "../../services/firebase";
import { uploadData } from "../../features/Account/accountSlice";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import ava1 from "../../assets/ava/ava1.jpg";
import SignUp from "./Signup";
import SignIn from "./SignIn";
import { useTheme } from "../../contexts/ThemeContext";

interface Heart {
  id: number;
  left: string;
  top: string;
  size: string;
  animationDuration: string;
  color: string;
}

const Auth = () => {
  const { theme } = useTheme();
  const dispatch: AppDispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [logoFade, setLogoFade] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [isSignUp, setIsSignUp] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
      setLogoFade(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const colors = ["#FEDEEC", "#DBDAEC", "#FDEDF5", "#FDBFDA", "#E9EDF6"];
  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const createHeart = () => {
    const newHeart = {
      id: Math.random(),
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${20 + Math.random() * 30}px`,
      animationDuration: `${5 + Math.random() * 5}s`,
      color: getRandomColor(),
    };
    setHearts((prevHearts) => [...prevHearts, newHeart]);

    setTimeout(() => {
      setHearts((prevHearts) =>
        prevHearts.filter((heart) => heart.id !== newHeart.id)
      );
    }, parseFloat(newHeart.animationDuration) * 1000);
  };

  useEffect(() => {
    const heartInterval = setInterval(() => createHeart(), 1000);
    return () => clearInterval(heartInterval);
  }, []);

  useEffect(() => {
    if (formRef.current) {
      const height = isSignUp ? `${formRef.current.scrollHeight}px` : "600px"; // Adjust height for SignUp
      formRef.current.style.height = height;
    }
  }, [isSignUp]);

  return (
    <div
      className={`signin ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      <img
        src={theme === "dark" ? logo2 : logo}
        alt="Logo"
        className={`logo ${logoFade ? "fade-zoom-out" : ""}`}
      />
      <div className="form-container" ref={formRef}>
        <img
          src={theme === "dark" ? logo2 : logo}
          alt="Logo"
          className={`logo_form ${logoFade ? "fade-out" : ""}`}
        />
        {showForm && (
          <div>
            <div className="hearts">
              {hearts.map((heart) => (
                <div
                  key={heart.id}
                  className="heart"
                  style={{
                    left: heart.left,
                    top: heart.top,
                    width: heart.size,
                    height: heart.size,
                    animationDuration: heart.animationDuration,
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="119"
                    height="104"
                    viewBox="0 0 119 104"
                    fill="none"
                  >
                    <g filter="url(#filter0_f_23_784)">
                      <path
                        d="M99.5621 22.2043C82.6497 7.02646 65.7734 19.3133 59.4493 27.3539V88.6072C59.4493 89.4203 120.703 41.1765 99.5621 22.2043Z"
                        fill={heart.color} // Apply random color
                      />
                      <path
                        d="M19.4379 22.2043C36.3503 7.02646 53.2266 19.3133 59.5507 27.3539V88.6072C59.5507 89.4203 -1.70259 41.1765 19.4379 22.2043Z"
                        fill={heart.color} // Apply random color
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_f_23_784"
                        x="0"
                        y="0"
                        width="119"
                        height="103.617"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        />
                        <feGaussianBlur
                          stdDeviation="7.5"
                          result="effect1_foregroundBlur_23_784"
                        />
                      </filter>
                    </defs>
                  </svg>
                </div>
              ))}
            </div>
            {isSignUp ? (
              <div className="signup-form">
                <SignUp />
              </div>
            ) : (
              <div className="signin-form">
                <SignIn />
              </div>
            )}
            <div className="toggle-form-container">
              <p
                style={{
                  color: theme === "dark" ? "#B8C9F4" : "#FDBFDA",
                }}
              >
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <Link
                  to="#"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ color: "#FF8B8B", marginLeft: "5px" }}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
