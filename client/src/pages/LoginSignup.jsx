import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

function LoginSignup() {
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginData.identifier, loginData.password);
    if (result.success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      if (result.error?.includes("verify your email") || result.data?.requiresVerification) {
        navigate("/verify-email");
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const result = await signup({
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      phone: signupData.mobile || null,
    });
    if (result.success) {
      toast.success("Account created! Please verify your email.");
      navigate("/verify-email");
    } else {
      toast.error(result.error);
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white relative z-10 px-4">

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

    </div>
  );
}

export default LoginSignup;
