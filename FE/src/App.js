import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import HomePage from "./pages/Home/HomePage";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <HomePage />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
