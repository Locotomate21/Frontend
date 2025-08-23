    import { AlertTriangle } from 'lucide-react';
    import React from 'react';

    interface DisciplinaryPage {
    titulo: string;
    descripcion: string;
    estado: 'Activa' | 'Resuelta';
    }

    const medidas: DisciplinaryPage[] = [
    {
        titulo: 'Ruido excesivo - Habitación 312',
        descripcion: 'Reporte de ruido después de las 11:00 PM. Primera advertencia emitida.',
        estado: 'Activa',
    },
    {
        titulo: 'Uso indebido de áreas comunes - Habitación 205',
        descripcion: 'Caso resuelto mediante diálogo y compromiso del residente.',
        estado: 'Resuelta',
    },
    ];

    const EstadoBadge = ({ estado }: { estado: string }) => {
    const color =
        estado === 'Activa'
        ? 'bg-orange-100 text-orange-800'
        : 'bg-green-100 text-green-800';

    return (
        <span className={`px-3 py-1 rounded-md text-xs sm:text-sm font-semibold ${color}`}>
        {estado}
        </span>
    );
    };

    const DisciplinaryPage = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            Medidas Disciplinarias
            </h2>

            {medidas.map((medida, index) => (
            <div
                key={index}
                className={`border rounded-lg p-4 mb-4 ${
                medida.estado === 'Activa'
                    ? 'border-orange-200 bg-orange-50'
                    : 'border-gray-200 bg-white'
                }`}
            >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {medida.titulo}
                </h3>
                <p className="text-sm text-gray-700">{medida.descripcion}</p>
                <div className="mt-2">
                <EstadoBadge estado={medida.estado} />
                </div>
            </div>
            ))}
        </div>
        </div>
    );
    };

    export default DisciplinaryPage;
