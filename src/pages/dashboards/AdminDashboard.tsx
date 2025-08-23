import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/axios';
import { AdminDashboardData, Room, Service, FloorRanking, Stats } from './types';
import { Users, Home, Calendar, AlertTriangle, Search, Filter } from 'lucide-react';

interface AdminDashboardProps {
  data: AdminDashboardData;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data }) => {
  const token = useAuthStore((state) => state.auth.token);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Métricas
        const statsRes = await api.get<Stats>('/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Habitaciones
        const roomsRes = await api.get<Room[]>('/rooms', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Servicios
        const servicesRes = await api.get<Service[]>('/reports', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ranking por piso
        const floors = Array.from(new Set(roomsRes.data.map((r) => r.floor)));
        const floorRanking: FloorRanking[] = floors.map((floor) => {
          const servicesFloor = servicesRes.data.filter((s) => s.floor === floor);
          const incidents = servicesFloor.filter((s) => s.status === 'incident');
          return {
            floor,
            totalServices: servicesFloor.length,
            totalIncidents: incidents.length,
          };
        });

        setDashboardData({
          stats: statsRes.data,
          rooms: roomsRes.data,
          services: servicesRes.data,
          floorRanking,
        });
      } catch (err) {
        console.error(err);
        setError('Error cargando el dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!dashboardData) return <p className="text-center mt-10">No hay datos</p>;

  const { stats, rooms, services, floorRanking } = dashboardData;

  // Filtrar habitaciones por búsqueda
  const filteredRooms = rooms.filter(
    (r) =>
      r.number.toString().includes(searchTerm) ||
      (r.currentResident && r.currentResident.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Residentes Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeResidents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ocupación</p>
              <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              <p className="text-sm text-gray-500">{stats.occupiedRooms} / {stats.totalRooms}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incidentes Mensuales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.monthlyIncidents}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de habitaciones */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Habitaciones</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por número o residente..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Piso</th>
                <th className="px-4 py-2">Ocupada</th>
                <th className="px-4 py-2">Residente</th>
                <th className="px-4 py-2">Servicios</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.number} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{room.number}</td>
                  <td className="px-4 py-2">{room.floor}</td>
                  <td className="px-4 py-2">{room.occupied ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-2">{room.currentResident || '-'}</td>
                  <td className="px-4 py-2">{room.servicesCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Servicios */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Servicios</h2>
        <ul className="bg-white rounded-lg shadow border divide-y">
          {services.map((service) => (
            <li key={service.id} className="p-4">
              <p>
                <strong>{service.description}</strong> — {service.status}  
                (habitación {service.roomNumber}, piso {service.floor})  
              </p>
              <p className="text-sm text-gray-500">
                Reportado por: {service.reportedBy} el {service.dateReported}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Ranking por piso */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ranking por Piso</h2>
        <ul className="bg-white rounded-lg shadow border divide-y">
          {floorRanking.map((floor) => (
            <li key={floor.floor} className="p-4">
              Piso {floor.floor}: {floor.totalServices} servicios, {floor.totalIncidents} incidentes
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
