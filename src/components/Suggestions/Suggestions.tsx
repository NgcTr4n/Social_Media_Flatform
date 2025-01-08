import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Col, Row } from "react-bootstrap";

const Suggestions = () => {
  return (
    <div
      className="suggestions-container d-flex flex-column align-items-center p-3 rounded"
      style={{
        backgroundColor: "#f7f8fc",
        maxWidth: "332px",
        borderRadius: "15px",
      }}
    >
      <div
        className="suggestions-header text-center mb-3"
        style={{
          backgroundColor: "#d6d8e4",
          borderRadius: "10px",
          width: "100%",
          padding: "5px 0",
        }}
      >
        <span style={{ color: "#6c757d", fontSize: "14px" }}>Suggestions</span>
      </div>
      <Row>
        <Col xs={9}>
          <div
            className="suggestions-grid d-flex flex-wrap justify-content-center"
            style={{ gap: "10px", display: "grid" }}
          >
            <div
              className="suggestion-item rounded d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#b58b6f",
                width: "100px",
                height: "100px",
              }}
            >
              <span
                style={{ color: "#000", fontSize: "24px", fontWeight: "bold" }}
              >
                A\
              </span>
            </div>
            <div
              className="suggestion-item rounded d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#b58b6f",
                width: "100px",
                height: "100px",
              }}
            >
              <span
                style={{ color: "#000", fontSize: "24px", fontWeight: "bold" }}
              >
                A\
              </span>
            </div>
            <div
              className="suggestion-item rounded d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#b58b6f",
                width: "100px",
                height: "100px",
              }}
            >
              <span
                style={{ color: "#000", fontSize: "24px", fontWeight: "bold" }}
              >
                A\
              </span>
            </div>
            <div
              className="suggestion-item rounded d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#b58b6f",
                width: "100px",
                height: "100px",
              }}
            >
              <span
                style={{ color: "#000", fontSize: "24px", fontWeight: "bold" }}
              >
                A\
              </span>
            </div>
          </div>
        </Col>
        <Col xs={3}>
          <div className="arrow-container mt-3">
            <button
              className="btn btn-light rounded-circle"
              style={{ width: "30px", height: "30px" }}
            >
              <span>&#8594;</span>
            </button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Suggestions;
