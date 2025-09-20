import React, { useEffect, useState } from "react";
import api from "../../services/axios";
import { useAuthStore } from "../../store/authStore";
import DashboardRouter from "../../routes/DashboardRouter";
import AdminDashboard from "../dashboards/AdminDashboard";
import { AdminDashboardData } from "../dashboards/types";

const DashboardContainer: React.FC = () => {
  const { auth } = useAuthStore();
  const token = auth?.token;
  const role = auth?.role;

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await api.get<AdminDashboardData>("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudieron cargar los datos. Intenta más tarde.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [role, token]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  if (role !== "admin") {
    return <DashboardRouter />;
  }

  if (!dashboardData) {
    return <p className="text-center mt-10">No hay datos del dashboard.</p>;
  }

  return (
    <AdminDashboard
      data={dashboardData}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    />
  );
};

export default DashboardContainer;
