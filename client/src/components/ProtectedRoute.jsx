import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export const ProtectedRoute = ({ children, requireAdmin = false, requireSeller = false, requireEscrow = false }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireSeller && (!user.seller || !user.sellerApproved)) {
    return <Navigate to="/become-seller" replace />;
  }

  if (requireEscrow && (!user.escrowAgent || !user.escrowApproved)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

