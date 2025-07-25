import { Newspaper as NewspaperIcon } from 'lucide-react';
import React from 'react';

const Newspaper = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <NewspaperIcon size={24} className="text-blue-600" />
        Noticias y Avisos
      </h2>

      <div className="space-y-4">
        <Card
          title="Mantenimiento del ascensor"
          content="El ascensor principal estará fuera de servicio el próximo martes de 9:00 AM a 2:00 PM para mantenimiento preventivo."
          fecha="Publicado hace 2 días"
        />
        <Card
          title="Nuevas normas de convivencia"
          content="Se han actualizado las normas de convivencia. Por favor, revisa el documento adjunto."
          fecha="Publicado hace 1 semana"
        />
      </div>
    </div>
  );
};

const Card = ({ title, content, fecha }: any) => (
  <div className="border p-4 rounded-md bg-slate-50">
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-gray-700">{content}</p>
    <p className="text-sm text-gray-500 mt-2">{fecha}</p>
  </div>
);

export default Newspaper;
