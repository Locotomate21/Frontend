import { Users } from 'lucide-react';
import React from 'react';

interface Asamblea {
  titulo: string;
  fecha: string;
  hora: string;
  lugar?: string;
  asistencia?: string;
  estado: 'Programada' | 'Completada';
}

const asambleas: Asamblea[] = [
  {
    titulo: 'Asamblea General - Enero 2025',
    fecha: '15 de Enero, 2025',
    hora: '7:00 PM',
    lugar: 'Salón de actos, Planta baja',
    estado: 'Programada',
  },
  {
    titulo: 'Asamblea Extraordinaria - Diciembre 2024',
    fecha: '20 de Diciembre, 2024',
    hora: '6:00 PM',
    asistencia: '89% (95/107 residentes)',
    estado: 'Completada',
  },
];

const EstadoBadge = ({ estado }: { estado: string }) => {
  const color =
    estado === 'Programada'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';

  return (
    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${color}`}>
      {estado}
    </span>
  );
};

const AsambleasPage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-purple-700" />
        <h2 className="text-2xl font-bold text-gray-900">Asambleas</h2>
      </div>

      {asambleas.map((asamblea, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-4 mb-4 bg-white"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {asamblea.titulo}
          </h3>
          <p className="text-sm text-gray-700">
            Fecha: {asamblea.fecha} - {asamblea.hora}
          </p>
          {asamblea.lugar && (
            <p className="text-sm text-gray-700">Lugar: {asamblea.lugar}</p>
          )}
          {asamblea.asistencia && (
            <p className="text-sm text-gray-700">Asistencia: {asamblea.asistencia}</p>
          )}
          <div className="mt-2">
            <EstadoBadge estado={asamblea.estado} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AsambleasPage;
