import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function LoginSignup() {
  const navigate = useNavigate();

  const [activeCard, setActiveCard] = useState("login");

  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [profileData, setProfileData] = useState({
    avatar: "",
    address: "",
    phone: "",
  });

  // Backend base URL
  const API_BASE = "http://localhost:5000/api"; // change if needed

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // so cookies/JWT get stored
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      toast.success(`Welcome back, ${data.user.username}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          phone: signupData.mobile || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      // Move to profile step
      setActiveCard("profile");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Profile Creation Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Profile update failed");

      toast.success("Your account was created successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const skipProfile = () => {
    toast.success("Your account was created successfully!");
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative z-10 px-4">
      <Toaster position="top-right" reverseOrder={false} />

      {activeCard === "login" && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username or Email"
              value={loginData.identifier}
              onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold hover:bg-indigo-800 transition"
            >
              Login
            </button>
          </form>

          <div className="flex justify-between items-center mt-4">
            <button className="text-indigo-600 hover:underline" onClick={() => alert("Forgot password flow here")}>
              Forgot Password?
            </button>
            <button className="text-indigo-600 hover:underline" onClick={() => setActiveCard("signup")}>
              Create Account
            </button>
          </div>
        </div>
      )}

      {activeCard === "signup" && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={signupData.firstName}
                onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={signupData.lastName}
                onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />

            <input
              type="tel"
              placeholder="Mobile Number (Optional)"
              value={signupData.mobile}
              onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />

            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold hover:bg-indigo-800 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="flex justify-center mt-4">
            <button className="text-indigo-600 hover:underline" onClick={() => setActiveCard("login")}>
              Already a Member?
            </button>
          </div>
        </div>
      )}

      {activeCard === "profile" && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md animate-fadeIn">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Complete Your Profile</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Avatar URL"
              value={profileData.avatar}
              onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Address"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="w-full bg-indigo-700 text-white py-2 rounded-lg font-semibold hover:bg-indigo-800 transition"
            >
              Save & Continue
            </button>
          </form>

          <div className="flex justify-center mt-4">
            <button className="text-indigo-600 hover:underline" onClick={skipProfile}>
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginSignup;
