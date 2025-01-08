import React from "react";
import Layout from "../../layout/Layout";
import ChatApp from "../../components/Message/ChatApp";

const Messages = () => {
  return (
    <Layout>
      <div className="container">
        <ChatApp />
      </div>
    </Layout>
  );
};

export default Messages;
