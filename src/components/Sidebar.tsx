import React from 'react';
import { 
  Home, 
  Newspaper, 
  Users, 
  AlertTriangle, 
  Wrench, 
  User, 
  LogOut,
  ChevronLeft,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  isCollapsed, 
  setIsCollapsed 
}) => {
     const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home, path: '/dashboard' },
    { id: 'news', label: 'Noticias', icon: Newspaper, path: '/news' },
    { id: 'assemblies', label: 'Asambleas', icon: Users, path: '/assemblies' },
    { id: 'disciplinary', label: 'Medidas Disciplinarias', icon: AlertTriangle, path: '/disciplinary' },
    { id: 'maintenance', label: 'Reparaciones', icon: Wrench, path: '/maintenance' },
    { id: 'profile', label: 'Perfil', icon: User, path: '/profile' },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/');
  };
  
  return (
    <div className={`bg-blue-700 text-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      
      {/* Header */}
      <div className="p-4 border-b border-white-300 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-white-300" />
            <span className="font-bold text-lg">ResidenciaUni</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-white-300 transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveSection(item.id);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-300 hover:bg-blue-700 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-b border-white-300">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
