import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const auth = useAuthStore((state) => state.auth);

  // Si todavía no sabemos el estado de auth
  if (auth === undefined) {
    return <div>Cargando...</div>;
  }

  // Si no hay token -> redirige al login
  if (!auth?.token) {
    return <Navigate to="/login" replace />;
  }

  // Usuario autenticado -> renderiza children
  return <>{children}</>;
};

export default PrivateRoute;
