import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthStore((state) => state.auth);

  // 🔹 Si auth es null o undefined, evita redirigir inmediatamente
  if (auth === undefined) {
    return <div>Cargando...</div>;
  }

  // 🔹 Si no hay token, redirige al login
  if (!auth?.token) {
    return <Navigate to="/" replace />;
  }

  // 🔹 Usuario autenticado, renderiza children
  return <>{children}</>;
};

export default PrivateRoute;
