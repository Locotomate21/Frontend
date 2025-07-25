import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import TopBar from '../components/TopBar';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('dashboard');

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar desde componente externo */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

       {/* Contenido principal con TopBar */}
      <main className="flex-1 bg-gray-100">
        <TopBar setActiveSection={handleSectionChange} />
        <div className="p-10">
          <Outlet /> {/* Aquí se cargan las páginas internas */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

