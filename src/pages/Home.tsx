    import React from 'react';
    import { useNavigate } from 'react-router-dom';

    const Dashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Borra el token u otros datos
        localStorage.removeItem("token");
        navigate('/');
    };

    return (
        <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-6">RGSB</h2>
            <nav className="flex flex-col gap-4">
            <button onClick={() => navigate('/dashboard')} className="hover:bg-blue-600 p-2 rounded">Dashboard</button>
            <button onClick={() => navigate('/students')} className="hover:bg-blue-600 p-2 rounded">Estudiantes</button>
            </nav>
            <button onClick={handleLogout} className="mt-auto bg-red-600 hover:bg-red-700 p-2 rounded text-white">Cerrar sesión</button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-10">
            <header className="mb-6">
            <h1 className="text-3xl font-semibold">Bienvenido al Dashboard</h1>
            <p className="text-gray-600">Resumen del sistema de residencia</p>
            </header>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold">Total Estudiantes</h3>
                <p className="text-gray-500">42 registrados</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold">Habitaciones Ocupadas</h3>
                <p className="text-gray-500">35 de 50</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-bold">Servicios Activos</h3>
                <p className="text-gray-500">5 servicios</p>
            </div>
            </div>
        </main>
        </div>
    );
    };

    export default Dashboard;
