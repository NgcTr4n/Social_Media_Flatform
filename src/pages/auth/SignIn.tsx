import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  UserCredential,
} from "firebase/auth";
import ava from "../../assets/ava/avatar.png";

import { auth } from "../../services/firebase";
import "./Auth.css";
import FilledButton from "../../components/button/filled_button/FilledButton";
import logo_google from "../../assets/logo/logo_gg.png";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { uploadData } from "../../features/Account/accountSlice";
import { useTheme } from "../../contexts/ThemeContext";
const SignIn = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      navigate("/home"); // Redirect to home page after successful login
    } catch (err) {
      setError("Invalid email or password.");
      console.error(err);
    }
  };
  const urlToFile = async (
    url: string,
    filename: string,
    mimeType: string
  ): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  };
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;

      // Set fallback values in case `displayName` or `photoURL` is `null`
      const username = user.displayName || "Anonymous"; // Default to 'Anonymous' if null
      let avatar: File | null = null;

      // Check if photoURL exists and convert it to a File object
      if (user.photoURL) {
        console.log("photoURL:", user.photoURL);
        avatar = await urlToFile(user.photoURL, "avatar.png", "image/png"); // Convert URL to File
      } else {
        console.log("No photoURL, using default avatar.");
        avatar = new File([], ava, { type: "image/png" }); // Fallback avatar
      }

      // Dispatch user data to Redux store
      console.log("Dispatching user data:", {
        username,
        email: user.email,
        avatar,
      });
      dispatch(
        uploadData({
          username: username,
          email: user.email || "",
          avatar: avatar,
          password: "",
          confirmPassword: "",
        })
      );

      // Navigate after dispatching data
      console.log("Navigating to home...");
      navigate("/home"); // Redirect to home or dashboard
    } catch (error) {
      console.error("Error signing up with Google:", error);
      alert(
        "Google sign-up failed: " +
          (error instanceof Error ? error.message : error)
      );
    }
  };
  // const handleGoogleSignIn = async () => {
  //   const provider = new GoogleAuthProvider();
  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     const email = user.email;

  //     if (email === null) {
  //       setError("Email is not available.");
  //       return;
  //     }

  //     navigate("/home");
  //   } catch (error) {
  //     setError("Error signing in with Google.");
  //     console.error(error);
  //   }
  // };

  return (
    <div className="signin-form">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-email">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="login-form-password">
          <label className="label">Password</label>
          <div
            className="password-input-container"
            style={{ position: "relative", width: "100%" }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
              }}
            >
              {showPassword ? (
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></circle>
                  </g>
                </svg>
              ) : (
                <svg
                  width="20px"
                  height="20px"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  transform="rotate(0)"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M2 2L22 22"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818"
                      stroke="#7E7D88"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </svg>
              )}{" "}
            </button>
          </div>
        </div>
        {error && (
          <div
            style={{
              fontSize: "12px",
              color: "#FF8B8B",
              marginBottom: "5px",
              marginLeft: "4px",
            }}
          >
            {error}
          </div>
        )}{" "}
        <FilledButton type="submit">Sign In</FilledButton>{" "}
        <div className="google-signup-container">
          <button onClick={handleGoogleSignIn} className="google-signin-button">
            <img
              style={{
                objectFit: "cover",
                width: "40px",
                height: "40px",
              }}
              src={logo_google}
              alt=""
            />{" "}
            <span> Sign In with Google</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
