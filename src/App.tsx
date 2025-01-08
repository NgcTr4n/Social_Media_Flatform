import React from "react";

import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes/routes";

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
</style>;

function App() {
  return <RouterProvider router={router} />;
}

export default App;
