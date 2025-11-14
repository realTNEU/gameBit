import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function EscrowDashboard() {
  const queryClient = useQueryClient();

  const { data: transactions } = useQuery({
    queryKey: ["escrow-transactions"],
    queryFn: () => api.get("/transactions").then(res => res.data)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/transactions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow-transactions"] });
      toast.success("Status updated");
    }
  });

  const resolveTransaction = useMutation({
    mutationFn: ({ id, notes }) => api.post(`/transactions/${id}/resolve`, { resolutionNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escrow-transactions"] });
      toast.success("Transaction resolved");
    }
  });

  const escrowTransactions = transactions?.filter(
    t => t.escrowAgent && t.status !== "completed" && t.status !== "cancelled"
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Escrow Agent Dashboard</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assigned Cases</h2>
          {escrowTransactions.length === 0 ? (
            <p className="text-gray-500">No assigned transactions</p>
          ) : (
            <div className="space-y-4">
              {escrowTransactions.map((transaction) => (
                <div key={transaction._id} className="border rounded-lg p-4">
                  <div className="flex gap-4 mb-4">
                    {transaction.product?.images?.[0] && (
                      <img
                        src={transaction.product.images[0]}
                        alt={transaction.product.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{transaction.product?.title}</h3>
                      <p className="text-sm text-gray-600">Buyer: {transaction.buyer?.username}</p>
                      <p className="text-sm text-gray-600">Seller: {transaction.seller?.username}</p>
                      <p className="text-sm font-medium">Price: ${transaction.price}</p>
                      <p className="text-xs text-gray-500">Status: {transaction.status}</p>
                    </div>
                  </div>

                  {transaction.proofImages && transaction.proofImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Proof Images:</p>
                      <div className="flex gap-2">
                        {transaction.proofImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Proof ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {transaction.status === "proof_uploaded" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: transaction._id, status: "shipping_confirmed" })}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Confirm Shipping
                      </button>
                    )}
                    {transaction.status === "shipping_confirmed" && (
                      <button
                        onClick={() => updateStatus.mutate({ id: transaction._id, status: "delivery_confirmed" })}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Confirm Delivery
                      </button>
                    )}
                    {transaction.status === "delivery_confirmed" && (
                      <button
                        onClick={() => {
                          const notes = prompt("Resolution notes:");
                          if (notes) resolveTransaction.mutate({ id: transaction._id, notes });
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Resolve Transaction
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

