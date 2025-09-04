import React, { useEffect, useState } from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

interface TopBarProps {
  setActiveSection: (section: string) => void;
}

interface DashboardStats {
  activeResidents: number;
  occupiedRooms: number;
  reportsCount: number;
}

const TopBar: React.FC<TopBarProps> = ({ setActiveSection }) => {
  const { auth } = useAuthStore((state) => state);
  const fullName = auth?.fullName || 'Usuario';
  const firstName = fullName.split(' ')[0];

  // Capitalizamos el rol para mostrarlo correctamente
  const roleRaw = auth?.role || 'Usuario';
  const role =
    roleRaw.toLowerCase() === 'representative'
      ? 'Representante'
      : roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);

  const [stats, setStats] = useState<DashboardStats>({
    activeResidents: 0,
    occupiedRooms: 0,
    reportsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/representative/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = res.data || {};
        setStats({
          activeResidents: payload.stats?.activeResidents || 0,
          occupiedRooms: payload.stats?.occupiedRooms || 0,
          reportsCount: payload.stats?.reportsCount || 0,
        });
      } catch (err) {
        console.error('Error al cargar stats del TopBar:', err);
      }
    };
    fetchStats();
  }, []);

  // Sumamos todas las notificaciones
  const totalNotifications = stats.activeResidents + stats.occupiedRooms + stats.reportsCount;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-6 w-6" />
            {totalNotifications > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{firstName}</p>
              <p className="text-xs text-gray-500">{role}</p>
            </div>
            <button
              onClick={() => setActiveSection('profile')}
              className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
            >
              <User className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
