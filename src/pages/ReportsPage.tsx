import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Clock,
  User,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Trash2,
  Settings,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Report {
  _id: string;
  reason: string;
  actionTaken: boolean;
  urgent?: boolean;
  date: string;
  resident?: { fullName: string; room?: { number: number; floor: number } };
  createdBy?: { fullName: string };
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const auth = useAuthStore((state) => state.auth);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!auth.token) return;
    try {
      const res = await axios.get("http://localhost:3000/reports", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Fecha inválida"
      : date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
      return "Hace 1 día";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Hace ${days} días`;
    }
  };

  const truncateReason = (reason: string, maxLength: number = 120) => {
    if (reason.length <= maxLength) return reason;
    return reason.substring(0, maxLength) + "...";
  };

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const getStatus = (report: Report) => {
    if (report.urgent)
      return { label: "Urgente", color: "red", bgColor: "bg-red-100", textColor: "text-red-800" };
    if (report.actionTaken)
      return { label: "Finalizado", color: "green", bgColor: "bg-green-100", textColor: "text-green-800" };
    return { label: "Pendiente", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800" };
  };

  const updateReport = async (id: string, data: Partial<Report>) => {
    try {
      await axios.patch(`http://localhost:3000/reports/${id}`, data, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      fetchReports();
      closeModal();
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/reports/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      fetchReports();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
    }
  };

  const totalReports = reports.length;
  const urgentReports = reports.filter((r) => r.urgent).length;
  const pendingReports = reports.filter((r) => !r.actionTaken).length;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reportes de Mantenimiento
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de reportes y seguimiento de acciones
              </p>
            </div>
            <div className="flex items-center space-x-4 text-blue-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{totalReports} reportes</span>
              </div>
              {urgentReports > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{urgentReports} urgentes</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="divide-y divide-gray-100">
          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-500">
                Los nuevos reportes de mantenimiento aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          ) : (
            reports.map((report, index) => {
              const status = getStatus(report);
              
              return (
                <div
                  key={report._id}
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Estado y fecha */}
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {status.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(report.date)}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <FileText className="w-3 h-3 mr-1" />
                            {formatDate(report.date)}
                          </div>
                        </div>

                        {/* Título/Razón */}
                        <h3
                          className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                          onClick={() => openModal(report)}
                        >
                          {report.reason}
                        </h3>

                        {/* Información del residente */}
                        {report.resident && (
                          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>Reportado por {report.resident.fullName}</span>
                            </div>
                            {report.resident.room && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>Habitación {report.resident.room.number}, Piso {report.resident.room.floor}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="flex items-center text-sm text-gray-500">
                          <Settings className="w-4 h-4 mr-1" />
                          <span>
                            Estado: {report.actionTaken ? "Completado" : "En proceso"}
                            {report.urgent && " • Prioridad alta"}
                          </span>
                        </div>
                      </div>

                      {/* Botón ver más */}
                      <div className="flex-shrink-0 ml-4">
                        <button
                          onClick={() => openModal(report)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          Ver más
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>

                    {/* Indicador de prioridad urgente */}
                    {report.urgent && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></div>
                    )}
                    
                    {/* Indicador del primer elemento */}
                    {index === 0 && !report.urgent && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal */}
            <div className="relative inline-block align-bottom bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Detalle del Reporte
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedReport.date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="px-6 py-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedReport.reason}
                </h2>

                <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
                  {selectedReport.resident && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>Por {selectedReport.resident.fullName}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{getTimeAgo(selectedReport.date)}</span>
                  </div>
                  {selectedReport.resident?.room && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Hab. {selectedReport.resident.room.number}, Piso {selectedReport.resident.room.floor}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Estado:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatus(selectedReport).bgColor} ${getStatus(selectedReport).textColor}`}>
                        {getStatus(selectedReport).label}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Prioridad:</span>
                      <span className="ml-2 text-gray-600">
                        {selectedReport.urgent ? "Alta" : "Normal"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700">
                    <span className="font-semibold">Descripción:</span>
                    <p className="mt-2 leading-relaxed">{selectedReport.reason}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Creado el {formatDate(selectedReport.date)}
                  </div>
                  <div className="flex space-x-3">
                    {!selectedReport.actionTaken && (
                      <button
                        onClick={() =>
                          updateReport(selectedReport._id, { actionTaken: true })
                        }
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Marcar como completado
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(selectedReport._id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
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
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsPage;