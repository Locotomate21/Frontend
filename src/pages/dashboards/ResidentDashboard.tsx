    import React, { useState } from 'react';
    import TopBar from '../../components/TopBar';
    import Sidebar from '../../components/Sidebar';
    import ProfilePage from '../../pages/ProfilePage';
    import ReportsPage from '../../pages/ReportsPage';
    import NewsPage from '../../pages/NewsPage';
    import AssembliesPage from '../../pages/AssembliesPage';
    import DisciplinaryPage from '../../pages/DisciplinaryPage';
    import SettingsPage from '../../pages/SettingsPage';

    interface ResidentDashboardProps {
    initialSection?: string;
    }

    const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
    initialSection = 'home',
    }) => {
    const [activeSection, setActiveSection] = useState(initialSection);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* TopBar */}
            <TopBar setActiveSection={setActiveSection} />

            <main className="flex-1 p-6 overflow-y-auto">
            {/* Renderizado de secciones según activeSection */}
            {activeSection === 'profile' && <ProfilePage />}
            {activeSection === 'reports' && <ReportsPage />}
            {activeSection === 'news' && <NewsPage />}
            {activeSection === 'assemblies' && <AssembliesPage />}
            {activeSection === 'disciplinary' && <DisciplinaryPage />}
            {activeSection === 'settings' && <SettingsPage />}

            {/* Home o sección por defecto */}
            {activeSection === 'home' && (
                <div>
                <h1 className="text-2xl font-bold mb-4">Bienvenido al panel de Residente</h1>
                <p>Selecciona una sección en el menú para comenzar.</p>
                </div>
            )}
            </main>
        </div>
        </div>
    );
    };

    export default ResidentDashboard;
