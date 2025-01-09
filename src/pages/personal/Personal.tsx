import React, { useEffect, useState } from "react";
import Layout from "../../layout/Layout";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import ava1 from "../../assets/ava/ava1.jpg";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { auth } from "../../services/firebase";
import iconHeart from "../../assets/react/10.png";
import iconFill_Heart from "../../assets/react/9.png";
import "./Personal.css";
import {
  addComment,
  fetchAccountByEmail,
  fetchAccountById,
  setSelectedAccount,
  toggleFollowUser,
  updatePostLikes,
} from "../../features/Account/accountSlice";
import { useTheme } from "../../contexts/ThemeContext";
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
const Personal = () => {
  const { theme } = useTheme();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch<AppDispatch>();
  const account = useSelector((state: RootState) =>
    state.account.account.find((acc) => acc.id === id)
  );
  console.log("Account data:", account);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followerList, setFollowerList] = useState<Account[]>([]);

  const [showFollowings, setShowFollowings] = useState(false);
  const [followingList, setFollowingList] = useState<Account[]>([]);

  const myaccount = useSelector((state: RootState) => state.account);
  const [detailedItem, setDetailedItem] = useState<string | null>(null);
  const [heartState, setHeartState] = useState<{ [key: string]: boolean }>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const [animatedComments, setAnimatedComments] = useState<number[]>([]);

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
  const [followState, setFollowState] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isAnimatingBtn, setIsAnimatingBtn] = useState<{
    [key: string]: boolean;
  }>({});
  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );

  useEffect(() => {
    const fetchAccount = async () => {
      const user = auth.currentUser;
      if (user && user.email) {
        console.log("Searching for account with email:", user.email);
        try {
          const accountData = await dispatch(
            fetchAccountByEmail(user.email)
          ).unwrap();
          console.log("Fetched account (email):", accountData);
          dispatch(setSelectedAccount(accountData));
        } catch (error) {
          console.error("Error fetching account by email:", error);
        }
      }
    };
    fetchAccount();
  }, [dispatch]);

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
    const savedFollowState = localStorage.getItem("followState");

    if (savedFollowState) {
      setFollowState(JSON.parse(savedFollowState)); // Khôi phục trạng thái follow từ localStorage
    }
  }, []);
  useEffect(() => {
    const updatedFollowState: { [key: string]: boolean } = {};
    currentUser?.following?.forEach((accountId) => {
      updatedFollowState[accountId] = true;
    });

    setFollowState(updatedFollowState);
    console.log("Updated Follow State:", updatedFollowState);
  }, [currentUser?.following]);

  const loading = useSelector((state: RootState) => state.account.loading);
  const error = useSelector((state: RootState) => state.account.error);
  console.log("Current User:", currentUser);
  if (!currentUser) {
    // Handle the case where currentUser is null
    return <div>No user logged in</div>;
  }
  const isAccountFollowed = (accountId: string) => {
    return followState[accountId] || false;
  };
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);

    // Lấy giờ và phút
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    // Đổi sang định dạng 12 giờ
    hours = hours % 12 || 12;

    // Định dạng ngày, tháng và năm
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = String(date.getFullYear()).slice(-2);

    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}${ampm} - ${day}.${month}.${year}`;
  };
  const handleShowFollowers = async () => {
    if (formState.followers && formState.followers.length > 0) {
      try {
        // Fetch danh sách followers từ Redux hoặc Firebase
        const fetchedFollowers = await Promise.all(
          formState.followers.map((followerId) =>
            dispatch(fetchAccountById(followerId)).unwrap()
          )
        );
        setFollowerList(fetchedFollowers);
        setShowFollowers(true); // Hiển thị danh sách followers
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    }
  };
  const handleShowFollowing = async () => {
    if (formState.following && formState.following.length > 0) {
      try {
        // Fetch danh sách followers từ Redux hoặc Firebase
        const fetchedFollowings = await Promise.all(
          formState.following.map((followingId) =>
            dispatch(fetchAccountById(followingId)).unwrap()
          )
        );
        setFollowingList(fetchedFollowings);
        setShowFollowings(true);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    }
  };

  const showEditAccountPage = () => {
    navigate("/accounts/editprofile");
  };
  const handleImageClick = (postId: string) => {
    setDetailedItem(postId);
  };
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };
  const handleToggleLike = async (accountId: string, postId: string) => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const accountToUpdate = account;
    if (!accountToUpdate) {
      console.error("Account not found");
      return;
    }

    const postToUpdate = accountToUpdate.postArticle?.find(
      (post) => post.id === postId
    );
    if (!postToUpdate) {
      console.error("Post not found");
      return;
    }

    const isAlreadyLiked = heartState[postId] || false;
    setHeartState((prev) => ({
      ...prev,
      [postId]: !isAlreadyLiked,
    }));

    try {
      await dispatch(
        updatePostLikes({
          accountId,
          postId,
          userId: currentUser.id,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating post likes:", error);
    }
  };
  const handleFollowClick = async (accountId: string) => {
    if (!currentUser?.email || !currentUser?.username || !currentUser?.id) {
      console.error("User information is missing");
      return;
    }
    const accountToUpdate = currentUser;
    if (!accountToUpdate) {
      console.error("Account not found");
      return;
    }

    // Kiểm tra trạng thái hiện tại
    const isAlreadyFollowed = followState[accountId] || false;

    // Cập nhật giao diện ngay lập tức
    setFollowState((prevState) => ({
      ...prevState,
      [accountId]: !isAlreadyFollowed,
    }));

    try {
      // Gửi yêu cầu cập nhật trạng thái đến Firebase thông qua Redux Thunk
      const updatedFollowState = await dispatch(
        toggleFollowUser({ accountId, currentUserId: currentUser.id })
      ).unwrap();

      // Cập nhật lại followState dựa trên trạng thái mới từ API
      setFollowState((prevState) => ({
        ...prevState,
        [accountId]: updatedFollowState.isFollowing,
      }));

      console.log(`Successfully updated follow state for ${accountId}`);
    } catch (err) {
      console.error("Error toggling follow state:", err);

      // Khôi phục trạng thái nếu có lỗi
      setFollowState((prevState) => ({
        ...prevState,
        [accountId]: isAlreadyFollowed,
      }));
    }
  };

  const handleClose = () => {
    setDetailedItem(null);
  };
  const isPostLiked = (postId: string) => {
    return account?.postArticle
      ?.find((post) => post.id === postId)
      ?.likes?.some((like) => like.email === currentUser.email);
  };
  const handleCommentSubmit = async (accountId: string, postId: string) => {
    if (!currentUser?.email || !currentUser.username || !commentText) return;
    const newComment: Comment = {
      id: `${Date.now()}`,
      content: commentText,
      email: currentUser.email,
      username: currentUser.username,
      timestamp: new Date().toISOString(), // Định dạng
      avatar: currentUser.avatar || "",
    };

    setIsIconAnimating(true); // Kích hoạt animation cho icon gửi
    setAnimatedComments((prev) => [...prev, Number(newComment.id)]); // Thêm bình luận mới vào danh sách animation

    setTimeout(() => {
      setAnimatedComments((prev) =>
        prev.filter((id) => id !== Number(newComment.id))
      ); // Xóa trạng thái animation sau 1s
      setIsIconAnimating(false); // Dừng animation icon
    }, 1000);

    try {
      await dispatch(
        addComment({
          accountId,
          postId,
          comment: { content: newComment.content, userId: currentUser.id },
        })
      ).unwrap();
      setCommentText(""); // Xóa input sau khi gửi
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <Layout>
      <div className="container" style={{ marginTop: "100px" }}>
        <Card
          style={{
            borderRadius: "20px",
            padding: "20px",
            border: "none",
            background: theme === "light" ? "#FEF9FC" : "#F3F3FF",
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
                        color: theme === "light" ? "#FDBFDA" : "#B8C9F4",
                        fontFamily: "Grandstander",
                        fontSize: "48px",
                      }}
                    >
                      {formState.username}
                    </h2>{" "}
                    <p
                      style={{
                        fontFamily: "Grandstander",
                        color: "#797171",
                      }}
                    >
                      {formState.biography}
                    </p>
                  </div>
                  <Col xs="2">
                    {formState.id === currentUser.id ? (
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
                        onClick={() => handleFollowClick(formState.id)}
                        className={
                          isAnimatingBtn[formState.id] ? "button-animate" : ""
                        }
                        style={{
                          backgroundColor: isAccountFollowed(formState.id)
                            ? "#8EE86A"
                            : "#FF8B8B",
                          color: "#fff",
                          border: "none",
                          fontFamily: "Margarine",
                          borderRadius: "20px",
                        }}
                      >
                        {isAccountFollowed(formState.id)
                          ? "Following"
                          : "Follow"}
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
                        onClick={handleShowFollowers}
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
                        onClick={handleShowFollowing}
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
            <div
              className="row"
              style={{
                marginTop: "60px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "10px",
              }}
            >
              {formState.postArticle?.map((post, index) => (
                <div className="col-md-3">
                  <Card className="explore-card" style={{ border: "none" }}>
                    <Card.Img
                      // variant="top"
                      src={post.image}
                      alt={post.content}
                      className="explore-card-img"
                      onClick={() => handleImageClick(post.id)}
                      style={{
                        position: "relative",
                        width: "300px",
                        height: "300px",
                        objectFit: "cover",
                        borderRadius: "20px",
                      }}
                    />
                    <Card.Body className="explore-card-body">
                      <Row>
                        <Col xs={8}>
                          <div
                            className="explore-card-title-main d-flex align-items-center justify-content-start"
                            style={{
                              marginTop: "20px",
                              marginBottom: "10px",
                            }}
                          >
                            <Card.Img
                              src={formState.avatar}
                              style={{
                                width: "30px",
                                height: "30px",
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                            <Card.Title
                              className="explore-card-title"
                              style={{
                                marginLeft: "8px",
                                fontSize: "17px",
                                color: "rgba(0, 0, 0, 0.58)",
                                marginBottom: 0,
                              }}
                            >
                              {formState.username}
                            </Card.Title>
                          </div>
                        </Col>
                        <Col
                          xs="4"
                          className="d-flex align-items-center justify-content-end"
                        >
                          <div>
                            <span
                              style={{
                                marginLeft: "5px",
                                marginRight: "5px",
                                fontSize: "14px",
                                color:
                                  theme === "light" ? "#FDBFDA" : "#B8C9F4",
                                fontFamily: "Margarine",
                              }}
                            >
                              {post.likes?.length || 0}
                            </span>
                            <img
                              src={
                                isPostLiked(post.id)
                                  ? iconFill_Heart
                                  : iconHeart
                              }
                              onClick={() =>
                                handleToggleLike(formState.id, post.id)
                              }
                              alt="Heart Icon"
                              style={{
                                width: "30px",
                                height: "30px",
                              }}
                              className={
                                isAnimating
                                  ? "heart-icon animate-heart"
                                  : "heart-icon"
                              }
                            />
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  {detailedItem === post.id && (
                    <div className="card_detail_container">
                      <div
                        className="card-detail row"
                        style={{ width: "70%", overflowX: "hidden" }}
                      >
                        <div
                          className="card-detail-post col"
                          style={{ position: "relative" }}
                        >
                          <Card.Img
                            //   onDoubleClick={() => handleDoubleClick(post.id)}
                            variant="top"
                            src={post.image}
                            alt={post.content}
                            style={{
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "30px",
                              zIndex: 1,
                            }}
                          />
                          <Row
                            style={{
                              width: "100%",
                              position: "absolute",
                              bottom: 0,
                              zIndex: 2,
                            }}
                          >
                            <Col className="explore-card-content">
                              <Card.Subtitle
                                className="explore-card-subtitle"
                                style={{ color: "rgba(0, 0, 0, 0.25)" }}
                              >
                                {post.content}
                              </Card.Subtitle>
                              <div>
                                <span
                                  style={{
                                    marginLeft: "5px",
                                    marginRight: "5px",
                                    fontSize: "14px",
                                    color: "#FDBFDA",
                                    fontFamily: "Margarine",
                                  }}
                                >
                                  {post.likes?.length || 0}
                                </span>
                                <img
                                  src={
                                    isPostLiked(post.id)
                                      ? iconFill_Heart
                                      : iconHeart
                                  }
                                  onClick={() =>
                                    handleToggleLike(formState.id, post.id)
                                  }
                                  alt="Heart Icon"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                  }}
                                  className={
                                    isAnimating
                                      ? "heart-icon animate-heart"
                                      : "heart-icon"
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>

                        <div
                          className="card-detail-comment col"
                          style={{ padding: "20px" }}
                        >
                          <div
                            className="card-detail-btn d-flex align-items-center justify-content-between"
                            style={{
                              padding: "0 0 0 12px",
                              marginBottom: "10px",
                            }}
                          >
                            <button
                              className="close-button"
                              onClick={handleClose}
                            >
                              <i className="bi bi-x" />
                            </button>
                          </div>
                          <Row>
                            <Col>
                              <div
                                className="explore-card-title-main d-flex align-items-center justify-content-start"
                                style={{
                                  marginLeft: "10px",
                                  marginTop: "5px",
                                  marginBottom: "10px",
                                }}
                              >
                                <Card.Img
                                  src={formState.avatar}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />{" "}
                                <Card.Title
                                  className="explore-card-title"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 0,
                                    marginLeft: "10px",
                                    color: "rgba(0, 0, 0, 0.58)",
                                  }}
                                >
                                  {formState.username}
                                </Card.Title>
                              </div>
                            </Col>
                          </Row>
                          <div
                            className="comment-quantify"
                            style={{
                              margin: " 15px 0 5px 13px",
                              fontFamily: "Grandstander",
                              color: "#797171",
                            }}
                          >
                            {post.comments?.length || 0}{" "}
                            <span
                              style={{
                                color: "#797171",
                                fontSize: "14px",
                              }}
                            >
                              comments
                            </span>
                          </div>
                          <div
                            className="comment-list"
                            style={{ maxHeight: "250px" }}
                          >
                            {post.comments?.map((comment, index) => (
                              <div
                                key={comment.id}
                                className="comment-item"
                                style={{
                                  color: "#797171",
                                  fontSize: "18px",
                                }}
                              >
                                <p
                                  className="d-flex justify-content-between"
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: "4px",
                                    color:
                                      theme === "light" ? "#FDBFDA" : "#B8C9F4",
                                  }}
                                >
                                  <span>
                                    <img
                                      src={comment.avatar}
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                        marginRight: "10px",
                                      }}
                                    />
                                    {comment.username}{" "}
                                  </span>

                                  <span
                                    style={{
                                      fontSize: "10px",
                                      color: "#CFCFCF",
                                      fontFamily: "Margarine",
                                      fontStyle: "italic",
                                      fontWeight: "normal",
                                    }}
                                  >
                                    {formatTimestamp(comment.timestamp)}
                                  </span>
                                </p>
                                <p
                                  style={{
                                    marginBottom: "4px",
                                    fontSize: "16px",
                                    color: "#CFCFCF",
                                    fontFamily: "Grandstander",
                                    marginTop: "7px",
                                  }}
                                >
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div
                            className="post_comment row"
                            style={{ marginLeft: "2px" }}
                          >
                            <div className="col-5">
                              <Form.Control
                                type="text"
                                placeholder="Add a comment..."
                                value={commentText}
                                onChange={handleCommentChange}
                                // onKeyDown={handleKeyDown}
                                className="comment-input"
                              />
                            </div>
                            <div className="col-1">
                              <button
                                onClick={(e) =>
                                  handleCommentSubmit(formState.id, post.id)
                                }
                                className="comment-submit "
                              >
                                <i className="bi bi-send-fill"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
        <Modal
          show={showFollowers}
          onHide={() => setShowFollowers(false)}
          className="modal_form"
        >
          <Modal.Header closeButton>
            <Modal.Title>Followers</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {followerList.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {followerList.map((follower) => (
                  <li key={follower.id} style={{ marginBottom: "10px" }}>
                    <a style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={follower.avatar}
                        alt={`${follower.username}'s avatar`}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <h5 style={{ margin: 0 }}>{follower.username}</h5>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No followers found.</p>
            )}
          </Modal.Body>
        </Modal>
        <Modal
          show={showFollowings}
          onHide={() => setShowFollowings(false)}
          className="modal_form"
        >
          <Modal.Header closeButton>
            <Modal.Title>Followings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {followingList.length > 0 ? (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {followingList.map((following) => (
                  <li key={following.id} style={{ marginBottom: "10px" }}>
                    <a style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={following.avatar}
                        alt={`${following.username}'s avatar`}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <h5 style={{ margin: 0 }}>{following.username}</h5>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No followings found.</p>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </Layout>
  );
};

export default Personal;
