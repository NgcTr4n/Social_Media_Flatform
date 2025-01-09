import React from "react";

import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./routes/routes";
import { ThemeProvider } from "./contexts/ThemeContext";

<style>
  @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
</style>;

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
