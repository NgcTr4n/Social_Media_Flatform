import React from "react";
import Layout from "../../layout/Layout";
import PostCard from "../../components/StatusPost/PostCard";
import avatar2 from "../../assets/ava/ava2.jpg";
import avatar3 from "../../assets/ava/ava3.jpg";

import post2 from "../../assets/postcontent/post2.jpg";
import post3 from "../../assets/postcontent/post3.jpg";

import { Col, Row } from "react-bootstrap";
import BirthdayCard from "../../components/BirthdayCard/BirthdayCard";
import Suggestions from "../../components/Suggestions/Suggestions";

const Home = () => {
  return (
    <Layout>
      <div className="container">
        <Row>
          <Col xs={8}>
            <div
              style={{
                position: "relative",
                maxWidth: "400px",
                margin: "0 200px",
              }}
            >
              <PostCard />
            </div>
          </Col>
          <Col xs={4}>
            <div
              style={{
                position: "fixed",
                margin: "100px -30px",
              }}
            >
              <div className="home-birthday-card">
                <BirthdayCard />
              </div>
            </div>
            <div
              style={{
                position: "fixed",
                margin: "50px 100px",
                bottom: "0",
              }}
            >
              {/* <Suggestions /> */}
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Home;
