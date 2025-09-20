import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "../store/authStore";
import api from "../services/axios";

interface ProfileData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  roomNumber?: string;
  entryDate?: string;
  idNumber?: number;
  studentCode?: number;
  academicProgram?: string;
  admissionYear?: number;
  period?: string;
  benefitOrActivity?: string;
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
        const res = await api.get("/resident/me", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        const data = res.data;
        setProfile({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone?.toString() || "",
          role: data.role,
          roomNumber: data.room?.number?.toString() || "",
          entryDate: data.enrollmentDate
            ? new Date(data.enrollmentDate).toLocaleDateString()
            : "",
          idNumber: data.idNumber,
          studentCode: data.studentCode,
          academicProgram: data.academicProgram,
          admissionYear: data.admissionYear,
          period: data.period,
          benefitOrActivity: data.benefitOrActivity,
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Error al cargar perfil"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth?.token]);

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto mt-10">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <User className="h-7 w-7 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Perfil del Usuario</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="residencia">Datos de Residencia</TabsTrigger>
          <TabsTrigger value="academico">Datos Académicos</TabsTrigger>
        </TabsList>

        {/* Personal */}
        <TabsContent value="personal">
          <Card title="Información Personal">
            <InfoItem label="Nombre completo" value={profile?.fullName} />
            <InfoItem label="Email" value={profile?.email} />
            <InfoItem label="Teléfono" value={profile?.phone} />
            <InfoItem
              label="Rol"
              value={
                profile?.role
                  ? profile.role.charAt(0).toUpperCase() +
                    profile.role.slice(1)
                  : ""
              }
            />
          </Card>
        </TabsContent>

        {/* Residencia */}
        <TabsContent value="residencia">
          <Card title="Datos de Residencia">
            <InfoItem label="Número de habitación" value={profile?.roomNumber} />
            <InfoItem label="Fecha de ingreso" value={profile?.entryDate} />
          </Card>
        </TabsContent>

        {/* Académicos */}
        <TabsContent value="academico">
          {(profile?.role === "resident" || profile?.role === "representative") ? (
            <Card title="Datos Académicos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="ID" value={profile?.idNumber?.toString()} />
                <InfoItem
                  label="Código Estudiantil"
                  value={profile?.studentCode?.toString()}
                />
                <InfoItem
                  label="Programa Académico"
                  value={profile?.academicProgram}
                />
                <InfoItem
                  label="Año de Admisión"
                  value={profile?.admissionYear?.toString()}
                />
                <InfoItem label="Periodo" value={profile?.period} />
                <InfoItem
                  label="Beneficio/Actividad"
                  value={profile?.benefitOrActivity}
                />
              </div>
            </Card>
          ) : (
            <p className="text-gray-500">Sin datos académicos disponibles</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between border-b border-gray-100 pb-2">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value || "-"}</span>
  </div>
);

export default ProfilePage;
