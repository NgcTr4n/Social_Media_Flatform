import React, { useEffect } from "react";
import Layout from "../../layout/Layout";
import "./Notifications.css";
import NotificationItem from "../../components/Notification/NotificationItem";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { saveNotification } from "../../features/Account/accountSlice";
const notifications = [
  { name: "Name 1", action: "Liked on your post", type: "noti_like" },
  {
    name: "Name 1",
    action: "Commented on your post",
    type: "noti_cmt",
  },
  { name: "Name 1", action: "Following you", type: "noti_fl" },
  { name: "Name 2", action: "Liked on your post", type: "noti_like" },
  { name: "Name 3", action: "Liked on your post", type: "noti_like" },
  { name: "Name 4", action: "Following you", type: "noti_fl" },
];
const Notifications = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const notifications = useSelector((state: RootState) => state.account);
  // useEffect(() => {
  //   dispatch(fetchNotifications());
  // }, [dispatch]);
  return (
    <Layout>
      <div className="container mt-5">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={index}
            name={notification.name}
            action={notification.action}
            type={notification.type}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Notifications;
