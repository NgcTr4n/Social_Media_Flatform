import React, { useEffect, useState } from "react";

import "./Header.css";
import Search from "../search/Search";
import ImageUploader from "../imageupload/ImageUploader";
import { useDispatch, useSelector } from "react-redux";
import ava1 from "../../assets/ava/ava1.jpg";
import image_upload from "../../assets/logo/image-upload.png";
import { AppDispatch, RootState } from "../../app/store";
import {
  addArticleWithImage,
  fetchAccount,
  fetchAccountByEmail,
  updateAccount,
} from "../../features/Account/accountSlice";
import { auth, db, storage } from "../../services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
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
  postArticle?: {
    id: string;
    content: string;
    image: string;
    // like: [];
    createdAt: string;
  }[];
}
const Header = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [isHeartActive, setIsHeartActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [contentText, setContentText] = useState("");
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [isSlidingOut, setIsSlidingOut] = useState(false);
  const [isIconAnimating, setIsIconAnimating] = useState(false);
  const [animatedComments, setAnimatedComments] = useState<number[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Lưu URL hình ảnh
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("Drop your image here");
  const [isAnimatingImg, setIsAnimatingImg] = useState<boolean>(false);

  const allAccounts = useSelector((state: RootState) => state.account.account); // Assuming accounts are stored here

  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");

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
    postArticle: [],
  });
  const currentUser = useSelector(
    (state: RootState) => state.account.selectedAccount
  );
  // console.log(currentUser);
  const handleHeartClick = () => {
    setIsHeartActive(!isHeartActive);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleCommentClick = () => {
    setShowComments(true);
    setIsSlidingOut(false);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentText(event.target.value);
  };

  // useEffect(() => {
  //   dispatch(fetchAccount());
  // }, [dispatch]);
  useEffect(() => {
    const fetchAccount = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        try {
          const accountData = await dispatch(
            fetchAccountByEmail(currentUser.email)
          ).unwrap();

          if (accountData) {
            setFormState({
              ...formState,
              id: accountData.id,
              email: accountData.email,
              username: accountData.username,
              avatar: accountData.avatar,
              postArticle: accountData.postArticle || [],
            });
          }
        } catch (error) {
          console.error("Error fetching account:", error);
        }
      }
    };
    fetchAccount();
  }, [dispatch]);

  const uploadImageToStorage = async (file: File, folder: string) => {
    try {
      const fileRef = ref(storage, `${folder}/${file.name}_${Date.now()}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contentText.trim() === "") {
      alert("Please enter some content for your post.");
      return;
    }

    if (!previewImage) {
      alert("Please upload an image for your post.");
      return;
    }

    if (!formState.id) {
      console.error("User ID is missing.");
      return;
    }

    try {
      // Upload image to Firebase Storage
      const imageFile = (
        document.getElementById("fileInput") as HTMLInputElement
      )?.files?.[0];
      if (!imageFile) {
        alert("No file selected for upload.");
        return;
      }
      const imageUrl = await uploadImageToStorage(imageFile, "posts");

      const newPost = {
        id: `${Date.now()}`,
        content: contentText,
        image: imageUrl,
        createdAt: new Date().toISOString(),
      };

      const updatedAccount = {
        ...formState,
        postArticle: [...(formState.postArticle || []), newPost],
      };

      const accountRef = doc(db, "account", formState.id);

      await updateDoc(accountRef, updatedAccount);

      alert("Post successfully added");
      // Clear form fields and reset image preview
      setContentText("");
      setPreviewImage(null);

      navigate("/home");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to post. Try again.");
    }
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

  if (!currentUser) {
    return <div>No user logged in</div>;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const filtered = allAccounts.filter((account) => {
        return (
          (account.username.toLowerCase().includes(query.toLowerCase()) ||
            account.email.toLowerCase().includes(query.toLowerCase())) &&
          account.id !== currentUser.id
        );
      });
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts([]); // Clear results if query is empty
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      alert("Please enter a username or email to search.");
      return;
    }

    const results = await dispatch(fetchAccount()).unwrap(); // Fetch accounts
    const foundAccount = results.find(
      (account: Account) =>
        account.email === searchQuery || account.username === searchQuery
    );

    if (foundAccount) {
      alert("Account found!");
    } else {
      alert("No account found with the provided username or email.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLabelText("Processing...");
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        const ctx = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);
        const resizedImageUrl = canvas.toDataURL("image/jpeg");
        setPreviewImage(resizedImageUrl);
        setLabelText("Image uploaded successfully");
      };
      img.src = URL.createObjectURL(selectedFile);
      setImageUrl(img.src);
    } else {
      setPreviewImage(null);
      setLabelText("Drop your image here");
    }
  };
  return (
    <div className="header">
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
              New Post
            </h5>
            <div
              className="post_image"
              style={{
                height: "260px",
                maxHeight: "260px",
              }}
            >
              <div className="custom-upload">
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept="image/*"
                />
                <label htmlFor="fileInput" className="upload-label">
                  <div
                    className={`image-container ${
                      isAnimating ? "fade-out" : "fade-in"
                    }`}
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Uploaded Preview"
                        className="upload-preview"
                      />
                    ) : (
                      <img
                        src={image_upload}
                        alt="Upload Icon"
                        className="upload-icon"
                      />
                    )}
                  </div>
                  <span>{labelText}</span>
                </label>
              </div>{" "}
            </div>
            <div className="post_comment ">
              <div>
                <input
                  type="text"
                  placeholder="Share your thoughts...."
                  onKeyDown={handleKeyDown}
                  value={contentText}
                  onChange={handleCommentChange}
                  className="comment-input"
                />
              </div>
              <div
                className="d-flex align-items-center justify-content-end"
                style={{
                  width: "100%",
                }}
              >
                <div className="newPost-btn">
                  <button
                    onClick={handleCommentSubmit}
                    className="comment-submit "
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-6">
          <div
            className="search-bar-container"
            style={{ position: "relative" }}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="d-flex align-items-center flex-column"
            >
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Search..."
                onChange={handleSearchChange}
                value={searchQuery}
              />
              <span className="search-icon">
                <img src={currentUser?.avatar} alt="" />
              </span>
              {searchQuery && filteredAccounts.length > 0 && (
                <div
                  style={{
                    marginTop: "5px",
                    padding: "5px",
                    position: "absolute",
                    borderRadius: "10px",
                    top: "100%", // Đảm bảo danh sách nằm dưới input
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    zIndex: 1000,
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)", // Thêm bóng đổ cho hiệu ứng đẹp
                  }}
                >
                  <ul
                    className="search-results"
                    style={{ padding: "10px", margin: 0 }}
                  >
                    {filteredAccounts.map((account) => (
                      <li
                        key={account.id}
                        style={{
                          padding: "5px",
                          margin: "5px 0",
                        }}
                      >
                        <Link
                          to={`/accounts/${account.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <img
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                            src={account.avatar}
                            alt=""
                          />{" "}
                          <span style={{ marginLeft: "5px" }}>
                            {account.username}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </div>
        </div>

        <div
          className="col-md-6 d-flex align-items-center justify-content-center"
          style={{
            paddingRight: "40px",
          }}
        >
          <div className="icon-message">
            <i
              className="bi bi-chat-heart-fill"
              style={{
                color: "#FDBFDA",
                fontSize: "30px",
              }}
            ></i>
          </div>
          <div className="icon-notifications" style={{ padding: "0 20px" }}>
            <i
              className="bi bi-heart-fill"
              style={{
                color: "#FDBFDA",
                fontSize: "30px",
              }}
            ></i>
          </div>
          <div>
            <button
              onClick={handleCommentClick}
              className="btn-newpost d-flex align-items-center justify-content-center"
            >
              <span style={{ paddingRight: "10px" }}>
                <i
                  className="bi bi-patch-plus-fill"
                  style={{
                    fontSize: "20px",
                    // color: "#CFCFCF",
                  }}
                ></i>
              </span>
              New Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
