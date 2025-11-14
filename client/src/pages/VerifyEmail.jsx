import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { user, fetchUser, loading } = useAuthStore();

  const verifyEmail = useMutation({
    mutationFn: (otp) => api.post("/auth/verify-email", { otp }),
    onSuccess: async () => {
      toast.success("Email verified successfully!");
      await fetchUser();
      navigate("/dashboard");
    }
  });

  const resendOTP = useMutation({
    mutationFn: () => api.post("/auth/resend-otp"),
    onSuccess: () => {
      toast.success("Verification code sent to your email");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    verifyEmail.mutate(otp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  if (user?.isEmailVerified) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-indigo-700 mb-2 text-center">Verify Your Email</h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a 6-digit verification code to <strong>{user?.email}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={verifyEmail.isLoading || otp.length !== 6}
            className="w-full bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {verifyEmail.isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
          <button
            onClick={() => resendOTP.mutate()}
            disabled={resendOTP.isLoading}
            className="text-indigo-600 hover:underline text-sm font-medium disabled:text-gray-400"
          >
            {resendOTP.isLoading ? "Sending..." : "Resend Code"}
          </button>
        </div>

        {verifyEmail.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
            {verifyEmail.error?.response?.data?.message || "Verification failed"}
          </div>
        )}
      </div>
    </div>
  );
}

