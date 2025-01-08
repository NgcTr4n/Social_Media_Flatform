import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import ava1 from "../../assets/ava/ava1.jpg";
import ava2 from "../../assets/ava/ava2.jpg";
import ava3 from "../../assets/ava/ava3.jpg";
import post2 from "../../assets/postcontent/post2.jpg";
import post3 from "../../assets/postcontent/post3.jpg";
import { Card, Col, Row, Form, Button } from "react-bootstrap";
import iconHeart from "../../assets/react/10.png";
import iconFill_Heart from "../../assets/react/9.png";
import "./Explore.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { auth } from "../../services/firebase";
import {
  fetchAccount,
  fetchAccountByEmail,
} from "../../features/Account/accountSlice";
import ListPost from "../../components/ListPost/ListPost";

const Explore = () => {
  return (
    <Layout>
      <div className="container">
        <ListPost />
      </div>
    </Layout>
  );
};

export default Explore;
