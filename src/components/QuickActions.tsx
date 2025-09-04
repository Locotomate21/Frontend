import React from 'react';
import { PlusCircle, ClipboardList, Wrench } from 'lucide-react';

interface QuickActionsProps {
  setActiveSection: (section: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ setActiveSection }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setActiveSection('addResident')}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          <PlusCircle size={20} />
          <span>Agregar Residente</span>
        </button>

        <button
          onClick={() => setActiveSection('viewReports')}
          className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          <ClipboardList size={20} />
          <span>Ver Reportes</span>
        </button>

        <button
          onClick={() => setActiveSection('repairs')}
          className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          <Wrench size={20} />
          <span>Reparaciones</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
