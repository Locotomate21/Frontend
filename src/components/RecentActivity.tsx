import React from 'react';
import { AlertTriangle, Users, FileText } from 'lucide-react';

interface Activity {
  id: string;
  type: 'reports' | 'newResident'; 
  description: string;
  date: string;
}

const dummyActivities: Activity[] = [
  { id: '1', type: 'reports', description: 'Reporte en habitación 101', date: '2025-08-28' },
  { id: '2', type: 'newResident', description: 'Nuevo residente agregado: Juan Pérez', date: '2025-08-27' },
  { id: '3', type: 'reports', description: 'Reporte finalizado en habitación 203', date: '2025-08-26' },
];

const RecentActivity: React.FC = () => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'reports':
        return <FileText className="text-purple-500" size={20} />; // 👈 más claro que el wrench
      case 'newResident':
        return <Users className="text-blue-500" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades Recientes</h3>
      <ul className="space-y-3">
        {dummyActivities.map((activity) => (
          <li key={activity.id} className="flex items-center space-x-3">
            {getIcon(activity.type)}
            <div>
              <p className="text-gray-700 text-sm">{activity.description}</p>
              <p className="text-gray-400 text-xs">{new Date(activity.date).toLocaleDateString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
