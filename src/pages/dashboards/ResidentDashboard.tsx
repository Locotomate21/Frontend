    import React, { useState } from "react";
    import { Routes, Route, Navigate } from "react-router-dom";
    import TopBar from "../../components/TopBar";
    import Sidebar from "../../components/Sidebar";
    import ProfilePage from "../../pages/ProfilePage";
    import ReportsPage from "../../pages/ReportsPage";
    import NewsPage from "../../pages/NewsPage";
    import AssembliesPage from "../../pages/AssembliesPage";
    import DisciplinaryPage from "../../pages/DisciplinaryPage";
    import SettingsPage from "../../pages/SettingsPage";

    const ResidentDashboard: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* TopBar */}
            <TopBar />

            <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
                <Route
                path="/"
                element={
                    <div>
                    <h1 className="text-2xl font-bold mb-4">
                        Bienvenido al panel de Residente
                    </h1>
                    <p>Selecciona una sección en el menú para comenzar.</p>
                    </div>
                }
                />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="assemblies" element={<AssembliesPage />} />
                <Route path="disciplinary" element={<DisciplinaryPage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* Redirección por defecto si no encuentra ruta */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </main>
        </div>
        </div>
    );
    };

    export default ResidentDashboard;
