import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Catalogue from "./pages/Catalogue";
import BecomeSeller from "./pages/BecomeSeller";
import LoginSignup from "./pages/LoginSignup";
import { Toaster } from "react-hot-toast";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl text-indigo-800 font-bold mb-2">404</h1>
      <p className="text-lg text-gray-600">Page Not Found</p>
    </div>
  );
}

function App() {
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
