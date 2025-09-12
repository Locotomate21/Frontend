    import React, { useEffect, useState } from "react";
    import { AlertCircle, CheckCircle, Scale, X, Calendar, User, FileText } from "lucide-react";
    import jwtDecode from "jwt-decode";

    type DisciplinaryMeasure = {
    _id: string;
    title: string;
    description: string;
    status: "Activa" | "Resuelta";
    residentId?: { _id: string; fullName?: string } | string;
    createdAt?: string;
    createdBy?: { fullName: string; role: string };
    };

    type TokenPayload = {
    sub: string;
    role: string;
    fullName?: string;
    floor?: number;
    };

    export default function DisciplinaryPage() {
    const [measures, setMeasures] = useState<DisciplinaryMeasure[]>([]);
    const [selectedMeasure, setSelectedMeasure] = useState<DisciplinaryMeasure | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeasures = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay token disponible");

            const payload: TokenPayload = jwtDecode(token);

            // Endpoint según rol
            let endpoint = "http://localhost:3000/disciplinary-measures/my/measures";
            if (
            payload.role === "representative" ||
            payload.role === "floor_auditor" ||
            payload.role === "president" ||
            payload.role === "general_auditor"
            ) {
            endpoint = "http://localhost:3000/disciplinary-measures";
            }

            const res = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al obtener medidas");

            const data = await res.json();
            console.log("Medidas recibidas:", data);
            setMeasures(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };

        fetchMeasures();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        });
    };

    const openModal = (measure: DisciplinaryMeasure) => {
        setSelectedMeasure(measure);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMeasure(null);
    };

    if (loading) {
        return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Scale className="w-8 h-8 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-500">Cargando medidas disciplinarias...</p>
            </div>
        </div>
        );
    }

    return (
        <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                <h2 className="text-2xl font-bold text-gray-900">Medidas Disciplinarias</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Listado de medidas correctivas activas y resueltas
                </p>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{measures.length} medidas</span>
                </div>
            </div>
            </div>

            {/* Lista de medidas */}
            <div className="divide-y divide-gray-100">
            {measures.length === 0 ? (
                <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Scale className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay medidas disciplinarias disponibles
                </h3>
                <p className="text-gray-500">
                    Las medidas disciplinarias aparecerán aquí cuando sean creadas.
                </p>
                </div>
            ) : (
                measures.map((measure, index) => (
                <div
                    key={measure._id}
                    className="group hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="p-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1 min-w-0">
                        <h3
                            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer group-hover:text-blue-600 transition-colors duration-200"
                            onClick={() => openModal(measure)}
                        >
                            {measure.title}
                        </h3>

                        <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-2">
                            {measure.createdAt && (
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(measure.createdAt)}
                            </div>
                            )}
                            {measure.residentId && typeof measure.residentId !== "string" && (
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {(measure.residentId as any).fullName}
                            </div>
                            )}
                            {measure.createdBy && (
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                Creada por: {measure.createdBy.fullName}
                            </div>
                            )}
                        </div>

                        <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            measure.status === "Activa"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                        >
                            {measure.status === "Activa" ? (
                            <div className="flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {measure.status}
                            </div>
                            ) : (
                            <div className="flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {measure.status}
                            </div>
                            )}
                        </span>
                        </div>
                    </div>

                    {/* Indicador de novedad para medidas activas */}
                    {index === 0 && measure.status === "Activa" && (
                        <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></div>
                    )}
                    </div>
                </div>
                ))
            )}
            </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedMeasure && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
                <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={closeModal}
                ></div>

                <div className="relative inline-block align-bottom bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                    <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Detalles de la Medida Disciplinaria</h3>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-3">
                    <h2 className="text-xl font-bold text-gray-900">{selectedMeasure.title}</h2>
                    <div className="flex flex-col space-y-1 text-gray-600 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">{selectedMeasure.description}</p>
                    </div>
                    
                    {selectedMeasure.createdAt && (
                        <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Creada el {formatDate(selectedMeasure.createdAt)}
                        </div>
                    )}
                    
                    {selectedMeasure.residentId && typeof selectedMeasure.residentId !== "string" && (
                        <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Residente: {(selectedMeasure.residentId as any).fullName}
                        </div>
                    )}
                    
                    {selectedMeasure.createdBy && (
                        <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Creada por: {selectedMeasure.createdBy.fullName} ({selectedMeasure.createdBy.role})
                        </div>
                    )}
                    <span
                        className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                            selectedMeasure.status === "Activa"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                        }`}
                    >
                        {selectedMeasure.status === "Activa" ? (
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {selectedMeasure.status}
                        </div>
                        ) : (
                        <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {selectedMeasure.status}
                        </div>
                        )}
                    </span>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
                    <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                    Cerrar
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </>
    );
    }