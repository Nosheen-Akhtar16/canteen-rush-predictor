import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import Login from "./auth/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import OfflineBanner from "./components/OfflineBanner.jsx";
import Home from "./pages/student/Home.jsx";
import Canteen from "./pages/student/Canteen.jsx";
import Search from "./pages/student/Search.jsx";
import StaffHome from "./pages/staff/StaffHome.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Design from "./pages/Design.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <OfflineBanner />
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/canteen/:id"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <Canteen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/design"
            element={
              <ProtectedRoute allowedRoles={["student", "staff", "admin"]}>
                <Design />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
