import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";
import Login from "./pages/Login";
import NewsPage from "./pages/NewsPage";
import AssembliesPage from "./pages/AssembliesPage";
import DisciplinaryPage from "./pages/DisciplinaryPage";
import ReportsPage from "./pages/ReportsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./routes/PrivateRoute";
import ProfilePage from "./pages/ProfilePage";
import DashboardRouter from "./routes/DashboardRouter";

// Dashboards
import ResidentDashboard from "./pages/dashboards/ResidentDashboard";
import RepresentativeDashboard from "./pages/RepresentativeDashboard";
import PresidentDashboard from "./pages/dashboards/PresidentDashboard";
import AuditorDashboardData from "./pages/dashboards/AuditorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SettingsPage from "./pages/SettingsPage";
import SearchResultsPage from "./pages/SearchResultsPage";

function App() {
  // 👇 Agregamos los estados que AdminDashboard necesita
  const [activeSection, setActiveSection] = useState("inicio");
  const [data, setData] = useState<any>(null);

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Dashboard principal con protección */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Redirige al dashboard correcto según el rol */}
          <Route index element={<DashboardRouter />} />

          {/* Dashboards */}
          <Route path="representative" element={<RepresentativeDashboard />} />
          <Route path="resident" element={<ResidentDashboard />} />
          {/* ✅ Aquí está el fix */}
          <Route
            path="admin"
            element={
              <AdminDashboard
                data={data}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            }
          />
          <Route path="president" element={<PresidentDashboard />} />
          <Route path="auditor" element={<AuditorDashboardData />} />

          {/* Otras páginas dentro de /dashboard */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="assemblies" element={<AssembliesPage />} />
          <Route path="disciplinary" element={<DisciplinaryPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
