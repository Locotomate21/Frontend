    import React, { useEffect, useState } from 'react';
    import axios from 'axios';

    interface DashboardStats {
    activeResidents: number;
    newResidentsThisMonth: number;
    occupancyRate: number;
    occupiedRooms: number;
    totalRooms: number;
    pendingRequests: number;
    pendingRequestsVariation: number;
    monthlyIncidents: number;
    incidentStatus: string;
    }

    const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:2000/api/dashboard/stats', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error al cargar las estadísticas del dashboard", error);
        }
        };

        fetchStats();
    }, []);

    if (!stats) {
        return <div className="p-6">Cargando datos del dashboard...</div>;
    }

    return (
        <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenida, {firstName}!</h1>
        <p className="mb-6">Tienes 3 notificaciones pendientes y 2 solicitudes de mantenimiento por revisar.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
            title="Residentes Activos"
            value={stats.activeResidents}
            subtitle={`+${stats.newResidentsThisMonth} este mes`}
            icon="👥"
            />
            <Card
            title="Habitaciones Ocupadas"
            value={`${stats.occupancyRate}%`}
            subtitle={`${stats.occupiedRooms}/${stats.totalRooms}`}
            icon="🏠"
            />
            <Card
            title="Solicitudes Pendientes"
            value={stats.pendingRequests}
            subtitle={`${stats.pendingRequestsVariation > 0 ? '+' : ''}${stats.pendingRequestsVariation} desde ayer`}
            icon="🛠️"
            subtitleColor={stats.pendingRequestsVariation < 0 ? 'text-red-600' : 'text-green-600'}
            />
            <Card
            title="Incidentes del Mes"
            value={stats.monthlyIncidents}
            subtitle={stats.incidentStatus}
            icon="⚠️"
            />
        </div>
        </div>
    );
    };

    interface CardProps {
    title: string;
    value: number | string;
    subtitle: string;
    icon: string;
    subtitleColor?: string;
    }

    const Card: React.FC<CardProps> = ({ title, value, subtitle, icon, subtitleColor = "text-gray-600" }) => (
    <div className="bg-white shadow-md rounded-lg p-4">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-3xl font-bold">{value}</div>
        <div className={`text-sm ${subtitleColor}`}>{subtitle}</div>
        <div className="text-2xl mt-2">{icon}</div>
    </div>
    );

    export default Dashboard;
