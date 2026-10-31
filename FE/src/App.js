import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import HomePage from "./pages/Home/HomePage";
import Places from "./pages/Places/Places.tsx";
import Users from "./pages/Users/Users.tsx";
import Statistics from "./pages/Statistics/Statistics.tsx";
import Tickets from "./pages/Tickets/Tickets.tsx";
import Categories from "./pages/Categories/Categories.tsx";

import Login from "./pages/Login/Login.tsx";
import useDataMainStore from "./stores/dataMainStore";

function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useDataMainStore();
  const hasToken = isAuthenticated || !!token || !!localStorage.getItem("admin_access_token");

  if (!hasToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/admin/home" element={<HomePage />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/places" element={<Places />} />
                  <Route path="/admin/statistics" element={<Statistics />} />
                  <Route path="/admin/support" element={<Tickets />} />
                  <Route path="/admin/tickets" element={<Tickets />} />
                  <Route path="/admin/categories" element={<Categories />} />
                  <Route path="*" element={<Navigate to="/admin/places" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
