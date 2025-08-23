import React, { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import apiClient from '../axios';

interface Service {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'En progreso' | 'Urgente' | 'Completada' | string;
  prioridad?: string;
  fecha?: string;
}

const EstadoBadge = ({ estado }: { estado: string }) => {
  let color = '';
  switch (estado) {
    case 'En progreso':
      color = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Urgente':
      color = 'bg-red-100 text-red-800';
      break;
    case 'Completada':
      color = 'bg-green-100 text-green-800';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-3 py-1 rounded-md text-sm font-semibold ${color}`}>
      {estado}
    </span>
  );
};

const MaintenanceCard = ({ item }: { item: Service }) => {
  const borderColor =
    item.estado === 'En progreso'
      ? 'border-yellow-200 bg-yellow-50'
      : item.estado === 'Urgente'
      ? 'border-red-200 bg-red-50'
      : item.estado === 'Completada'
      ? 'border-green-200 bg-white'
      : 'border-gray-200 bg-white';

  return (
    <div className={`border rounded-lg p-4 mb-4 ${borderColor}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.titulo}</h3>
      <p className="text-sm text-gray-700">{item.descripcion}</p>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-2">
        <EstadoBadge estado={item.estado} />
        {item.prioridad && (
          <span className="text-sm text-gray-500">Prioridad: {item.prioridad}</span>
        )}
        {item.fecha && (
          <span className="text-sm text-gray-500">{item.fecha}</span>
        )}
      </div>
    </div>
  );
};

const MaintenancePage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await apiClient.get('/services');
      console.log("Datos recibidos:", res.data);
      setServices(res.data);
    } catch (error) {
      console.error("Error al obtener datos de servicios:", error);
    }
  };

  fetchData();
}, []);
//"bg-white p-6 rounded-lg shadow-md"
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
        <Wrench className="w-6 h-6 text-purple-600" />
        Reparaciones y Solicitudes Técnicas
      </h2>

      {loading ? (
        <p className="text-gray-500">Cargando servicios...</p>
      ) : services.length > 0 ? (
        services.map((item) => <MaintenanceCard key={item.id} item={item} />)
      ) : (
        <p className="text-gray-500">No hay solicitudes de mantenimiento.</p>
      )}
    </div>
  );
};

export default MaintenancePage;
