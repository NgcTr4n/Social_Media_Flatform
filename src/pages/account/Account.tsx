import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import ava1 from "../../assets/ava/ava1.jpg";
import "./Account.css";
import { auth } from "../../services/firebase";
import { AppDispatch } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAccountByEmail,
  updateAccount,
} from "../../features/Account/accountSlice";
import { fetchUser, updateUser } from "../../features/Account/userSlice";
import { useAppSelector } from "../../hooks/hooks";
import { useTheme } from "../../contexts/ThemeContext";

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

const Account = () => {
  const { theme } = useTheme();

  const dispatch: AppDispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null); // Store the avatar as string (URL)
  const { user, loading } = useAppSelector((state) => state.user);
  const { account, loading: loadingAccount } = useAppSelector(
    (state) => state.account
  );
  const [editId, setEditId] = useState<string | null>(null);

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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);

  const isPasswordValid = formState.password.length >= 8;
  const isRePasswordMatching = formState.password === formState.confirmPassword;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email);
  useEffect(() => {
    const fetchAccount = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        try {
          const accountData = await dispatch(
            fetchAccountByEmail(currentUser.email)
          ).unwrap();
          setFormState(accountData);
          setProfilePic(accountData.avatar || ava1);
          console.log(accountData.avatar);
        } catch (error) {
          console.error("Error fetching account:", error);
        }
      }
    };
    fetchAccount();
  }, [dispatch]);

  const handleSave = async () => {
    // if (!isEmailValid || !isPasswordValid || !isRePasswordMatching) {
    //   alert("Please ensure all fields are correctly filled!");
    // } else {
    //   alert("Profile saved successfully!");
    // }
    try {
      // Update user and account data
      await dispatch(updateAccount(formState)).unwrap();
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePic(result); // Update state with new avatar preview
        setFormState((prevState) => ({
          ...prevState,
          avatar: result, // Update formState with the new avatar
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Layout>
      <div className="container" style={{ marginTop: "100px" }}>
        <Card
          style={{
            padding: "20px",
            height: "100%",
            border: "none",
            backgroundColor: theme === "light" ? "#FEF9FC" : "#F3F3FF",
            borderRadius: "20px",
            marginBottom: "50px",
            boxShadow:
              theme === "light"
                ? "#FDEDF5 0px 8px 24px, #FDEDF5 0px 16px 56px,#fff 0px 24px 80px"
                : "#B8C9F4 0px 8px 24px, #B8C9F4 0px 16px 56px,#fff 0px 24px 80px",
          }}
        >
          <div className="card_account_header">
            <div className="card_account_img" style={{ position: "relative" }}>
              <img
                src={formState.avatar} // Use profilePic if available, otherwise fallback to ava1
                alt="Profile"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="profilePicUpload"
                onChange={handleProfilePicChange}
              />
              <label htmlFor="profilePicUpload" className="camera_icon">
                <i className="bi bi-camera-fill"></i>
              </label>
            </div>
          </div>
          <Row className="mt-5">
            <Col xs="5">
              <h3
                className="card_account_label"
                style={{
                  color: theme === "light" ? "#FDBFDA" : "#B8C9F4",
                }}
              >
                Personal Information
              </h3>
              <hr className="card_line" />
            </Col>
            <Col xs="7">
              <Form className="account-form">
                <Form.Group>
                  <Form.Label className="account_label">
                    Username <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="NgcTr4n02"
                    value={formState.username || ""}
                    onChange={(e) =>
                      setFormState({ ...formState, username: e.target.value })
                    }
                    className="account-input-field"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="account_label">
                    Birthday <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={formState.birthday}
                    onChange={(e) =>
                      setFormState({ ...formState, birthday: e.target.value })
                    }
                    className="account-input-field"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label className="account_label">
                    Gender <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <div>
                    <Form.Check
                      inline
                      label="Male"
                      type="radio"
                      name="gender"
                      id="male"
                      checked={formState.gender === "male"}
                      onChange={() =>
                        setFormState({ ...formState, gender: "male" })
                      }
                    />
                    <Form.Check
                      inline
                      label="Female"
                      type="radio"
                      name="gender"
                      id="female"
                      checked={formState.gender === "female"}
                      onChange={() =>
                        setFormState({ ...formState, gender: "female" })
                      }
                    />
                    <Form.Check
                      inline
                      label="Other"
                      type="radio"
                      name="gender"
                      id="other"
                      checked={formState.gender === "other"}
                      onChange={() =>
                        setFormState({ ...formState, gender: "other" })
                      }
                    />
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="account_label">
                    Biography <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter your biography"
                    value={formState.biography}
                    onChange={(e) =>
                      setFormState({ ...formState, biography: e.target.value })
                    }
                    className="account-input-field"
                  />
                </Form.Group>
              </Form>
              <button
                className={`account_btn mt-3 ${
                  theme === "dark" ? "dark-theme" : "light-theme"
                }`}
                onClick={handleSave}
              >
                Save
              </button>
            </Col>
          </Row>
          {/* <Row className="mt-5">
            <Col xs={5}>
              <div>
                <h3 className="card_account_label">E-mail & Password</h3>
                <hr className="card_line" />
              </div>
            </Col>
            <Col xs="7">
              <Form className="account-form">
                <Form.Group>
                  <Form.Label className="account_label">
                    Email <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="email@gmail.com"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    className="account-input-field"
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label className="account_label">
                    Password <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <div
                    className="account_password"
                    style={{ position: "relative" }}
                  >
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formState.password}
                      onChange={(e) =>
                        setFormState({ ...formState, password: e.target.value })
                      }
                      className="account-input-field"
                    />
                    <Button
                      variant="link"
                      onClick={togglePasswordVisibility}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
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
                    </Button>
                  </div>
                </Form.Group>
                <Form.Group>
                  <Form.Label className="account_label">
                    Confirm Password <span style={{ color: "#FF8B8B" }}>*</span>
                  </Form.Label>
                  <div
                    className="account_password"
                    style={{ position: "relative" }}
                  >
                    <Form.Control
                      type={showRePassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formState.confirmPassword}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="account-input-field"
                    />
                    <Button
                      variant="link"
                      onClick={toggleRePasswordVisibility}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
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
                    </Button>
                  </div>
                </Form.Group>
                <button className="mt-3 account_btn" onClick={handleSave}>
                  Save
                </button>
              </Form>
            </Col>
          </Row> */}
        </Card>
      </div>
    </Layout>
  );
};

export default Account;
