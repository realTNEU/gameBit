import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import ChatWindow from "../components/ChatWindow";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showChat, setShowChat] = useState(false);
  const [chatId, setChatId] = useState(null);

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get(`/products/${id}`).then(res => res.data)
  });

  const createTransaction = useMutation({
    mutationFn: (data) => api.post("/transactions", data),
    onSuccess: (res) => {
      toast.success("Transaction created");
      navigate(`/transaction/${res.data._id}`);
    }
  });

  const createChat = useMutation({
    mutationFn: (data) => api.post("/chat", data),
    onSuccess: (res) => {
      setChatId(res.data._id);
      setShowChat(true);
    }
  });

  const handleStartTransaction = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    createTransaction.mutate({ productId: id, price: product.price });
  };

  const handleMessageSeller = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    createChat.mutate({ participantId: product.seller._id, productId: id });
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full rounded-lg"
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
              <p className="text-2xl font-bold text-indigo-600 mb-4">${product.price}</p>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><span className="font-semibold">Condition:</span> {product.condition}</p>
                <p className="text-sm"><span className="font-semibold">Stock:</span> {product.stock}</p>
                <p className="text-sm">
                  <span className="font-semibold">Seller:</span>{" "}
                  <button
                    onClick={() => navigate(`/seller/${product.seller._id}`)}
                    className="text-indigo-600 hover:underline"
                  >
                    {product.seller.username}
                  </button>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartTransaction}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start Transaction
                </button>
                <button
                  onClick={handleMessageSeller}
                  className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                >
                  Message Seller
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChat && chatId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px]">
            <ChatWindow chatId={chatId} onClose={() => setShowChat(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

