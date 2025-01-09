// src/pages/auth/SignUp.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  getAuth,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth } from "../../services/firebase";
import ava from "../../assets/ava/avatar.png";
import { useDispatch } from "react-redux";
import { uploadData } from "../../features/Account/accountSlice";
import FilledButton from "../../components/button/filled_button/FilledButton";
import image_upload from "../../assets/logo/image-upload.png";
import "./Auth.css";
import { AppDispatch } from "../../app/store";
import { useAppSelector } from "../../hooks/hooks";
import ImageUploader from "../../components/imageupload/ImageUploader";
import logo_google from "../../assets/logo/logo_gg.png";
import { useTheme } from "../../contexts/ThemeContext";

const SignUp = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useAppSelector((state) => state.user);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("Drop your image here");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const urlToFile = async (
    url: string,
    filename: string,
    mimeType: string
  ): Promise<File> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  };
  const handleGoogleSignUp = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (avatar) {
        dispatch(
          uploadData({
            username,
            email,
            password,
            confirmPassword,
            avatar,
          })
        );
      }

      // console.log("Uploading data:", dataToUpload);
      // dispatch(uploadData(dataToUpload));

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAvatar(null);

      navigate("/home");
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Đăng ký thất bại: " + error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAvatar(selectedFile);
      setPreviewImage(null);
      setLabelText("Processing...");

      // Reset animation state
      setIsAnimating(false);
      setTimeout(() => {
        setIsAnimating(true);

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 300;
          const ctx = canvas.getContext("2d");

          canvas.width = size;
          canvas.height = size;

          // Calculate scale and position to center the image
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;

          ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);

          const resizedImageUrl = canvas.toDataURL("image/jpeg");
          setPreviewImage(resizedImageUrl);
          setLabelText("Image uploaded successfully");
          setIsAnimating(false);
        };

        img.onerror = () => {
          setLabelText("Failed to load image. Try again.");
          setIsAnimating(false); // End animation on error
        };

        img.src = URL.createObjectURL(selectedFile);
      }, 10); // Short delay to allow state reset
    } else {
      setPreviewImage(null);
      setLabelText("Drop your image here");
      setIsAnimating(false);
    }
  };

  return (
    <div className="signup">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-username">
          <label className="label">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
        </div>
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
        <div className="login-form-password">
          <label className="label">Confirm Password</label>
          <div
            className="password-input-container"
            style={{ position: "relative", width: "100%" }}
          >
            <input
              type={showRePassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={toggleRePasswordVisibility}
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
              {showRePassword ? (
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
          {/* <div>
            <input
              type="file"
              onChange={handleFileChange}
              className="custom-file-upload"
            />
          </div>{" "} */}
        </div>
        <div className="custom-upload">
          <input
            type="file"
            id="fileInput"
            onChange={handleFileChange}
            accept="image/*"
          />
          <label htmlFor="fileInput" className="upload-label">
            <div
              className={`image-container ${
                isAnimating ? "fade-out" : "fade-in"
              }`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Uploaded Preview"
                  className="upload-preview"
                />
              ) : (
                <img
                  src={image_upload}
                  alt="Upload Icon"
                  className="upload-icon"
                />
              )}
            </div>
            <span>{labelText}</span>
          </label>
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
        <FilledButton type="submit">Sign Up</FilledButton>
        <div className="google-signup-container">
          <button onClick={handleGoogleSignUp} className="google-signin-button">
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

export default SignUp;
