import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import useAuthStore from "../store/authStore";

export default function UserDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: productsData } = useQuery({
    queryKey: ["products", searchQuery, selectedCategory],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      return api.get(`/products?${params}`).then(res => res.data);
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then(res => res.data)
  });

  const { data: transactions } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: () => api.get("/transactions").then(res => res.data),
    enabled: !!user
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Marketplace</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {productsData?.products?.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
              >
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold truncate">{product.title}</h3>
                <p className="text-lg font-bold text-indigo-600">${product.price}</p>
                <p className="text-sm text-gray-600">by {product.seller?.username}</p>
                <p className="text-xs text-gray-500">{product.condition}</p>
              </div>
            ))}
          </div>

          {productsData && productsData.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              {Array.from({ length: productsData.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Transactions</h2>
            <div className="space-y-4">
              {transactions?.filter(t => t.buyer?._id === user._id).map((transaction) => (
                <div key={transaction._id} className="border rounded-lg p-4">
                  <p className="font-semibold">{transaction.product?.title}</p>
                  <p className="text-sm text-gray-600">Seller: {transaction.seller?.username}</p>
                  <p className="text-sm">Price: ${transaction.price}</p>
                  <p className="text-xs text-gray-500">Status: {transaction.status}</p>
                  <button
                    onClick={() => navigate(`/chat/${transaction._id}`)}
                    className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

