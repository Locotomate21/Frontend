import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '@/axios';

interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roomNumber?: string;
  entryDate?: string;
}

const ProfilePage = () => {
  const { auth } = useAuthStore((state) => state);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get('/resident/me', {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = res.data;
        // Mapear datos del backend al formato de frontend
        setProfile({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '', // si lo tienes en el schema
          role: data.role,
          roomNumber: data.room?.number?.toString() || '',
          entryDate: data.enrollmentDate
            ? new Date(data.enrollmentDate).toLocaleDateString()
            : '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth?.token]);

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

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
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
          <div className="space-y-4">
            <Input label="Nombre completo" value={profile?.fullName || ''} />
            <Input label="Email" value={profile?.email || ''} />
            <Input label="Teléfono" value={profile?.phone || ''} />
            <Input label="Rol" value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ''} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de Residencia</h3>
          <div className="space-y-4">
            <Input label="Número de habitación" value={profile?.roomNumber || ''} />
            <Input label="Fecha de ingreso" value={profile?.entryDate || ''} />
          </div>
        </div>
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

export default ProfilePage;
