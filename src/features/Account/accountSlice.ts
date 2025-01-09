import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  current,
} from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "../../services/firebase"; // Ensure this imports your Firestore configuration
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Thunk to delete data
export const deleteData = createAsyncThunk(
  "account/deleteData",
  async (id: string) => {
    await deleteDoc(doc(db, "account", id));
    return id; // Return the deleted document ID
  }
);

// Thunk to upload data to Firebase (without images)
export const uploadData = createAsyncThunk(
  "account/uploadData",
  async (payload: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar: File;
  }) => {
    const { username, email, password, confirmPassword, avatar } = payload;

    const storageRef = ref(storage, `account/${avatar.name}`);
    await uploadBytes(storageRef, avatar);
    const downloadURL = await getDownloadURL(storageRef);
    // Save data to Firestore
    const docRef = await addDoc(collection(db, "account"), {
      username,
      email,
      password,
      confirmPassword,
      avatar: downloadURL,
    });

    // Return new document data from Firestore
    return {
      id: docRef.id,
      username,
      email,
      password,
      confirmPassword,
      avatar: downloadURL,
    };
  }
);
export const addArticleWithImage = createAsyncThunk(
  "account/addArticleWithImage",
  async (payload: {
    accountId: string;
    article: { content: string; image: File };
  }) => {
    const { accountId, article } = payload;
    const { content, image } = article;

    // Upload image to Firebase Storage
    const storageRef = ref(storage, `articles/${image.name}`);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);

    const newArticle = {
      id: `${Date.now()}`, // Generate unique ID
      content,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    // Update the postArticle array in Firestore
    const docRef = doc(db, "account", accountId);
    await updateDoc(docRef, {
      postArticle: arrayUnion(newArticle),
    });

    return { accountId, article: newArticle };
  }
);
interface Comment {
  id: string;
  email: string;
  content: string;
  username: string;
  timestamp: string;
  avatar: string;
}
interface Like {
  id: string;
  username: string;
  email: string;
}
interface Notification {
  id: string;
  username: string;
  type: string;
  timestamp: string;
  action: string;
  userId: string; // The ID of the user this notification is for
}
interface Message {
  text: string;
  sender: boolean;
  timestamp: string;
}
interface Contact {
  // id: string;
  contactId: string;
  username: string;
  avatar: string;
  messages: Message[];
}
interface Account {
  id: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: string;
  birthday?: string;
  biography?: string;
  avatar: string;
  notification?: Notification[];
  contacts?: { [key: string]: Contact };
  messages?: Message[];
  postArticle?: {
    id: string;
    content: string;
    image: string;
    likes: Like[];
    comments: Comment[];
    createdAt: string;
  }[];
  followers?: string[];
  following?: string[];
}

interface AccountState {
  account: Account[];
  loading: boolean;
  // notifications: Notification[];
  error: string | null;
  selectedAccount: Account | null;
  // Add a property to hold the selected account
}

const initialState: AccountState = {
  account: [],
  // notifications: [],
  loading: false,
  error: null,
  // currentUser: null,
  selectedAccount: null, // Initialize as null
};

// Thunk to fetch all accounts from Firestore
export const fetchAccount = createAsyncThunk<Account[]>(
  "account/fetchAccount",
  async () => {
    const querySnapshot = await getDocs(collection(db, "account"));
    const account: Account[] = querySnapshot.docs.map((doc) => ({
      id: doc.id, // Get Firestore document ID
      ...(doc.data() as Omit<Account, "id">), // Ensure correct data type
    }));

    return account;
  }
);

// Thunk to fetch a single account by email
export const fetchAccountByEmail = createAsyncThunk<Account, string>(
  "account/fetchAccountByEmail",
  async (email: string) => {
    const querySnapshot = await getDocs(collection(db, "account"));
    const accountDoc = querySnapshot.docs.find((doc) => {
      const data = doc.data() as Account; // Cast document data
      return data.email === email; // Check if email matches
    });

    if (accountDoc) {
      return { id: accountDoc.id, ...accountDoc.data() } as Account; // Return account with ID
    } else {
      throw new Error("Account not found");
    }
  }
);

export const updateAccount = createAsyncThunk(
  "account/updateAccount",
  async (payload: Account) => {
    const { id, ...updatedData } = payload;
    const docRef = doc(db, "account", id); // Corrected collection name
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  }
);

export const deletePost = createAsyncThunk(
  "account/deletePost",
  async ({ accountId, postId }: { accountId: string; postId: string }) => {
    const docRef = doc(db, "account", accountId);

    // Retrieve the current document data
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      const postArticle = data.postArticle || [];

      // Find the exact post to remove
      const postToRemove = postArticle.find(
        (post: { id: string }) => post.id === postId
      );

      if (postToRemove) {
        // Remove the specific post using arrayRemove
        await updateDoc(docRef, {
          postArticle: arrayRemove(postToRemove),
        });

        return { accountId, postId }; // Return the IDs for updating the state
      } else {
        throw new Error("Post not found");
      }
    } else {
      throw new Error("Account document not found");
    }
  }
);
export const addComment = createAsyncThunk(
  "account/addComment",
  async (
    payload: {
      accountId: string;
      postId: string;
      comment: { content: string; userId: string };
    },
    { getState, rejectWithValue }
  ) => {
    const { accountId, postId, comment } = payload;
    const { content, userId } = comment;

    try {
      const docRef = doc(db, "account", accountId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error("Account document not found");
      }

      const data = docSnapshot.data() as Account;
      const postArticle = data.postArticle || [];

      const postIndex = postArticle.findIndex((post) => post.id === postId);
      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      const state = getState() as { account: AccountState };
      const userAccount = state.account.account.find(
        (acc) => acc.id === userId
      );
      if (!userAccount) {
        throw new Error("User account not found");
      }

      const newComment: Comment = {
        id: `${Date.now()}`, // Unique ID for the comment
        content,
        username: userAccount.username,
        avatar: userAccount.avatar,
        email: userAccount.email,
        timestamp: new Date().toISOString(),
      };

      postArticle[postIndex].comments = [
        ...(postArticle[postIndex].comments || []),
        newComment,
      ];

      // Update Firestore
      await updateDoc(docRef, { postArticle });

      return {
        accountId,
        postId,
        comment: newComment,
      };
    } catch (error) {
      const err = error as Error;
      console.error("Failed to update post likes:", err.message);
      throw err;
    }
  }
);
// accountSlice.ts
export const updatePostLikes = createAsyncThunk(
  "account/updatePostLikes",
  async (
    {
      accountId,
      postId,
      userId,
    }: { accountId: string; postId: string; userId: string },
    { dispatch, getState }
  ) => {
    try {
      const docRef = doc(db, "account", accountId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error("Account document not found");
      }

      const data = docSnapshot.data() as Account;
      const postArticle = data?.postArticle || [];
      const postIndex = postArticle.findIndex(
        (post: { id: string }) => post.id === postId
      );

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      const post = postArticle[postIndex];
      const likes = post.likes || [];
      const state = getState() as { account: AccountState };
      const userAccount = state.account.account.find(
        (acc) => acc.id === userId
      );
      if (!userAccount) {
        throw new Error("userAccount is undefined");
      }

      const { username, email } = userAccount;

      // Check if the user already liked the post
      let updatedLikes: Like[];
      const userLikeIndex = likes.findIndex((like: Like) => like.id === userId); // Explicitly type 'like' as 'Like'

      if (userLikeIndex !== -1) {
        // If the user already liked, remove them
        updatedLikes = likes.filter((like: Like) => like.id !== userId); // Explicitly type 'like' as 'Like'
      } else {
        // If the user hasn't liked, add them
        updatedLikes = [...likes, { id: userId, username, email }]; // Add appropriate user data
      }

      postArticle[postIndex].likes = updatedLikes;

      // Create the updated account object with all properties
      const updatedAccount: Account = {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        avatar: data.avatar,
        postArticle: postArticle, // Include the updated postArticle
      };

      // Update Firestore with the updated account
      await updateDoc(docRef, { postArticle });

      // Dispatch the updated account data to Redux
      dispatch(updateAccount(updatedAccount));

      return { accountId, postId, likes: updatedLikes };
    } catch (error) {
      console.error("Failed to update post likes:", error);
      throw error;
    }
  }
);

// Thunk to save a notification
export const saveNotification = createAsyncThunk(
  "account/saveNotification",
  async (payload: {
    username: string;
    type: string;
    action: string;
    userId: string;
  }) => {
    const { username, type, action, userId } = payload;

    // Create the notification object without an 'id' field
    const notification: Omit<Notification, "id"> = {
      username,
      type,
      action,
      timestamp: new Date().toISOString(),
      userId,
    };

    const docRef = await addDoc(collection(db, "notifications"), notification);

    return { id: docRef.id, ...notification }; // Attach the Firestore-generated ID
  }
);

export const fetchAccountById = createAsyncThunk<Account, string>(
  "account/fetchAccountById",
  async (id: string) => {
    const docRef = doc(db, "account", id); // Reference to the specific account
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      return { id: docSnapshot.id, ...docSnapshot.data() } as Account; // Return account data with ID
    } else {
      throw new Error("Account not found");
    }
  }
);
export const addMessagesToContact = createAsyncThunk(
  "account/addMessagesToContact",
  async (
    {
      currentUserId,
      contactId,
      messages,
    }: {
      currentUserId: string;
      contactId: string;
      messages: Message[];
    },
    { rejectWithValue }
  ) => {
    try {
      // Reference to the current user's document in Firestore
      const currentUserRef = doc(db, "account", currentUserId);
      const currentUserSnapshot = await getDoc(currentUserRef);
      console.log("Current User Snapshot:", currentUserSnapshot);

      if (!currentUserSnapshot.exists()) {
        throw new Error("Current user not found");
      }

      const currentUser = currentUserSnapshot.data() as Account;

      // Initialize contacts if not present
      if (!currentUser.contacts) {
        currentUser.contacts = {};
      }

      console.log("Current User Contacts:", currentUser.contacts);
      console.log("Looking for Contact ID:", contactId);

      // Find the contact from the current user's contacts
      let contact = currentUser.contacts[contactId];
      if (!contact) {
        console.log("Contact not found. Creating new contact...");

        contact = {
          contactId: contactId,
          messages: [], // Start with an empty message array
          username: contactId,
          avatar: "",
        };

        currentUser.contacts[contactId] = contact;

        // Update Firestore with the new contact
        await updateDoc(currentUserRef, {
          [`contacts.${contactId}`]: contact,
        });

        console.log("New contact added to Firestore:", contact);
      }

      // Update the contact's messages for the current user
      const updatedContactForSender = {
        ...contact,
        messages: [...(contact.messages || []), ...messages], // Add new messages to the existing ones
      };

      // Update the current user's contacts with the new message
      await updateDoc(currentUserRef, {
        [`contacts.${contactId}`]: updatedContactForSender,
      });

      console.log(
        "Updated contact with new messages for sender:",
        updatedContactForSender
      );

      // Now, update the contact's document (the recipient)
      const contactRef = doc(db, "account", contactId);
      const contactSnapshot = await getDoc(contactRef);
      console.log("Contact Snapshot:", contactSnapshot);

      if (!contactSnapshot.exists()) {
        throw new Error("Contact user not found");
      }

      const contactUser = contactSnapshot.data() as Account;

      // Initialize contacts for the contact if not present
      if (!contactUser.contacts) {
        contactUser.contacts = {};
      }

      // Find or create the contact in the recipient's contacts
      let contactForReceiver = contactUser.contacts[currentUserId];
      if (!contactForReceiver) {
        contactForReceiver = {
          contactId: currentUserId,
          messages: [], // Start with an empty message array
          username: currentUser.username,
          avatar: currentUser.avatar,
        };

        contactUser.contacts[currentUserId] = contactForReceiver;

        // Update Firestore with the new contact for the recipient
        await updateDoc(contactRef, {
          [`contacts.${currentUserId}`]: contactForReceiver,
        });

        console.log(
          "New contact added to recipient's Firestore:",
          contactForReceiver
        );
      }

      // Update the contact's messages for the recipient
      const updatedContactForReceiver = {
        ...contactForReceiver,
        messages: [...(contactForReceiver.messages || []), ...messages],
      };

      // Update the recipient's contacts with the new message
      await updateDoc(contactRef, {
        [`contacts.${currentUserId}`]: updatedContactForReceiver,
      });

      console.log(
        "Updated contact with new messages for the recipient:",
        updatedContactForReceiver
      );

      return { currentUserId, contactId, messages };
    } catch (error) {
      console.error("Error adding message to Firestore:", error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchContacts = createAsyncThunk(
  "account/fetchContacts",
  async (currentUserId: string) => {
    const currentUserRef = doc(db, "account", currentUserId);
    const currentUserSnapshot = await getDoc(currentUserRef);

    if (!currentUserSnapshot.exists()) {
      throw new Error("Current user not found");
    }

    const currentUser = currentUserSnapshot.data() as Account;
    const fetchedContacts = Object.entries(currentUser.contacts || {}).map(
      ([contactId, contactData]) => ({
        name: contactData.username,
        avatar: contactData.avatar,
        messages: contactData.messages.map((msg) => ({
          ...msg,
          sender: msg.sender, // Keep the original boolean value for sender
        })),
      })
    );

    return fetchedContacts;
  }
);

export const toggleFollowUser = createAsyncThunk(
  "account/toggleFollowUser",
  async (
    { accountId, currentUserId }: { accountId: string; currentUserId: string },
    { getState }
  ) => {
    const docRef = doc(db, "account", accountId);
    const currentUserRef = doc(db, "account", currentUserId);

    // Fetch the user account and target account from Firestore
    const docSnapshot = await getDoc(docRef);
    const currentUserSnapshot = await getDoc(currentUserRef);

    if (!docSnapshot.exists()) {
      throw new Error("Account document not found");
    }

    if (!currentUserSnapshot.exists()) {
      throw new Error("Current user document not found");
    }

    const targetAccount = docSnapshot.data() as Account;
    const currentUser = currentUserSnapshot.data() as Account;

    // Check if the current user is already following the account
    const isFollowing = targetAccount.followers?.includes(currentUserId);

    // Toggle the follow state for the target account
    const updatedFollowers = isFollowing
      ? arrayRemove(currentUserId)
      : arrayUnion(currentUserId);

    // Update the followers list of the target account
    await updateDoc(docRef, {
      followers: updatedFollowers,
    });

    // Toggle the following state for the current user
    const updatedFollowing = isFollowing
      ? arrayRemove(accountId)
      : arrayUnion(accountId);

    // Update the following list of the current user
    await updateDoc(currentUserRef, {
      following: updatedFollowing,
    });

    return { accountId, currentUserId, isFollowing: !isFollowing };
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState: {
    account: [],
    notifications: [],
    loading: false,
    error: null,
    selectedAccount: null,
    currentUser: null, // Initialize currentUser as null
  } as AccountState,
  reducers: {
    updateAccountsState(state, action) {
      state.account = action.payload;
    },
    setSelectedAccount(state, action: PayloadAction<Account>) {
      state.selectedAccount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload data
      .addCase(uploadData.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadData.fulfilled, (state, action) => {
        state.account.push(action.payload); // Add new account to the state
        state.loading = false;
      })
      .addCase(uploadData.rejected, (state, action) => {
        console.error("Error uploading data:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error uploading data";
      })

      // Fetch all accounts
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.account = action.payload; // Set accounts in state
        state.loading = false;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        console.error("Error fetching accounts:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error fetching accounts";
      })

      // Fetch account by email
      .addCase(fetchAccountByEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountByEmail.fulfilled, (state, action) => {
        state.selectedAccount = action.payload; // Store the fetched account
        state.loading = false;
      })
      .addCase(fetchAccountByEmail.rejected, (state, action) => {
        console.error("Error fetching account:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error fetching account";
      })

      // Delete data
      .addCase(deleteData.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        state.account = state.account.filter(
          (acc) => acc.id !== action.payload
        ); // Remove deleted account from state
        state.loading = false;
      })
      .addCase(deleteData.rejected, (state, action) => {
        console.error("Error deleting account:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error deleting account";
      })

      // Update data
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.account.findIndex(
          (acc) => acc.id === action.payload.id
        );
        if (index !== -1) {
          state.account[index] = action.payload; // Update the account in the state
        }
        state.loading = false;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        console.error("Error updating account:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error updating account";
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const { accountId, postId } = action.payload;
        const account = state.account.find((acc) => acc.id === accountId);
        if (account) {
          account.postArticle = account.postArticle?.filter(
            (post) => post.id !== postId
          );
        }
        state.loading = false;
      })

      .addCase(updatePostLikes.fulfilled, (state, action) => {
        const { accountId, postId, likes } = action.payload;
        const account = state.account.find((acc) => acc.id === accountId);
        if (account) {
          const post = account.postArticle?.find((post) => post.id === postId);
          if (post) {
            post.likes = likes;
          }
        }
      })

      .addCase(deletePost.rejected, (state, action) => {
        console.error("Error deleting post:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error deleting post";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { accountId, postId, comment } = action.payload;
        const account = state.account.find((acc) => acc.id === accountId);
        if (account) {
          const post = account.postArticle?.find((post) => post.id === postId);
          if (post) {
            post.comments = [...(post.comments || []), comment];
          }
        }
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { accountId, currentUserId, isFollowing } = action.payload;
        const account = state.account.find((acc) => acc.id === accountId);
        const currentUser = state.account.find(
          (acc) => acc.id === currentUserId
        );

        if (account && currentUser) {
          if (isFollowing) {
            // User followed the account
            account.followers = [...(account.followers || []), currentUserId];
            currentUser.following = [
              ...(currentUser.following || []),
              accountId,
            ];
          } else {
            // User unfollowed the account
            account.followers = account.followers?.filter(
              (id) => id !== currentUserId
            );
            currentUser.following = currentUser.following?.filter(
              (id) => id !== accountId
            );
          }
        }
      })
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.selectedAccount = action.payload; // Store the fetched account
        state.loading = false;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        console.error("Error fetching account by ID:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error fetching account by ID";
      })
      .addCase(saveNotification.pending, (state) => {
        state.loading = true;
      })

      .addCase(saveNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error saving notification";
      })
      .addCase(addMessagesToContact.fulfilled, (state, action) => {
        const { currentUserId, contactId, messages } = action.payload;

        // Log the account and contacts for debugging
        const currentUser = state.account.find(
          (acc) => acc.id === currentUserId
        );
        console.log("Current User in State:", currentUser);

        if (currentUser) {
          const contact = currentUser.contacts?.[contactId];
          console.log("Found Contact:", contact);

          if (contact) {
            const updatedMessages = [...(contact.messages || []), ...messages];

            currentUser.contacts = {
              ...currentUser.contacts,
              [contactId]: {
                ...contact,
                messages: updatedMessages,
              },
            };
          }
        }
      });
  },
});

// Export actions and reducer
export const { updateAccountsState, setSelectedAccount } = accountSlice.actions;
export default accountSlice.reducer;
