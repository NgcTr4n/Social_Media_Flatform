import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { Button, Card, Col, Row } from "react-bootstrap";
import ava1 from "../../assets/ava/ava1.jpg";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { auth } from "../../services/firebase";
import {
  fetchAccountByEmail,
  fetchAccountById,
  setSelectedAccount,
} from "../../features/Account/accountSlice";
type Like = {
  id: string;
  email: string;
  username: string;
};

interface Comment {
  id: string;
  content: string;
  username: string;
  email: string;
  timestamp: string;
  avatar: string;
}

interface Post {
  id: string;
  content: string;
  image: string;
  likes: Like[];
  comments: Comment[]; // Ensure comments are typed correctly
  createdAt: string;
}

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
  followers?: string[];
  following?: string[];
  postArticle?: Post[];
}
const MyAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const account = useSelector((state: RootState) =>
    state.account.account.find((acc) => acc.id === id)
  );

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
    followers: [],
    following: [],
    postArticle: [],
  });
  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );
  console.log(currentUser);

  useEffect(() => {
    if (id) {
      dispatch(fetchAccountById(id))
        .unwrap()
        .then((accountData) => {
          setFormState(accountData);
          console.log("Fetched account:", accountData);
        })
        .catch((error) => console.error("Error fetching account:", error));
    }
  }, [id, dispatch]);

  useEffect(() => {
    console.log("Current user:", currentUser);
    console.log("Form state ID:", formState.id);
  }, [currentUser, formState.id]);

  const showEditAccountPage = () => {
    navigate("/accounts/editprofile");
  };

  const handleFollow = () => {
    // Handle follow logic here
  };

  return (
    <Layout>
      <div className="container" style={{ marginTop: "100px" }}>
        <Card
          style={{
            borderRadius: "20px",
            padding: "20px",
            border: "none",
            background: "#FEF9FC",
          }}
        >
          <Card.Body>
            <Row>
              <Col xs="3">
                <img
                  src={formState.avatar}
                  alt=""
                  style={{
                    width: "250px",
                    height: "250px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </Col>
              <Col xs="9">
                <div className="personal_name row">
                  <div className="col-10">
                    {" "}
                    <h2
                      style={{
                        textAlign: "left",
                        color: "#FDBFDA",
                        fontFamily: "Grandstander",
                        fontSize: "48px",
                      }}
                    >
                      {formState.username}
                    </h2>
                  </div>
                  <Col xs="2">
                    {formState.id === currentUser?.id ? (
                      <Button
                        onClick={showEditAccountPage}
                        style={{
                          background: "rgba(255, 255, 255, 0.67)",
                          border: "none",
                          borderRadius: "10px",
                          color: "#D7E5FF",
                          fontSize: "30px",
                          fontFamily: "Margarine",
                        }}
                      >
                        Edit{" "}
                        <span
                          style={{
                            marginLeft: "5px",
                          }}
                        >
                          <i
                            className="bi bi-pen-fill"
                            style={{
                              fontSize: "25px",
                            }}
                          ></i>
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        style={{
                          background: "#3b5998",
                          border: "none",
                          borderRadius: "10px",
                          color: "white",
                          fontSize: "20px",
                          fontFamily: "Margarine",
                        }}
                      >
                        Follow
                      </Button>
                    )}
                  </Col>
                </div>
                <div
                  className="personal_status"
                  style={{
                    paddingTop: "50px",
                    textAlign: "center",
                  }}
                >
                  <Row>
                    <Col>
                      <h4
                        style={{
                          color: "#CFCFCF",
                        }}
                      >
                        {formState.postArticle?.length || 0}
                        <br />
                        Posts
                      </h4>
                    </Col>
                    <Col>
                      <h4
                        style={{
                          color: "#C7C4F0",
                        }}
                      >
                        {formState.followers?.length || 0}
                        <br />
                        Followers{" "}
                      </h4>
                    </Col>
                    <Col>
                      <h4
                        style={{
                          color: "rgba(255, 139, 139, 0.81)",
                        }}
                      >
                        {formState.following?.length || 0}
                        <br />
                        Following
                      </h4>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
            <ProfileCard />
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
};

export default MyAccount;
