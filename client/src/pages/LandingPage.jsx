import React from "react";
import { Link } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";

function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-white overflow-hidden">
      {/* Particle background */}
      <ParticleBackground />

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-24 relative z-10 px-4">
        <h1 className="text-5xl font-bold text-indigo-800 mb-4 drop-shadow-lg">
          Welcome to GameBit Marketplace
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Buy and sell safely, negotiate prices in real-time, and pay securely with escrow protection.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-6">
          <Link
            to="/catalogue"
            className="bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-indigo-800 transition"
          >
            Browse Catalogue
          </Link>
          <Link
            to="/become-seller"
            className="border-2 border-indigo-700 text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Become a Seller
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white bg-opacity-90 py-16 relative z-10">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">🛍️</span>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Browse</h3>
            <p className="text-gray-600">
              Explore and filter products matching your needs.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">💬</span>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Negotiate</h3>
            <p className="text-gray-600">
              Chat and negotiate with the seller to agree on price.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">🏦</span>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">Safe Payment</h3>
            <p className="text-gray-600">
              Your payment is held in escrow until the item arrives.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">🚚</span>
            <h3 className="text-xl font-semibold mb-2 text-indigo-700">
              Receive Product
            </h3>
            <p className="text-gray-600">
              Funds released to the seller once you confirm delivery.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
