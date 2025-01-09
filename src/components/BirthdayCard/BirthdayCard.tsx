import React, { useEffect } from "react";
import "./BirthdayCard.css";
import birthday_cake from "../../assets/logo/birthday_cake.png";
import birthday_cake_blue from "../../assets/logo/birthday_cake_blue.png";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { fetchAccount } from "../../features/Account/accountSlice";
import { useTheme } from "../../contexts/ThemeContext";

const BirthdayCard: React.FC = () => {
  const { theme } = useTheme();

  const dispatch = useDispatch<AppDispatch>();
  const accounts = useSelector((state: RootState) => state.account.account);

  useEffect(() => {
    dispatch(fetchAccount());
  }, [dispatch]);

  // Get the current system date in YYYY-MM-DD format
  const today = new Date().toISOString().slice(5, 10);

  // Filter accounts with a birthday matching today's date
  const birthdayAccounts = accounts
    .filter((account) => account.birthday?.slice(5, 10) === today)
    .map((account) => account.username)
    .join(", ");

  return (
    <div
      className={`birthday-card container p-4 text-center ${
        theme === "dark" ? "dark-theme" : "light-theme"
      }`}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="467"
          height="252"
          viewBox="0 0 467 252"
          fill="none"
        >
          <g filter="url(#filter0_f_118_8)">
            <path
              d="M132.01 21.5597C68.4773 20.4831 42.125 64.7744 36.8904 87.0547C33.2789 97.821 -20.5404 103.653 17.5972 187.989C48.1073 255.458 106.585 252.587 132.01 242.717C180.318 228.063 288.33 200.729 333.915 208.624C390.897 218.493 390 182.606 396.73 171.839C403.46 161.073 443.393 143.129 450.123 130.569C456.853 118.008 468.967 110.382 459.545 65.5221C450.123 20.6625 388.654 5.41025 308.341 4.06446C228.027 2.71868 211.426 22.9055 132.01 21.5597Z"
              fill="#E9EDF6"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_118_8"
              x="0"
              y="0"
              width="467"
              height="252"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="2"
                result="effect1_foregroundBlur_118_8"
              />
            </filter>
          </defs>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="467"
          height="252"
          viewBox="0 0 467 252"
          fill="none"
        >
          <g filter="url(#filter0_f_23_7)">
            <path
              d="M132.01 21.5597C68.4773 20.4831 42.125 64.7744 36.8904 87.0547C33.2789 97.821 -20.5404 103.653 17.5972 187.989C48.1073 255.458 106.585 252.587 132.01 242.717C180.318 228.063 288.33 200.729 333.915 208.624C390.897 218.493 390 182.606 396.73 171.839C403.46 161.073 443.393 143.129 450.123 130.569C456.853 118.008 468.967 110.382 459.545 65.5221C450.123 20.6625 388.654 5.41025 308.341 4.06446C228.027 2.71868 211.426 22.9055 132.01 21.5597Z"
              fill="#FDEDF5"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_23_7"
              x="0"
              y="0"
              width="467"
              height="252"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="2"
                result="effect1_foregroundBlur_23_7"
              />
            </filter>
          </defs>
        </svg>
      )}

      <div className="birthday-card-header p-2 rounded-pill mb-3">
        <h5>Birthdays</h5>
      </div>
      <div className="message">
        {birthdayAccounts ? (
          <p>
            Happy birthday to{" "}
            <span className="highlight">{birthdayAccounts}!</span>
            <br />
            <p>Wishing you all a fantastic year ahead</p>
          </p>
        ) : (
          <p>No events today</p>
        )}
      </div>
      <div className="cake-icon">
        <img
          src={theme === "dark" ? birthday_cake_blue : birthday_cake}
          alt="Birthday Cake"
          className="img-fluid"
        />
      </div>
    </div>
  );
};

export default BirthdayCard;
