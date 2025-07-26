import { useEffect } from "react";
import { logout } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    toast.success("Logginout ....");
    logout();
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;
