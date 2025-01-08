import React, { useEffect, useState } from "react";
import iconHeart from ".././../assets/react/10.png";
import iconFill_Heart from ".././../assets/react/9.png";
import iconComment from ".././../assets/react/8.png";
import { Col, Row } from "react-bootstrap";
import ava1 from "../../assets/ava/ava1.jpg";
import "./ReactionFooter.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { addComment, fetchAccount } from "../../features/Account/accountSlice";

interface ReactionFooterProps {
  likes: number;
  comments: number;
  message: string;
  time: string;
  handleLike: () => void;
  isLiked: boolean;
  postId: string;
  accountId: string;
  commentsList: {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    avatar: string;
    email: string;
  }[];
}
interface Comment {
  id: string;
  text: string;
  email: string;
  username: string;
  timestamp: string;
  avatar: string;
}
const ReactionFooter: React.FC<ReactionFooterProps> = ({
  likes,
  comments,
  message,
  time,
  handleLike,
  isLiked,
  postId,
  accountId,
  commentsList,
}) => {
  const [isHeartActive, setIsHeartActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  // const [commentList, setCommentList] = useState<Comment[]>([]);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const [animatedComments, setAnimatedComments] = useState<number[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );

  useEffect(() => {
    const savedLikeState = localStorage.getItem("isHeartActive");
    const savedComments = localStorage.getItem("comments");

    console.log("Saved like state:", savedLikeState);
    setIsHeartActive(savedLikeState === "true");
    // if (savedComments) {
    //   setCommentsList(JSON.parse(savedComments));
    // }
  }, []);
  // const [CommentedPosts, setCommentedPosts] = useState<{
  //   [accountId: string]: string[];
  // }>({});
  const handleHeartClick = () => {
    const newState = !isHeartActive;
    console.log("New like state:", newState);

    setIsHeartActive(newState);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    localStorage.setItem("isHeartActive", newState.toString());

    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleCommentClick = () => {
    setShowComments(true);
    setIsSlidingOut(false);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // handleCommentSubmit(accountId, postId);
    }
  };
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };

  const handleCloseComments = () => {
    if (!isSlidingOut) {
      setIsSlidingOut(true);
      setTimeout(() => {
        setShowComments(false);
        setIsSlidingOut(false);
      }, 300);
    }
  };
  const combinedHandleLike = () => {
    handleHeartClick();
    handleLike();
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

  const handleCommentSubmit = async (accountId: string, postId: string) => {
    if (!currentUser?.email || !currentUser.username || !commentText) return;
    const newComment: Comment = {
      id: `${Date.now()}`,
      text: commentText,
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
          comment: { content: newComment.text, userId: currentUser.id },
        })
      ).unwrap();
      setCommentText(""); // Xóa input sau khi gửi
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {showComments && (
        <div className="comment-overlay">
          <div
            className={`comment-form ${
              isSlidingOut ? "animate-slideOut" : "animate-slideIn"
            }`}
          >
            <button className="close-button" onClick={handleCloseComments}>
              <i className="bi bi-x"></i>{" "}
            </button>
            <h5
              style={{
                color: "#797171",
                fontSize: "24px",
                fontFamily: "Grandstander",
                fontWeight: 400,
              }}
            >
              Comment
            </h5>

            <div className="comment-list">
              {commentsList.length === 0 ? (
                <p style={{ color: "#797171", fontSize: "18px" }}>
                  Chưa có bình luận nào.
                </p>
              ) : (
                commentsList.map((comment) => (
                  <div
                    key={comment.id}
                    className={`comment-item ${
                      animatedComments.includes(Number(comment.id))
                        ? "comment-animate"
                        : ""
                    }`}
                    style={{ color: "#797171", fontSize: "18px" }}
                  >
                    <p
                      className="d-flex justify-content-between"
                      style={{
                        fontWeight: "bold",
                        marginBottom: "4px",
                        color: "#FDBFDA",
                      }}
                    >
                      <span>
                        <img
                          src={comment.avatar}
                          alt={`${comment.username}'s Avatar`}
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
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="post_comment row">
              <div className="col-11">
                <input
                  type="text"
                  placeholder="Enter your comment...."
                  onKeyDown={handleKeyDown}
                  value={commentText}
                  onChange={handleCommentChange}
                  className="comment-input"
                />
              </div>
              <div className="col-1">
                <button
                  onClick={(e) => handleCommentSubmit(accountId, postId)}
                  className="comment-submit "
                >
                  <i
                    className={`bi bi-send-fill ${
                      isIconAnimating ? "icon-animate" : ""
                    }`}
                  ></i>{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Row
        style={{
          margin: "10px 0",
        }}
      >
        <Col
          xs="8"
          style={{
            padding: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              padding: "10px",
              height: "auto",
              backgroundColor: "#E9EDF6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderRadius: "10px",
            }}
          >
            <p
              className="mb-0"
              style={{
                padding: "5px",
                textAlign: "left",
                fontSize: "16px",
                fontWeight: "400",
                color: "#797171",
              }}
            >
              {message}
            </p>
          </div>
          <div
            style={{
              marginLeft: "2px",
            }}
          >
            {" "}
            <p
              style={{
                fontSize: "10px",
                fontFamily: "Margarine",
                color: "#CFCFCF",
              }}
            >
              {time}
            </p>
          </div>
        </Col>
        <Col
          xs="4"
          style={{
            padding: 0,
          }}
        >
          <div className="d-flex align-items-center justify-content-end">
            <div>
              <span
                style={{
                  marginLeft: "5px",
                  marginRight: "5px",
                  fontSize: "14px",
                  color: "#DBDAEC",
                  fontFamily: "Margarine",
                }}
              >
                {comments}
              </span>
              <img
                src={iconComment}
                alt="Comment Icon"
                onClick={handleCommentClick}
                className="comment-icon"
                style={{
                  width: "30px",
                  height: "30px",
                }}
              />
            </div>
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
                {likes}
              </span>

              <img
                src={isLiked ? iconFill_Heart : iconHeart}
                onClick={combinedHandleLike}
                alt="Heart Icon"
                style={{
                  width: "30px",
                  height: "30px",
                }}
                className={
                  isAnimating ? "heart-icon animate-heart" : "heart-icon"
                }
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReactionFooter;
