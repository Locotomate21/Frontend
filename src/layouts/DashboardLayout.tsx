import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <TopBar setActiveSection={setActiveSection} />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <Outlet /> {/* Aquí se cargan tus páginas hijas */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
