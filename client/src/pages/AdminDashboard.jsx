import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => api.get("/admin/analytics").then(res => res.data)
  });

  const { data: pendingSellers } = useQuery({
    queryKey: ["pending-sellers"],
    queryFn: () => api.get("/admin/sellers/pending").then(res => res.data)
  });

  const { data: pendingEscrow } = useQuery({
    queryKey: ["pending-escrow"],
    queryFn: () => api.get("/admin/escrow/pending").then(res => res.data)
  });

  const { data: pendingProducts } = useQuery({
    queryKey: ["pending-products"],
    queryFn: () => api.get("/admin/products/pending").then(res => res.data)
  });

  const approveSeller = useMutation({
    mutationFn: (id) => api.post(`/admin/sellers/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-sellers"] });
      toast.success("Seller approved");
    }
  });

  const rejectSeller = useMutation({
    mutationFn: (id) => api.post(`/admin/sellers/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-sellers"] });
      toast.success("Seller rejected");
    }
  });

  const approveEscrow = useMutation({
    mutationFn: (id) => api.post(`/admin/escrow/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-escrow"] });
      toast.success("Escrow agent approved");
    }
  });

  const rejectEscrow = useMutation({
    mutationFn: (id) => api.post(`/admin/escrow/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-escrow"] });
      toast.success("Escrow agent rejected");
    }
  });

  const moderateProduct = useMutation({
    mutationFn: ({ id, action, notes }) => api.post(`/admin/products/${id}/moderate`, { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-products"] });
      toast.success("Product moderated");
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["overview", "sellers", "escrow", "products"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === tab
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{analytics.overview.totalUsers}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Active Sellers</p>
                      <p className="text-2xl font-bold">{analytics.overview.totalSellers}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Active Products</p>
                      <p className="text-2xl font-bold">{analytics.overview.totalProducts}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Pending Moderation</p>
                      <p className="text-2xl font-bold">{analytics.overview.pendingProducts}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sellers" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Seller Applications</h2>
                {pendingSellers?.length === 0 ? (
                  <p className="text-gray-500">No pending applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingSellers?.map((seller) => (
                      <div key={seller._id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{seller.firstName} {seller.lastName}</p>
                          <p className="text-sm text-gray-600">{seller.email}</p>
                          <p className="text-sm text-gray-500">@{seller.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveSeller.mutate(seller._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectSeller.mutate(seller._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "escrow" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Escrow Agent Applications</h2>
                {pendingEscrow?.length === 0 ? (
                  <p className="text-gray-500">No pending applications</p>
                ) : (
                  <div className="space-y-4">
                    {pendingEscrow?.map((agent) => (
                      <div key={agent._id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{agent.firstName} {agent.lastName}</p>
                          <p className="text-sm text-gray-600">{agent.email}</p>
                          <p className="text-sm text-gray-500">@{agent.username}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveEscrow.mutate(agent._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectEscrow.mutate(agent._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Product Moderation</h2>
                {pendingProducts?.length === 0 ? (
                  <p className="text-gray-500">No pending products</p>
                ) : (
                  <div className="space-y-4">
                    {pendingProducts?.map((product) => (
                      <div key={product._id} className="border rounded-lg p-4">
                        <div className="flex gap-4">
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt={product.title} className="w-24 h-24 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{product.title}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <p className="text-sm font-medium mt-2">${product.price}</p>
                            <p className="text-xs text-gray-500">Seller: {product.seller?.username}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => moderateProduct.mutate({ id: product._id, action: "approve" })}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => moderateProduct.mutate({ id: product._id, action: "reject" })}
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

