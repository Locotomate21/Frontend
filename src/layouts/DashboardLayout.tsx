import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* TopBar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-100">
          <Outlet /> {/* Aquí se cargan las páginas hijas */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
