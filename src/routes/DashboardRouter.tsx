import React, { useState } from 'react';
import ResidentDashboard from '../pages/dashboards/ResidentDashboard';
import RepresentativeDashboard from '../pages/RepresentativeDashboard';
import PresidentDashboard from '../pages/dashboards/PresidentDashboard';
import AuditorDashboardData from '../pages/dashboards/AuditorDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import { AdminDashboardData } from '../pages/dashboards/types';
import { useAuthStore } from '../store/authStore';

interface DashboardRouterProps {
  adminData?: AdminDashboardData;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ adminData }) => {
  const { auth } = useAuthStore((state) => state);
  const role = auth?.role || '';

  // Estado para manejar la sección activa en dashboards que usan QuickActions
  const [activeSection, setActiveSection] = useState<string>('home');

  console.log('Role detectado en DashboardRouter:', role);

  if (!role) return <div>Cargando dashboard...</div>;

  switch (role) {
    case 'admin':
      if (!adminData) return <div>Cargando datos del admin...</div>;
      return <AdminDashboard setActiveSection={setActiveSection} />;

    case 'resident':
      return <ResidentDashboard />;

    case 'representative':
      return <RepresentativeDashboard onSectionChange={setActiveSection} />;

    case 'president':
    case 'vice_president':
      return <PresidentDashboard />;

    case 'floor_auditor':
    case 'general_auditor':
      return <AuditorDashboardData />;

    default:
      return <ResidentDashboard />; // fallback seguro
  }
};

export default DashboardRouter;
