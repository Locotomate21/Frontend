import React, { useState, Dispatch, SetStateAction, ReactNode } from "react";
import { Users, Home, Calendar, AlertTriangle, Search, Filter } from "lucide-react";
import StatsCard from "../../components/StatsCard";
import RecentActivity from "../../components/RecentActivity";
import QuickActions from "../../components/QuickActions";
import { AdminDashboardData, Stats } from "./types";

interface AdminDashboardProps {
  data: AdminDashboardData; // 👈 recibe la data ya cargada
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
  children?: ReactNode;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, activeSection, setActiveSection, children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const stats: Stats = data.stats || {
    totalResidents: 0,
    activeResidents: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    freeRooms: 0,
    reportsCount: 0,
  };

  const rooms = data.rooms || [];
  const reports = data.reports || [];
  const floorRanking = data.floorRanking || [];

  const filteredRooms = rooms.filter(
    (r) =>
      r.number.toString().includes(searchTerm) ||
      (r.currentResident && r.currentResident.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const occupancyPercentage = stats.totalRooms
    ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
    : 0;

  return (
    <div className="space-y-6">
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
          title="Reportes Totales"
          value={stats.reportsCount}
          change="Últimos reportes"
          changeType="neutral"
          icon={Calendar}
          color="yellow"
        />
        <StatsCard
          title="Incidentes"
          value={stats.reportsCount}
          change="Reporte general"
          changeType="neutral"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Habitaciones */}
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
                  <td className="px-4 py-2">{room.occupied ? "Sí" : "No"}</td>
                  <td className="px-4 py-2">{room.currentResident || "-"}</td>
                  <td className="px-4 py-2">{room.reportsCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />

      {/* Quick Actions */}
      <QuickActions setActiveSection={setActiveSection} />

      {/* Render children */}
      {children}
    </div>
  );
};

export default AdminDashboard;
