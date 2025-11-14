import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Catalogue from "./pages/Catalogue";
import BecomeSeller from "./pages/BecomeSeller";
import LoginSignup from "./pages/LoginSignup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import UserDashboard from "./pages/UserDashboard";
import EscrowDashboard from "./pages/EscrowDashboard";
import ProductPage from "./pages/ProductPage";
import SellerProfile from "./pages/SellerProfile";
import VerifyEmail from "./pages/VerifyEmail";
import { Toaster } from "react-hot-toast";
import { initSocket } from "./lib/socket";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl text-indigo-800 font-bold mb-2">404</h1>
      <p className="text-lg text-gray-600">Page Not Found</p>
    </div>
  );
}

function App() {
  useEffect(() => {
    initSocket();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster />
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/seller"
              element={
                <ProtectedRoute requireSeller>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/escrow"
              element={
                <ProtectedRoute requireEscrow>
                  <EscrowDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
