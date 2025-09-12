import React, { useEffect, useState, useRef } from "react";
import {
  Bell,
  Search,
  User,
  Settings,
  Wrench,
  UserPlus,
  Users,
  AlertTriangle,
  Newspaper,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Notification {
  type: string;
  title: string;
  resident?: string;
  roomNumber?: number;
  floor?: number;
  date: string;
}

interface Resident {
  _id: string;
  fullName: string;
  roomNumber?: number;
}

const getDashboardPath = (role?: string | null): string => {
  switch (role) {
    case "representative":
      return "representative";
    case "resident":
      return "resident";
    case "admin":
      return "admin";
    case "president":
    case "vice_president":
      return "president";
    case "floor_auditor":
    case "general_auditor":
      return "auditor";
    default:
      return "resident";
  }
};

const TopBar: React.FC = () => {
  const { auth } = useAuthStore((state) => state);
  const navigate = useNavigate();

  const fullName = auth?.fullName || "Usuario";
  const firstName = fullName.split(" ")[0];

  const roleRaw = auth?.role || "Usuario";
  const role =
    roleRaw.toLowerCase() === "representative"
      ? "Representante"
      : roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Resident[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/representative/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(Array.isArray(res.data.recentActivities) ? res.data.recentActivities : []);
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };
    fetchNotifications();
  }, []);

  // Cierra el menú si haces click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Íconos por tipo de notificación
  const getIcon = (type: string) => {
    switch (type) {
      case "report":
        return <Wrench className="h-4 w-4 text-blue-500" />;
      case "newResident":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "assembly":
        return <Users className="h-4 w-4 text-purple-500" />;
      case "disciplinary":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "news":
        return <Newspaper className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  // Función para buscar residentes
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/residents/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const results: Resident[] = Array.isArray(res.data) ? res.data : [];
      setSuggestions(results);

      if (results.length === 1) {
        navigate(`/dashboard/resident/${results[0]._id}`);
      } else if (results.length > 1) {
        navigate(`/dashboard/search?query=${encodeURIComponent(searchTerm)}`);
      }
    } catch (err) {
      console.error("Error buscando residentes:", err);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Sugerencias */}
          {Array.isArray(suggestions) && suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((r) => (
                <li
                  key={r._id}
                  onClick={() => navigate(`/dashboard/resident/${r._id}`)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {r.fullName} {r.roomNumber ? `- Hab. ${r.roomNumber}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 min-w-[18px] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b font-medium text-gray-700">Notificaciones</div>
                <ul className="max-h-60 overflow-y-auto">
                  {notifications.length > 0
                    ? notifications.map((n, i) => (
                        <li
                          key={i}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start space-x-2"
                        >
                          {getIcon(n.type)}
                          <div>
                            <p className="text-sm text-gray-800">{n.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(n.date).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))
                    : (
                        <li className="p-4 text-sm text-gray-500 text-center">
                          No tienes notificaciones
                        </li>
                      )}
                </ul>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Perfil */}
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="flex items-center space-x-3 cursor-pointer focus:outline-none"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{firstName}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                <User className="h-4 w-4" />
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
