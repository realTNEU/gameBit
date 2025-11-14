import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

export default function SellerProfile() {
  const { id } = useParams();

  const { data: profileData } = useQuery({
    queryKey: ["seller-profile", id],
    queryFn: () => api.get(`/users/seller/${id}`).then(res => res.data)
  });

  if (!profileData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const { seller, products, reviews, stats } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {seller.avatar && (
              <img
                src={seller.avatar}
                alt={seller.username}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{seller.username}</h1>
              <p className="text-gray-600">{seller.firstName} {seller.lastName}</p>
              {seller.sellerApproved && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Verified Seller
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold">{stats.averageRating} ⭐</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {products?.map((product) => (
              <div key={product._id} className="border rounded-lg p-4">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold truncate">{product.title}</h3>
                <p className="text-sm font-medium text-indigo-600">${product.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews?.map((review) => (
              <div key={review._id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold">{review.reviewer?.username}</p>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-600">{review.reviewText}</p>
                {review.product && (
                  <p className="text-xs text-gray-500 mt-1">Product: {review.product.title}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

