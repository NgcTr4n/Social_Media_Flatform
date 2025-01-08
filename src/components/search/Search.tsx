import React from "react";
import "./Search.css";
import ava from "../../assets/ava/ava1.jpg";
const Search = () => {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="form-control search-bar"
        placeholder="Search..."
      />
      <span className="search-icon">
        <img src={ava} alt="" />
      </span>
    </div>
  );
};

export default Search;
