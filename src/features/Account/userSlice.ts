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

// Thunk để xóa dữ liệu
export const deleteData = createAsyncThunk(
  "user/deleteData",
  async (id: string) => {
    await deleteDoc(doc(db, "user", id)); // Xóa tài liệu từ Firestore
    return id; // Trả về id đã xóa
  }
);

// Thunk để upload dữ liệu (bao gồm hình ảnh) lên Firebase
export const uploadDataWithImage = createAsyncThunk(
  "user/uploadDataWithImage",
  async (payload: {
    file: File;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    birthday: string;
  }) => {
    const {
      file,
      username,
      email,
      password,
      confirmPassword,
      gender,
      birthday,
    } = payload;

    // Upload hình ảnh lên Firebase Storage
    const storageRef = ref(storage, `user/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // Lưu dữ liệu (bao gồm URL hình ảnh) vào Firestore
    const docRef = await addDoc(collection(db, "user"), {
      username,
      email,
      password,
      confirmPassword,
      gender,
      birthday,
      imageUrl: downloadURL,
    });

    // Trả về dữ liệu mới được thêm vào từ Firestore
    return {
      id: docRef.id,
      username,
      email,
      password,
      confirmPassword,
      gender,
      birthday,
      imageUrl: downloadURL,
    };
  }
);
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (payload: {
    id: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    gender: string;
    birthday: string;
    file?: File;
  }) => {
    const {
      id,
      file,
      username,
      email,
      password,
      confirmPassword,
      gender,
      birthday,
    } = payload;

    // Tạo đối tượng cập nhật ban đầu không có imageUrl
    let updatedData: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
      gender: string;
      birthday: string;
      imageUrl?: string;
    } = { username, email, password, confirmPassword, gender, birthday };

    // Nếu có tệp mới, cập nhật cả hình ảnh
    if (file) {
      const storageRef = ref(storage, `user/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      updatedData.imageUrl = downloadURL; // Chỉ thêm imageUrl khi có tệp mới
    }

    // Cập nhật tài liệu trong Firestore
    const docRef = doc(db, "user", id);
    await updateDoc(docRef, updatedData);

    return { id, ...updatedData };
  }
);

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  birthday: string;
  imageUrl?: string;
}

interface UserState {
  user: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: [],
  loading: false,
  error: null,
};

// Thunk để lấy dữ liệu từ Firestore
export const fetchUser = createAsyncThunk<User[]>(
  "user/fetchUser",
  async () => {
    const querySnapshot = await getDocs(collection(db, "user"));
    const user: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Lấy id từ Firestore
      ...(doc.data() as Omit<User, "id">), // Đảm bảo kiểu dữ liệu chính xác
    }));
    return user;
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(uploadDataWithImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadDataWithImage.fulfilled, (state, action) => {
        state.user.push(action.payload);
        state.loading = false;
      })
      .addCase(uploadDataWithImage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to upload data";
        state.loading = false;
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload; // Cập nhật tất cả dữ liệu
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch data";
        state.loading = false;
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        // Xóa mục khỏi state
        state.user = state.user.filter((item) => item.id !== action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        // Cập nhật mục đã chỉnh sửa trong state
        const index = state.user.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.user[index] = action.payload;
        }
      });
  },
});

export default userSlice.reducer;
