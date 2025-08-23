import React from 'react';
import { Users, Home, Calendar, AlertTriangle } from 'lucide-react';
import { Stats } from '../types';

interface AdminStatsProps {
  stats: Stats;
}

const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Residentes activos */}
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
      {/* Otros stats: ocupación, solicitudes, incidentes */}
      {/* ...puedes copiar la estructura de AdminStats que ya tenías */}
    </div>
  );
};

export default AdminStats;
