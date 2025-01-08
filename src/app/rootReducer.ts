import { combineReducers } from "@reduxjs/toolkit";
import postArticlesReducer from "../features/Post/postSlice";
import accountReducer from "../features/Account/accountSlice";
import userReducer from "../features/Account/userSlice";

const rootReducer = combineReducers({
  // Add your reducers here
  // example: user: userReducer
  postArticles: postArticlesReducer,
  account: accountReducer,
  user: userReducer,
});
export default rootReducer;
