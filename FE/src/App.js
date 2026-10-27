import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import HomePage from "./pages/Home/HomePage";
import Places from "./pages/Places/Places.tsx";

import Login from "./pages/Login/Login.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin/home" element={<HomePage />} />
                <Route path="/admin/places" element={<Places />} />
                <Route path="*" element={<Navigate to="/admin/places" replace />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
