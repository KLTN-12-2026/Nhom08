import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import HomePage from "./pages/Home/HomePage";
import Places from "./pages/Places/Places.tsx";
import Users from "./pages/Users/Users.tsx";
import Statistics from "./pages/Statistics/Statistics.tsx";
import Tickets from "./pages/Tickets/Tickets.tsx";
import Categories from "./pages/Categories/Categories.tsx";
import ActivityGroups from "./pages/ActivityGroups/ActivityGroups.tsx";
import Quotes from "./pages/Quotes/Quotes.tsx";
import Notifications from "./pages/Notifications/Notifications.tsx";
import Announcements from "./pages/Announcements/Announcements.tsx";
import Tags from "./pages/Tags/Tags.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import CashFlow from "./pages/CashFlow/CashFlow.tsx";
import Subscriptions from "./pages/Subscriptions/Subscriptions.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import PublicPlaces from "./pages/PublicPlaces/PublicPlaces.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import CustomerAuth from "./pages/Customer/CustomerAuth.tsx";
import CustomerLayout from "./layouts/CustomerLayout.tsx";
import Home from "./pages/Home/Home.tsx";

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
        {/* Customer Public Routes */}
        <Route
          path="/"
          element={
            <CustomerLayout>
              <Home />
            </CustomerLayout>
          }
        />
        <Route path="/login" element={<CustomerAuth />} />
        <Route path="/register" element={<CustomerAuth />} />
        <Route path="/forgot-password" element={<CustomerAuth />} />
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
                  <Route path="/admin/tags" element={<Tags />} />
                  <Route path="/admin/categories" element={<Categories />} />
                  <Route path="/admin/activity-groups" element={<ActivityGroups />} />
                  <Route path="/admin/quotes" element={<Quotes />} />
                  <Route path="/admin/notifications" element={<Notifications />} />
                  <Route path="/admin/announcements" element={<Announcements />} />
                  <Route path="/admin/settings" element={<Settings />} />
                  <Route path="/admin/cashflow" element={<CashFlow />} />
                  <Route path="/admin/subscriptions" element={<Subscriptions />} />
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/public-places" element={<PublicPlaces />} />
                  <Route path="/404" element={<NotFound />} />
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
