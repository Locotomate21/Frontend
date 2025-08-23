import React from 'react';
import { User, LogOut } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-5xl mx-auto mt-10">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="h-7 w-7 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Perfil del Usuario</h2>
        </div>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información Personal */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
          <div className="space-y-4">
            <Input label="Nombre completo" value="Ana García Rodríguez" />
            <Input label="Email" value="ana.garcia@residencia.edu" />
            <Input label="Teléfono" value="+57 310 456 7890" />
            <Input label="Rol" value="Residente" />
          </div>
        </div>

        {/* Información de Residencia */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de Residencia</h3>
          <div className="space-y-4">
            <Input label="Número de habitación" value="B-203" />
            <Input label="Fecha de ingreso" value="01/02/2024" />
            <Input label="Duración de contrato" value="2 semestres" />
          </div>
        </div>
      </div>

      {/* Configuración */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h3>
        <div className="space-y-4">
          <ToggleSetting label="Recibir notificaciones por email" enabled />
        </div>
      </div>

      {/* Botón Editar */}
      <div className="mt-8 flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

const Input = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      readOnly
      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
    />
  </div>
);

const ToggleSetting = ({ label, enabled }: { label: string; enabled: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      ></span>
    </button>
  </div>
);

export default ProfilePage;

