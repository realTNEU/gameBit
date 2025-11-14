import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.isAdmin) {
      navigate("/dashboard/admin");
    } else if (user.seller && user.sellerApproved) {
      navigate("/dashboard/seller");
    } else if (user.escrowAgent && user.escrowApproved) {
      navigate("/dashboard/escrow");
    } else {
      navigate("/dashboard/user");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

