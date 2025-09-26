import React, { useEffect, useState } from "react"; 
import axios from "axios";
import {
  X,
  Clock,
  User,
  Trash2,
  MapPin,
  CheckCircle2,
  Plus,
  Edit,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Report {
  _id: string;
  reason: string;
  actionTaken?: string;
  urgent?: boolean;
  date: string;
  room?: string;
  description?: string; 
  location?: string;
  studentCode?: number;
  resident?: {
    _id?: string;
    fullName: string;
    studentCode?: number;
    room?: { number: number; floor: number };
  };
  createdBy?: { fullName: string };
}

  const initialNewReport = {
    studentCode: '', // En lugar de 0
    reason: "",
    actionTaken: "",
    urgent: false,
    room: "",
    description: "",
    location: "room",
  };

const initialEditReport: Partial<Report> = {
  _id: "",
  studentCode: 0,
  reason: "",
  actionTaken: "",
  urgent: false,
  room: "",
  description: "",
  location: "room",
};

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newReport, setNewReport] = useState(initialNewReport);
  const [editReport, setEditReport] = useState(initialEditReport);
  const { role, fullName, token } = useAuthStore((state) => state.auth);

  const canCreate =
    role === "admin" ||
    role === "general_auditor" ||
    role === "representative" ||
    role === "floor_auditor";

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:3000/report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    }
  };

  const createReport = async () => {
  const studentCodeNumber = Number(newReport.studentCode);
  if (!newReport.studentCode || isNaN(studentCodeNumber) || studentCodeNumber <= 0) {
    alert("Debes ingresar un código de estudiante válido.");
    return;
  }

    if (!newReport.reason.trim()) {
    alert("Debes ingresar un motivo para el reporte.");
    return;
  }

  try {
    const reportData = {
      ...newReport,
      studentCode: newReport.studentCode ? Number(newReport.studentCode) : undefined,
    };

      // Si es habitación, no mandamos room porque viene del residente
      if (newReport.location === "common_area" && newReport.room) {
        reportData.room = newReport.room;
      }

      await axios.post("http://localhost:3000/report", reportData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsCreateModalOpen(false);
      setNewReport(initialNewReport);
      fetchReports();
    } catch (error: any) {
      console.error("Error al crear reporte:", error);
      if (error.response?.data?.message) {
        alert(`Error del servidor: ${error.response.data.message}`);
      }
    }
  };

  const updateReport = async (id: string, data: Partial<Report>) => {
    try {
      await axios.patch(`http://localhost:3000/report/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
      closeModal();
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
    }
  };

  const updateReportComplete = async () => {
    if (!editReport.studentCode || !editReport.reason) {
      alert("Debes ingresar un código de estudiante y un motivo.");
      return;
    }

    try {
      const updateData = { ...editReport };

      if (updateData.location === "room") {
        delete updateData.room;
      }

      await axios.patch(`http://localhost:3000/report/${editReport._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditModalOpen(false);
      setEditReport(initialEditReport);
      fetchReports();
    } catch (err) {
      console.error("Error al actualizar reporte:", err);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchReports();
      closeModal();
    } catch (err) {
      console.error("Error al eliminar reporte:", err);
    }
  };

  const canEditOrDelete = (report: Report) => {
    if (role === "admin" || role === "general_auditor") return true;
    if (
      (role === "representative" || role === "floor_auditor") &&
      report.createdBy?.fullName === fullName
    ) {
      return true;
    }
    return false;
  };

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const openEditModal = (report: Report) => {
    setEditReport({
      _id: report._id,
      studentCode: report.studentCode || report.resident?.studentCode || 0,
      reason: report.reason,
      actionTaken: report.actionTaken || "",
      urgent: report.urgent || false,
      room: report.room || "",
      description: report.description || "",
      location: report.location || "room",
    });
    setIsEditModalOpen(true);
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

  const getStatus = (report: Report) => {
    if (report.urgent)
      return {
        label: "Urgente",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
      };
    if (report.actionTaken)
      return {
        label: "Finalizado",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
      };
    return {
      label: "Pendiente",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    };
  };

  

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reportes de Mantenimiento
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestión de reportes y seguimiento de acciones
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Reporte
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-100">
          {reports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hay reportes disponibles
            </div>
          ) : (
            reports.map((report, index) => {
              const status = getStatus(report);

              return (
                <div
                  key={report._id}
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6 relative flex justify-between items-start">
                    <div className="flex-1">
                    {/* Indicador para el reporte más reciente */}
                    {index === 0 && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                    )}

                    {/* Indicador lateral para reportes urgentes (solo si no es el primero) */}
                    {report.urgent && index !== 0 && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-r-full"></div>
                    )}

                    <div className="flex-1">
                      {/* Estado y fecha */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(report.date)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(report.date)}
                        </span>
                      </div>

                      {/* Título */}
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                        onClick={() => openModal(report)}
                      >
                        {report.reason}
                      </h3>

                      {/* Información adicional */}
                      <div className="space-y-1">
                        {/* Residente */}
                        {report.resident && (
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {report.resident.fullName}
                            </span>
                            {report.resident.room && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                Hab. {report.resident.room.number}, Piso{" "}
                                {report.resident.room.floor}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Ubicación del daño */}
                        {report.room && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Ubicación:</span> {report.room}
                          </div>
                        )}

                        {/* Descripción */}
                        {report.description && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Descripción:</span> {
                            report.description
                              .length > 100
                              ? `${report.description.substring(0, 100)}...`
                              : report.description
                            }
                          </div>
                        )}
                      </div>
                    </div>
                </div>
                    {/* Acciones */}
                    {canEditOrDelete(report) && (
                      <div className="flex justify-between pt-4 border-t">
                        {/* Botón de editar */}
                        <button
                          onClick={() => openEditModal(report)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Editar reporte"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Botón finalizar */}
                        {!report.actionTaken && (
                          <button
                            onClick={() => updateReport(report._id, { actionTaken: "Finalizado" })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Marcar como finalizado"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                          </button>
                        )}
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => deleteReport(report._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Eliminar reporte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

              {/* Modal de detalles mejorado */}
              {isModalOpen && selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <h3 className="text-lg font-semibold">Detalles del Reporte</h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Título y descripción */}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedReport.reason}
                        </h2>
                        {selectedReport.description && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-700">{selectedReport.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Info adicional */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {selectedReport.date && (
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Creado el {formatDate(selectedReport.date)}</span>
                          </div>
                        )}

                        {selectedReport.resident && (
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>Residente: {selectedReport.resident.fullName}</span>
                          </div>
                        )}

                        {selectedReport.createdBy && (
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>Creado por: {selectedReport.createdBy.fullName}</span>
                          </div>
                        )}

                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              selectedReport.urgent
                                ? "bg-red-100 text-red-800"
                                : selectedReport.actionTaken
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedReport.urgent ? "Urgente" : selectedReport.actionTaken ? "Finalizado" : "Pendiente"}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      {canEditOrDelete(selectedReport) && (
                        <div className="flex justify-end pt-4 border-t">
                          {!selectedReport.actionTaken && (
                            <button
                              onClick={() =>
                                updateReport(selectedReport._id, { actionTaken: "Finalizado" })
                              }
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Marcar como Finalizado
                            </button>
                          )}

                          <div className="flex space-x-2">
                            <button
                              onClick={() => deleteReport(selectedReport._id)}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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
                      )}
                    </div>
                  </div>
                </div>
              )}

      {/* Modal Crear */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">Nuevo Reporte</h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Código de estudiante (ej: 20165)"
                value={newReport.studentCode}
                onChange={(e) =>
                  setNewReport({ ...newReport, studentCode: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              {/* Selector de ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación del daño
                </label>
                <select
                  value={newReport.location}
                  onChange={(e) =>
                    setNewReport({
                      ...newReport,
                      location: e.target.value,
                      room: "",
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="room">Habitación específica</option>
                  <option value="common_area">Área común</option>
                </select>
              </div>

              {/* Campo de habitación/área: solo aparece si es common_area */}
              {newReport.location === "common_area" && (
                <input
                  type="text"
                  placeholder="Área común (ej: piso_2_cocina)"
                  value={newReport.room}
                  onChange={(e) =>
                    setNewReport({ ...newReport, room: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              )}

              <input
                type="text"
                placeholder="Título del problema (ej: Filtración en el baño)"
                value={newReport.reason}
                onChange={(e) =>
                  setNewReport({ ...newReport, reason: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Descripción detallada del daño..."
                value={newReport.description}
                onChange={(e) =>
                  setNewReport({ ...newReport, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                rows={3}
              />

              <input
                type="text"
                placeholder="Acción tomada (opcional)"
                value={newReport.actionTaken}
                onChange={(e) =>
                  setNewReport({ ...newReport, actionTaken: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newReport.urgent}
                  onChange={(e) =>
                    setNewReport({ ...newReport, urgent: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Marcar como urgente</span>
              </label>

              <button
                onClick={createReport}
                className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
              >
                Crear Reporte
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Editar */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">Editar Reporte</h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Código de estudiante (ej: 20165)"
                value={editReport.studentCode}
                onChange={(e) =>
                  setEditReport({ ...editReport, studentCode: Number(e.target.value) })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación del daño
                </label>
                <select
                  value={editReport.location}
                  onChange={(e) =>
                    setEditReport({ ...editReport, location: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="room">Habitación específica</option>
                  <option value="common_area">Área común</option>
                </select>
              </div>

              <input
                type="text"
                placeholder={editReport.location === "room" ? "Número de habitación (ej: 224)" : "Área común (ej: piso_2_cocina)"}
                value={editReport.room}
                onChange={(e) =>
                  setEditReport({ ...editReport, room: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              
              <input
                type="text"
                placeholder="Motivo del reporte"
                value={editReport.reason}
                onChange={(e) =>
                  setEditReport({ ...editReport, reason: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Descripción detallada del daño..."
                value={editReport.description}
                onChange={(e) =>
                  setEditReport({ ...editReport, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                rows={3}
              />
              
              <input
                type="text"
                placeholder="Acción tomada (opcional)"
                value={editReport.actionTaken}
                onChange={(e) =>
                  setEditReport({ ...editReport, actionTaken: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editReport.urgent}
                  onChange={(e) =>
                    setEditReport({ ...editReport, urgent: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Marcar como urgente</span>
              </label>
              
              <button
                onClick={updateReportComplete}
                className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
              >
                Actualizar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportsPage;