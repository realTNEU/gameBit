import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function BecomeSeller() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [applyingFor, setApplyingFor] = useState("seller");

  const applySeller = useMutation({
    mutationFn: () => api.post("/users/apply/seller"),
    onSuccess: () => {
      toast.success("Seller application submitted! Waiting for admin approval.");
      navigate("/dashboard");
    }
  });

  const applyEscrow = useMutation({
    mutationFn: () => api.post("/users/apply/escrow"),
    onSuccess: () => {
      toast.success("Escrow agent application submitted! Waiting for admin approval.");
      navigate("/dashboard");
    }
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Apply for Special Role</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setApplyingFor("seller")}
              className={`px-4 py-2 rounded ${
                applyingFor === "seller"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Become a Seller
            </button>
            <button
              onClick={() => setApplyingFor("escrow")}
              className={`px-4 py-2 rounded ${
                applyingFor === "escrow"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Become an Escrow Agent
            </button>
          </div>

          {applyingFor === "seller" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Seller Application</h2>
              <p className="text-gray-600 mb-4">
                Apply to become a seller on gameBit. Once approved, you'll be able to list products and manage your inventory.
              </p>
              {user.seller && !user.sellerApproved && (
                <p className="text-yellow-600 mb-4">Your application is pending approval.</p>
              )}
              {user.seller && user.sellerApproved && (
                <p className="text-green-600 mb-4">You are already an approved seller!</p>
              )}
              <button
                onClick={() => applySeller.mutate()}
                disabled={user.seller}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {user.seller ? "Already Applied" : "Apply Now"}
              </button>
            </div>
          )}

          {applyingFor === "escrow" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Escrow Agent Application</h2>
              <p className="text-gray-600 mb-4">
                Apply to become an escrow agent. Escrow agents help facilitate secure transactions between buyers and sellers.
              </p>
              {user.escrowAgent && !user.escrowApproved && (
                <p className="text-yellow-600 mb-4">Your application is pending approval.</p>
              )}
              {user.escrowAgent && user.escrowApproved && (
                <p className="text-green-600 mb-4">You are already an approved escrow agent!</p>
              )}
              <button
                onClick={() => applyEscrow.mutate()}
                disabled={user.escrowAgent}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {user.escrowAgent ? "Already Applied" : "Apply Now"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}