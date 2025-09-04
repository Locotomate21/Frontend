import React, { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';
import { useAuthStore } from '../store/authStore';
import { Users, Home, AlertTriangle, DoorOpen } from 'lucide-react';
import api from '@/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#10B981"]; // Azul = ocupadas, Verde = libres

interface Stats {
  totalResidents: number;
  activeResidents: number;
  totalRooms: number;
  occupiedRooms: number;
  freeRooms: number;
  reportsCount: number;
}

interface OccupancyByFloor {
  floor: number;
  totalRooms: number;
  occupiedRooms: number;
}

interface RepresentativeDashboardData {
  stats: Stats;
  occupancyByFloor: OccupancyByFloor[];
  userName: string;
  recentActivities: {
    type: "report" | "newResident";
    title: string;
    resident: string;
    roomNumber?: number;
    floor?: number;
    date: Date;
  }[];
}

interface RepresentativeDashboardProps {
  onSectionChange?: (section: string) => void;
}

const defaultData: RepresentativeDashboardData = {
  stats: {
    totalResidents: 0,
    activeResidents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    freeRooms: 0,
    reportsCount: 0,
  },
  occupancyByFloor: [],
  userName: 'Residente',
  recentActivities: [],
};

const RepresentativeDashboard: React.FC<RepresentativeDashboardProps> = ({ onSectionChange }) => {
  const { auth } = useAuthStore((state) => state);
  const userName = auth?.fullName?.split(' ')[0] || 'Residente';
  
  const [data, setData] = useState<RepresentativeDashboardData>(defaultData);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (!auth?.token) return;
      const fetchData = async () => {
    try {
      if (!auth.token) throw new Error('No se encontró token de autenticación');

      const res = await api.get('/stats/representative/dashboard', {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const stats: Stats = {
        totalResidents: res.data.totalResidents ?? 0,
        activeResidents: res.data.activeResidents ?? 0,
        totalRooms: res.data.totalRooms ?? 0,
        occupiedRooms: res.data.occupiedRooms ?? 0,
        freeRooms: res.data.freeRooms ?? 0,
        reportsCount: res.data.reportsCount ?? 0,
      };

      // 👇 Si es Admin → usa floors, si es Representative → arma occupancyByFloor con un solo piso
    let occupancyByFloor: OccupancyByFloor[] = [];
    if (res.data.floors) {
      // Caso Admin
      occupancyByFloor = res.data.floors.map((f: any) => ({
        floor: f.floor ?? 0,
        totalRooms: f.totalRooms ?? 0,
        occupiedRooms: f.occupiedRooms ?? 0,
      }));
    } else {
      // Caso Representative
      occupancyByFloor = [{
        floor: res.data.floor ?? 0, // 👈 mejor usar lo que devuelve el backend
        totalRooms: stats.totalRooms,
        occupiedRooms: stats.occupiedRooms,
      }];
    }

      setData({ stats, occupancyByFloor, userName, recentActivities: res.data.recentActivities ?? [] });
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, [auth?.token, userName]);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const { stats, occupancyByFloor } = data;
  const occupancyPercentage = stats.totalRooms
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  const pieData = [
    { name: "Ocupadas", value: stats.occupiedRooms },
    { name: "Libres", value: stats.freeRooms },
  ];

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {userName}!</h1>
            <p className="text-blue-100">
              Aquí puedes ver tus residentes y reportes más recientes.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Residentes Activos"
              value={stats.activeResidents}
              change={`de ${stats.totalResidents}`}
              changeType="neutral"
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Habitaciones Ocupadas"
              value={`${occupancyPercentage}%`}
              change={`${stats.occupiedRooms}/${stats.totalRooms}`}
              changeType="neutral"
              icon={Home}
              color="green"
            />
            <StatsCard
              title="Reportes Pendientes"
              value={stats.reportsCount}
              change="Últimos reportes"
              changeType="neutral"
              icon={AlertTriangle}
              color="red"
            />
            <StatsCard
              title="Habitaciones Libres"
              value={stats.freeRooms}
              change="Disponibles"
              changeType="neutral"
              icon={DoorOpen}
              color="yellow"
            />
          </div>

          {/* Quick Actions + Secciones Dinámicas */}
{/*           <div className="mt-6">
            <QuickActions setActiveSection={setActiveSection} />

            <div className="mt-6 space-y-4">
              {activeSection === "addResident" && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Agregar Residente</h3>
                  <p>Formulario para agregar un nuevo residente.</p>
                </div>
              )}

              {activeSection === "viewReports" && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Ver Reportes</h3>
                  <p>Tabla o lista de reportes recientes.</p>
                </div>
              )}

              {activeSection === "maintenance" && (
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4">Mantenimiento</h3>
                  <p>Listado de tareas de mantenimiento o solicitudes.</p>
                </div>
              )}
            </div>
          </div> */}

          {/* Pie Chart + Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribución de Habitaciones
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | string, name: string) => `${name}: ${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Últimas Actividades */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Últimas Actividades
              </h3>
              {data.recentActivities && data.recentActivities.length > 0 ? (
                <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {data.recentActivities.map((activity, index) => (
                    <li
                      key={index}
                      className="py-2 flex justify-between flex-col md:flex-row md:items-center"
                    >
                      <div>
                        <span className="font-medium">{activity.title}</span>
                        <div className="text-gray-500 text-sm">
                          {activity.resident}{" "}
                          {activity.roomNumber ? `- Habitación ${activity.roomNumber}` : ""}
                          {activity.floor !== undefined ? ` - Piso ${activity.floor}` : ""}
                        </div>
                      </div>
                      <div className="text-gray-400 text-xs mt-1 md:mt-0">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hay actividades recientes.</p>
              )}
            </div>
          </div>
        </div>
        );
      };

export default RepresentativeDashboard;
