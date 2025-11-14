import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useAuthStore();
  const { data: products } = useQuery({
    queryKey: ["seller-products", user?._id],
    queryFn: () => api.get(`/products/seller/${user?._id}`).then(res => res.data),
    enabled: !!user?._id
  });

  const { data: transactions } = useQuery({
    queryKey: ["seller-transactions"],
    queryFn: () => api.get("/transactions").then(res => res.data)
  });

  const createProduct = useMutation({
    mutationFn: (formData) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === "images") {
          formData[key].forEach(file => data.append("images", file));
        } else {
          data.append(key, formData[key]);
        }
      });
      return api.post("/products", data, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setShowProductForm(false);
      toast.success("Product created");
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast.success("Product deleted");
    }
  });

  const handleProductSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      category: formData.get("category"),
      subcategory: formData.get("subcategory") || null,
      condition: formData.get("condition"),
      customCondition: formData.get("customCondition") || null,
      stock: formData.get("stock"),
      images: Array.from(formData.getAll("images"))
    };
    createProduct.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Dashboard</h1>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["products", "transactions"].map((tab) => (
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
            {activeTab === "products" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">My Products</h2>
                  <button
                    onClick={() => setShowProductForm(!showProductForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {showProductForm ? "Cancel" : "Add Product"}
                  </button>
                </div>

                {showProductForm && (
                  <form onSubmit={handleProductSubmit} className="mb-6 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input name="title" placeholder="Title" required className="px-3 py-2 border rounded" />
                      <input name="price" type="number" placeholder="Price" required className="px-3 py-2 border rounded" />
                      <textarea name="description" placeholder="Description" required className="px-3 py-2 border rounded col-span-2" />
                      <input name="category" placeholder="Category ID" required className="px-3 py-2 border rounded" />
                      <input name="subcategory" placeholder="Subcategory ID (optional)" className="px-3 py-2 border rounded" />
                      <select name="condition" required className="px-3 py-2 border rounded">
                        <option value="New">New</option>
                        <option value="Mint">Mint</option>
                        <option value="Slightly Used">Slightly Used</option>
                        <option value="Used With Wear">Used With Wear</option>
                        <option value="Damaged but Usable">Damaged but Usable</option>
                        <option value="Custom">Custom</option>
                      </select>
                      <input name="stock" type="number" placeholder="Stock" defaultValue={1} className="px-3 py-2 border rounded" />
                      <input name="images" type="file" multiple accept="image/*" required className="px-3 py-2 border rounded col-span-2" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                      Create Product
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products?.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.title} className="w-full h-48 object-cover rounded mb-2" />
                      )}
                      <h3 className="font-semibold">{product.title}</h3>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <p className="text-xs text-gray-500">Status: {product.status}</p>
                      <button
                        onClick={() => deleteProduct.mutate(product._id)}
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "transactions" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Transactions</h2>
                <div className="space-y-4">
                  {transactions?.filter(t => t.seller?._id === user?._id).map((transaction) => (
                    <div key={transaction._id} className="border rounded-lg p-4">
                      <p className="font-semibold">{transaction.product?.title}</p>
                      <p className="text-sm text-gray-600">Buyer: {transaction.buyer?.username}</p>
                      <p className="text-sm">Price: ${transaction.price}</p>
                      <p className="text-xs text-gray-500">Status: {transaction.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

