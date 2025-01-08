import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import {
  deletePost,
  fetchAccount,
  fetchAccountByEmail,
  saveNotification,
  updatePostLikes,
} from "../../features/Account/accountSlice";
import UserHeader from "./UserHeaderProps";
import ReactionFooter from "./ReactionFooter";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { auth } from "../../services/firebase";
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
  username: string;
  avatar: string;
  postArticle?: Post[]; // Ensure postArticle is an array of Post objects
}

const MessageContent: React.FC<{ image: string }> = ({ image }) => (
  <div
    style={{ position: "relative", minHeight: "300px", textAlign: "center" }}
  >
    {image ? (
      <LazyLoadImage
        src={image}
        alt="Post content"
        effect="blur"
        style={{
          width: "400px",
          maxWidth: "400px",
          borderRadius: "10px",
          height: "400px",
          maxHeight: "400px",
          objectFit: "cover",
        }}
      />
    ) : (
      <div className="placeholder">Loading image...</div>
    )}
  </div>
);

const PostCard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { account, loading, error } = useSelector(
    (state: RootState) => state.account
  );
  const [showMenu, setShowMenu] = useState<{ [key: string]: boolean }>({});
  const [likedPosts, setLikedPosts] = useState<{
    [accountId: string]: string[];
  }>({});
  const [notifications, setNotifications] = useState<string[]>([]);
  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );

  useEffect(() => {
    dispatch(fetchAccount());
  }, [dispatch]);

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
  // Load liked posts from localStorage
  useEffect(() => {
    const storedLikedPosts = JSON.parse(
      localStorage.getItem("likedPosts") || "{}"
    );
    setLikedPosts(storedLikedPosts);
  }, []);

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
  if (!currentUser) {
    // Handle the case where currentUser is null
    return <div>No user logged in</div>;
  }
  // console.log("currentUser", currentUser);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // console.log("All Accounts:", account);
  // Filter accounts to only those with posts
  const followingAccounts = account.filter((acc) =>
    currentUser.following?.includes(acc.id)
  );

  // const accountsWithPosts = account.filter((account) => {
  //   return (
  //     // account.following?.includes(currentUser.id) &&
  //     currentUser.following?.includes(account.id) &&
  //     account.postArticle &&
  //     account.postArticle.length > 0
  //   );
  // });
  // Include posts from the current user as well
  const accountsWithPosts = [
    currentUser, // Include the logged-in user
    ...followingAccounts,
  ];
  if (accountsWithPosts.length === 0) {
    return <div>No accounts with posts available.</div>;
  }
  // Toggle menu for a post
  const toggleMenu = (accountId: string, postId: string) => {
    const key = `${accountId}-${postId}`;
    setShowMenu((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Handle delete post
  const handleDelete = (accountId: string, postId: string) => {
    const accountToUpdate = account.find((acc) => acc.id === accountId);
    if (!accountToUpdate) {
      console.error("Account not found");
      return;
    }

    const postToDelete = accountToUpdate.postArticle?.find(
      (post) => post.id === postId
    );
    if (!postToDelete) {
      console.error("Post not found");
      return;
    }

    if (postToDelete.likes.some((like) => like.email === currentUser?.email)) {
      dispatch(deletePost({ accountId, postId }));
    } else {
      console.error("Unauthorized: You can only delete your own posts.");
    }
  };
  const handleHide = (accountId: string, postId: string) => {
    const hiddenPosts = JSON.parse(localStorage.getItem("hiddenPosts") || "[]");
    const updatedHiddenPosts = [...hiddenPosts, `${accountId}-${postId}`];
    localStorage.setItem("hiddenPosts", JSON.stringify(updatedHiddenPosts));

    // Optionally, cập nhật trạng thái hoặc UI
    console.log("Post hidden:", postId);
  };
  const handleReport = (accountId: string, postId: string) => {
    console.log(`Report post ${postId} by account ${accountId}`);
    // Thêm logic gọi API hoặc dispatch action để báo cáo
  };

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

    // Cập nhật lượt like trong Redux ngay lập tức
    const postLikes = postToUpdate.likes || [];
    const isAlreadyLiked = postLikes.some(
      (like) => like.email === currentUser.email
    );

    let updatedLikes;
    if (isAlreadyLiked) {
      updatedLikes = postLikes.filter(
        (like) => like.email !== currentUser.email
      ); // Remove like
    } else {
      updatedLikes = [
        ...postLikes,
        {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username,
        },
      ]; // Add like
    }

    const updatedPost = { ...postToUpdate, likes: updatedLikes };
    const updatedAccount = {
      ...accountToUpdate,
      postArticle: accountToUpdate.postArticle?.map((post) =>
        post.id === postId ? updatedPost : post
      ),
    };

    // Cập nhật Redux state ngay lập tức
    dispatch(
      updatePostLikes({
        accountId,
        postId,
        userId: currentUser.id,
      })
    );

    try {
      // Cập nhật vào Firebase
      await dispatch(
        updatePostLikes({
          accountId,
          postId,
          userId: currentUser.id,
        })
      ).unwrap();

      // Send notification
      await dispatch(
        saveNotification({
          username: currentUser.username,
          type: "like",
          action: "Liked on your post",
          userId: accountId,
        })
      );
    } catch (error) {
      console.error("Error updating post likes:", error);
    }
  };

  const isPostLiked = (postId: string) => {
    const post = account
      .flatMap((acc) => acc.postArticle || [])
      .find((post) => post.id === postId);

    return (
      post?.likes?.some((like) => like.email === currentUser?.email) || false
    );
  };
  return (
    <div
      className="card mt-5 mb-3"
      style={{
        borderRadius: "15px",
        background: "transparent",
        border: "none",
      }}
    >
      {notifications.length > 0 && (
        <div className="notifications">
          {notifications.map((notification, index) => (
            <div key={index} className="notification">
              {notification}
            </div>
          ))}
        </div>
      )}
      {accountsWithPosts.map((account) => (
        <div key={account.id} className="post-card">
          {account.postArticle?.map((post) => {
            const menuKey = `${account.id}-${post.id}`;
            const commentsList =
              post.comments?.map((comment: Comment) => ({
                id: comment.id,
                text: comment.content,
                username: comment.username,
                timestamp: comment.timestamp,
                avatar: comment.avatar || "",
                email: comment.email,
              })) || [];

            return (
              <div key={post.id} className="post">
                <div
                  className="post-header d-flex align-items-center justify-content-between"
                  style={{ position: "relative" }}
                >
                  <UserHeader
                    id={account.id}
                    avatar={account.avatar || ""}
                    username={account.username}
                  />
                  <button
                    className="btn btn-link text-muted"
                    onClick={() => toggleMenu(account.id, post.id)}
                  >
                    <i
                      className="bi bi-three-dots-vertical"
                      style={{ fontSize: "20px" }}
                    ></i>
                  </button>
                  {showMenu[menuKey] && (
                    <div
                      className="dropdown-menu show"
                      style={{
                        position: "absolute",
                        right: "-20px",
                        top: "60px",
                      }}
                    >
                      {post.likes.some(
                        (like) => like.email === currentUser?.email
                      ) ? (
                        <button
                          className="dropdown-item"
                          onClick={() => handleDelete(account.id, post.id)}
                        >
                          Delete
                        </button>
                      ) : (
                        <>
                          <button
                            className="dropdown-item"
                            onClick={() => handleReport(account.id, post.id)}
                          >
                            Report
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => handleHide(account.id, post.id)}
                          >
                            Hidden Post
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <MessageContent image={post.image || ""} />
                <ReactionFooter
                  message={post.content || "No message"}
                  likes={post.likes?.length || 0}
                  comments={post.comments?.length || 0}
                  time={formatTimestamp(post.createdAt) || "Unknown time"}
                  handleLike={() => handleToggleLike(account.id, post.id)}
                  isLiked={isPostLiked(post.id)}
                  postId={post.id}
                  accountId={account.id}
                  commentsList={commentsList}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PostCard;
