import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import iconHeart from "../../assets/react/10.png";
import iconFill_Heart from "../../assets/react/9.png";
import {
  addComment,
  fetchAccountByEmail,
  toggleFollowUser,
  updatePostLikes,
} from "../../features/Account/accountSlice";
import { auth } from "../../services/firebase";
interface Comment {
  id: string;
  text: string;
  email: string;
  username: string;
  timestamp: string;
  avatar: string;
}
const ProfileCard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { account, loading, error } = useSelector(
    (state: RootState) => state.account
  );
  const [commentText, setCommentText] = useState("");
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const [detailedItem, setDetailedItem] = useState<string | null>(null);
  const [heartState, setHeartState] = useState<{ [key: string]: boolean }>({});

  const [isAnimating, setIsAnimating] = useState(false);

  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{
    [accountId: string]: string[];
  }>({});
  const [animatedComments, setAnimatedComments] = useState<number[]>([]);

  const [followState, setFollowState] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [isAnimatingBtn, setIsAnimatingBtn] = useState<{
    [key: string]: boolean;
  }>({});
  const [isHeartActive, setIsHeartActive] = useState(false);

  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );

  useEffect(() => {
    const fetchAccount = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        try {
          const accountData = await dispatch(
            fetchAccountByEmail(currentUser.email)
          ).unwrap();
          console.log(accountData.avatar);
        } catch (error) {
          console.error("Error fetching account:", error);
        }
      }
    };
    fetchAccount();
  }, [dispatch]);

  useEffect(() => {
    const savedLikeState = localStorage.getItem("isHeartActive");
    const savedComments = localStorage.getItem("comments");

    console.log("Saved like state:", savedLikeState);
    setIsHeartActive(savedLikeState === "true");
    // if (savedComments) {
    //   setCommentsList(JSON.parse(savedComments));
    // }
  }, []);

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

  if (!currentUser) {
    // Handle the case where currentUser is null
    return <div>No user logged in</div>;
  }

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

  const isAccountFollowed = (accountId: string) => {
    return followState[accountId] || false;
  };
  const handleIconClick = async (accountId: string) => {
    if (!currentUser?.email || !currentUser?.username || !currentUser?.id) {
      console.error("User information is missing");
      return;
    }

    const accountToUpdate = account.find((acc) => acc.id === accountId);
    if (!accountToUpdate) {
      console.error("Account not found");
      return;
    }
    setFollowState((prevState) => ({
      ...prevState,
      [accountId]: !prevState[accountId],
    }));
    try {
      await dispatch(
        toggleFollowUser({ accountId, currentUserId: currentUser.id })
      ).unwrap();
    } catch (err) {
      console.error("Error toggling follow state:", err);
      // If the follow request fails, toggle back the state to avoid UI inconsistency
      setFollowState((prevState) => ({
        ...prevState,
        [accountId]: !prevState[accountId], // Revert the follow state change
      }));
    }
  };

  const handleImageClick = (postId: string) => {
    setDetailedItem(postId);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };

  const handleClose = () => {
    setDetailedItem(null);
  };

  const handleFollowClick = async (accountId: string) => {
    if (!currentUser?.email || !currentUser?.username || !currentUser?.id) {
      console.error("User information is missing");
      return;
    }

    const accountToUpdate = account.find((acc) => acc.id === accountId);
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

  console.log("Follow State: ", followState);
  console.log("Selected Items: ", selectedItems);

  // const handleCommentSubmit = () => {
  //   if (commentText.trim()) {
  //     // Add comment logic (e.g., dispatching to redux or updating state)
  //     console.log("Comment Submitted: ", commentText);
  //     setCommentText("");
  //   }
  // };

  const handleToggleLike = async (accountId: string, postId: string) => {
    if (!currentUser?.email || !currentUser?.username || !currentUser?.id) {
      console.error("User information is missing");
      return;
    }

    const accountToUpdate = account.find((acc) => acc.id === accountId);
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

    // Toggle heart state for specific post
    const isAlreadyLiked = heartState[postId] || false;
    setHeartState((prevState) => ({
      ...prevState,
      [postId]: !isAlreadyLiked,
    }));

    // Handle like/unlike logic
    const postLikes = postToUpdate.likes || [];
    const updatedLikes = isAlreadyLiked
      ? postLikes.filter((like) => like.email !== currentUser.email)
      : [
          ...postLikes,
          {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.username,
          },
        ];

    const updatedPost = { ...postToUpdate, likes: updatedLikes };
    const updatedAccount = {
      ...accountToUpdate,
      postArticle: accountToUpdate.postArticle?.map((post) =>
        post.id === postId ? updatedPost : post
      ),
    };

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
  const combinedHandleLike = (accountId: string, postId: string) => {
    setIsHeartActive(!isHeartActive);
    handleToggleLike(postId, accountId);
  };
  // const isAccountFollowed = (accountId: string) => {
  //   return (
  //     followState[accountId] ??
  //     (currentUser.following?.includes(accountId) || false)
  //   );
  // };

  // Example usage
  console.log("Follow State:", followState);
  console.log("Firebase Following:", currentUser.following);
  const isPostLiked = (postId: string) => {
    const post = account
      .flatMap((acc) => acc.postArticle || [])
      .find((post) => post.id === postId);

    return (
      post?.likes?.some((like) => like.email === currentUser?.email) || false
    );
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter accounts to only those with posts
  const accountsWithPosts = account.filter(
    (account) =>
      account.id == currentUser.id &&
      account.postArticle &&
      account.postArticle.length > 0
  );

  // Fetch account data on mount
  if (accountsWithPosts.length === 0) {
    return <div>No accounts with posts available.</div>;
  }

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
    <div
      className="row"
      style={{
        marginTop: "60px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "10px",
      }}
    >
      {accountsWithPosts.map((account, accountIndex) =>
        account.postArticle?.map((post, postIndex) => (
          <div key={`${accountIndex}-${postIndex}`} className="col-md-3">
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
                      style={{ marginTop: "20px", marginBottom: "10px" }}
                    >
                      <Card.Img
                        src={account.avatar}
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
                        {account.username}
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
                          color: "#FDBFDA",
                          fontFamily: "Margarine",
                        }}
                      >
                        {post.likes?.length || 0}
                      </span>
                      <img
                        src={isPostLiked(post.id) ? iconFill_Heart : iconHeart}
                        onClick={() => handleToggleLike(account.id, post.id)}
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
              <div
                className="card_detail_container"
                key={`${accountIndex}-${postIndex}`}
              >
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
                              isPostLiked(post.id) ? iconFill_Heart : iconHeart
                            }
                            onClick={() =>
                              handleToggleLike(account.id, post.id)
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
                      style={{ padding: "0 0 0 12px", marginBottom: "10px" }}
                    >
                      <button className="close-button" onClick={handleClose}>
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
                            src={account.avatar}
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
                            {account.username}
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
                    <div className="comment-list" style={{}}>
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
                              color: "#FDBFDA",
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
                            handleCommentSubmit(account.id, post.id)
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
        ))
      )}
    </div>
  );
};

export default ProfileCard;
