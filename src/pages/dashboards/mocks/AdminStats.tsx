import React from 'react';
import { Users, Home, Bed, AlertTriangle } from 'lucide-react';
import { Stats } from '../types';

interface AdminStatsProps {
  stats: Stats;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Residentes Activos */}
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

      {/* Total Residentes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Residentes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalResidents}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Habitaciones Ocupadas */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Habitaciones Ocupadas</p>
            <p className="text-3xl font-bold text-gray-900">{stats.occupiedRooms}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Home className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Habitaciones Libres */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Habitaciones Libres</p>
            <p className="text-3xl font-bold text-gray-900">{stats.freeRooms}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Bed className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Reportes */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Reportes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.reportsCount}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;