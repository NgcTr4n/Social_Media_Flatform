// src/features/dataSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";

// Define Comment interface for proper typing
interface Comment {
  user: string;
  message: string;
}

// Thunk để xóa dữ liệu
export const deleteData = createAsyncThunk(
  "postArticles/deleteData",
  async (id: string) => {
    await deleteDoc(doc(db, "postArticles", id)); // Xóa tài liệu từ Firestore
    return id; // Trả về id đã xóa
  }
);

// Thunk để upload dữ liệu (bao gồm hình ảnh) lên Firebase
export const uploadDataWithImage = createAsyncThunk(
  "postArticles/uploadDataWithImage",
  async (payload: {
    file: File;
    avatar: File;
    username: string;
    content: string;
    likes: number;
    comments: Comment[];
    time: string;
  }) => {
    const { file, username, content, likes, comments, time, avatar } = payload;

    // Upload the avatar to Firebase Storage
    const avatarRef = ref(storage, `postArticles/avatars/${avatar.name}`);
    await uploadBytes(avatarRef, avatar);
    const avatarUrl = await getDownloadURL(avatarRef);

    // Upload the main file to Firebase Storage
    const storageRef = ref(storage, `postArticles/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Save data to Firestore
    const docRef = await addDoc(collection(db, "postArticles"), {
      avatar: avatarUrl,
      username,
      content,
      likes,
      comments,
      time,
      imageUrl: downloadURL,
    });

    return {
      id: docRef.id,
      avatar: avatarUrl,
      username,
      content,
      likes,
      comments,
      time,
      imageUrl: downloadURL,
    };
  }
);

// Thunk để cập nhật dữ liệu (bao gồm hình ảnh) lên Firebase
export const updateData = createAsyncThunk(
  "postArticles/updateData",
  async (payload: {
    id: string;
    avatar?: File;
    username: string;
    content: string;
    likes: number;
    comments: Comment[];
    time: string;
    file?: File;
  }) => {
    const { id, username, content, likes, comments, time, file, avatar } =
      payload;

    // Tạo đối tượng cập nhật ban đầu không có imageUrl
    let updatedData: {
      avatar?: string; // ảnh đại diện
      username: string;
      content: string;
      likes: number;
      comments: Comment[];
      time: string;
      imageUrl?: string;
    } = { username, content, likes, comments, time };

    if (avatar) {
      const avatarRef = ref(storage, `postArticles/avatars/${avatar.name}`);
      await uploadBytes(avatarRef, avatar);
      updatedData.avatar = await getDownloadURL(avatarRef);
    }
    // Nếu có tệp mới, cập nhật cả hình ảnh
    if (file) {
      const storageRef = ref(storage, `postArticles/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      updatedData.imageUrl = downloadURL; // Chỉ thêm imageUrl khi có tệp mới
    }

    // Cập nhật tài liệu trong Firestore
    const docRef = doc(db, "postArticles", id);
    await updateDoc(docRef, updatedData);

    return { id, ...updatedData }; // Trả về dữ liệu đã cập nhật, bao gồm cả imageUrl (nếu có)
  }
);

// Define the PostArticlesslider interface
interface PostArticlesslider {
  id: string;
  username: string;
  avatar?: string;
  content: string;
  likes: number;
  comments: Comment[];
  time: string;
  imageUrl?: string;
}

interface PostArticlessliderState {
  postArticles: PostArticlesslider[];
  loading: boolean;
  error: string | null;
}

const initialState: PostArticlessliderState = {
  postArticles: [],
  loading: false,
  error: null,
};

// Thunk để lấy dữ liệu từ Firestore
export const fetchPostArticlesslider = createAsyncThunk<PostArticlesslider[]>(
  "postArticles/fetchPostArticlesslider",
  async () => {
    const querySnapshot = await getDocs(collection(db, "postArticles"));
    const postArticles: PostArticlesslider[] = querySnapshot.docs.map(
      (doc) => ({
        id: doc.id, // Lấy id từ Firestore
        ...(doc.data() as Omit<PostArticlesslider, "id">),
      })
    );
    return postArticles;
  }
);

const postArticlesSlice = createSlice({
  name: "postArticles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadDataWithImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadDataWithImage.fulfilled, (state, action) => {
        // action.payload should be of type PostArticlesslider, with the imageUrl and avatar URL
        state.postArticles.push(action.payload);
        state.loading = false;
      })
      .addCase(uploadDataWithImage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to upload data";
        state.loading = false;
      })
      .addCase(fetchPostArticlesslider.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostArticlesslider.fulfilled, (state, action) => {
        state.postArticles = action.payload; // action.payload will be an array of PostArticlesslider objects
        state.loading = false;
      })
      .addCase(fetchPostArticlesslider.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch data";
        state.loading = false;
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.postArticles = state.postArticles.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(updateData.fulfilled, (state, action) => {
        const index = state.postArticles.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.postArticles[index] = action.payload; // Update the post with new data
        }
      });
  },
});

export default postArticlesSlice.reducer;
