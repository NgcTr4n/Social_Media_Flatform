import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/Home";
import Explore from "../pages/explore/Explore";
import Messages from "../pages/messages/Messages";
import Notifications from "../pages/notifications/Notifications";
import Setting from "../pages/setting/Setting";
import Signin from "../pages/auth/Auth";
import Account from "../pages/account/Account";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/Signup";
import Personal from "../pages/personal/Personal";
import MyAccount from "../pages/personal/MyAccount";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Signin />,
  },
  // {
  //   path: "/signin",
  //   element: <SignIn />,
  // },
  // {
  //   path: "/signup",
  //   element: <SignUp />,
  // },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/resetpassword",
    element: <ResetPassword />,
  },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/explore",
    element: <Explore />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/setting",
    element: <Setting />,
  },
  {
    path: "/accounts/:id",
    element: <Personal />,
  },

  {
    path: "/accounts/editprofile",
    element: <Account />,
  },
]);
