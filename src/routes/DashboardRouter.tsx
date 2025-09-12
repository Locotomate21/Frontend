import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const DashboardRouter: React.FC = () => {
  const { auth } = useAuthStore((state) => state);
  const role = auth?.role || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;

    // 🔹 Normalizamos roles que comparten dashboard
    const normalizedRole = (() => {
      switch (role) {
        case "president":
        case "vice_president":
          return "president";
        case "floor_auditor":
        case "general_auditor":
          return "auditor";
        default:
          return role;
      }
    })();

    // 🔹 Redirige al dashboard base del rol
    navigate(`/dashboard/${normalizedRole}`, { replace: true });
  }, [role, navigate]);

  return <div>Cargando dashboard...</div>;
};

export default DashboardRouter;
