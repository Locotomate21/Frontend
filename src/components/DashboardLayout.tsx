import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const residentName = localStorage.getItem('name') || 'Residente';
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); // redirección limpia
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-4 space-y-6">
        <div className="text-2xl font-bold">Menú</div>
        <nav className="flex flex-col space-y-4">
          <Link to="/noticias" className="hover:text-blue-300">Noticias</Link>
          <Link to="/asambleas" className="hover:text-blue-300">Asambleas</Link>
          <Link to="/medidas" className="hover:text-blue-300">Medidas correctivas</Link>
          <Link to="/reparaciones" className="hover:text-blue-300">Reparaciones</Link>
        </nav>
        <button 
          onClick={handleLogout} 
          className="mt-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">
            Bienvenido, {residentName}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Configuración
            </button>
            <img
              src="https://via.placeholder.com/40"
              alt="Avatar"
              className="rounded-full w-10 h-10"
            />
          </div>
        </div>

        {/* Aquí se renderizan las rutas hijas */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
