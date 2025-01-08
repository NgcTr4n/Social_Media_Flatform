import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // Style this component as needed
import FilledButton from "../../components/button/filled_button/FilledButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    // Giả sử kiểm tra email hợp lệ (có thể kiểm tra qua API hoặc giả lập)
    if (email === "name1@gmail.com") {
      // Thay đổi theo điều kiện email của bạn
      // Email hợp lệ, chuyển đến form nhập mật khẩu mới
      navigate("/resetpassword");
    } else {
      // Hiển thị thông báo lỗi nếu email không hợp lệ
      setError(true);
    }
  };

  return (
    <div className="signin">
      <div className="forgot-password">
        <h2 className="forgot-password-label">Reset Your Password</h2>
        <form onSubmit={handleResetPassword}>
          <div className="login-form-email">
            <label className="label">
              Email <span style={{ color: "#FF8B8B" }}>*</span>
            </label>
            <br />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          {success && (
            <div className="success">
              A reset link has been sent to your email.
            </div>
          )}
          <FilledButton type="submit">Send Reset Link</FilledButton>
        </form>
        <div className="toggle-form-container">
          <p>
            Login with password
            <Link to="/" style={{ color: "#FF8B8B", marginLeft: "5px" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
