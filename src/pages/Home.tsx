    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

    const Home = () => {
    const fullName = localStorage.getItem('fullName') || 'Usuario';
    const firstName = fullName.split(' ')[0];
    const role = localStorage.getItem('role') || 'Admin';

    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:2000/api/dashboard/stats'); 
            setStats(response.data);
        } catch (error) {
            console.error('Error al obtener las estadísticas:', error);
        }
        };
        fetchStats();
    }, []);

    if (!stats) {
        return <div className="p-4 text-gray-500">Cargando estadísticas...</div>;
    }

    return (
        <div className="space-y-6">
        {/* Bienvenida */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {firstName}!</h1>
            <p className="text-blue-100">Rol: {role}</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
            title="Residentes Activos"
            value={stats.activeResidents}
            subtitle={`+${stats.newResidentsThisMonth} este mes`}
            />
            <StatCard
            title="Habitaciones Ocupadas"
            value={`${stats.occupancyRate}%`}
            subtitle={`${stats.occupiedRooms}/${stats.totalRooms}`}
            />
            <StatCard
            title="Solicitudes Pendientes"
            value={stats.pendingRequests}
            subtitle={`${stats.pendingRequestsVariation > 0 ? '+' : ''}${stats.pendingRequestsVariation} desde el mes pasado`}
            />
            <StatCard
            title="Incidentes del Mes"
            value={stats.monthlyIncidents}
            subtitle={stats.incidentStatus}
            />
        </div>
        </div>
    );
    };

    // Componente reutilizable para las tarjetas
    const StatCard = ({ title, value, subtitle }) => (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
        <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
        <div className="text-3xl font-bold text-blue-700">{value}</div>
        <div className="text-sm text-gray-400 mt-1">{subtitle}</div>
    </div>
    );

    export default Home;
