import React from "react";
import Layout from "../../layout/Layout";
import { useTheme } from "../../contexts/ThemeContext";
import "./Setting.css";

const Setting: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleChangeTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value);
  };

  return (
    <Layout>
      <div
        className="container setting-container"
        style={{
          backgroundColor: theme === "light" ? "#FDEDF5" : "#F3F3FF",
          color: theme === "light" ? "#333" : "#f0f0f0",
          padding: "50px",
          marginTop: "50px",
          borderRadius: "20px",
        }}
      >
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card p-4 shadow-sm">
              <h2
                className="text-center mb-4"
                style={{
                  color: theme === "light" ? "#FDBFDA" : "#B8C9F4",
                  fontSize: "30px",
                  fontWeight: "bold",
                  fontFamily: "Margarine",
                }}
              >
                Settings
              </h2>
              <div className="form-group">
                <label
                  className="form-label d-block mb-2"
                  style={{
                    color: theme === "light" ? "#FDBFDA" : "#B8C9F4",
                  }}
                >
                  Choose Theme:
                </label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="theme"
                    id="light-theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={handleChangeTheme}
                  />
                  <label className="form-check-label" htmlFor="light-theme">
                    Light
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="theme"
                    id="dark-theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={handleChangeTheme}
                  />
                  <label className="form-check-label" htmlFor="dark-theme">
                    Dark
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setting;
