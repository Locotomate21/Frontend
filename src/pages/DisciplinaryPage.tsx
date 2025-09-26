import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Scale,
  X,
  Calendar,
  User,
  FileText,
  Trash2,
  RefreshCcw,
  Plus,
  Edit,
  Clock,
} from "lucide-react";
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

const DisciplinaryPage: React.FC = () => {
  const [measures, setMeasures] = useState<DisciplinaryMeasure[]>([]);
  const [selectedMeasure, setSelectedMeasure] =
    useState<DisciplinaryMeasure | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para crear nueva medida - CAMBIADO: usando studentCode
  const [newMeasure, setNewMeasure] = useState({
    title: "",
    description: "",
    studentCode: "", // ← Cambié de residentId a studentCode
    status: "Activa" as "Activa" | "Resuelta",
  });

  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<"all" | "Activa" | "Resuelta">("all");
  
  // Obtener datos del token
  const token = localStorage.getItem("token");
  let userRole = "";
  let userName = "";
  
  if (token) {
    try {
      const payload: TokenPayload = jwtDecode(token);
      userRole = payload.role;
      userName = payload.fullName || "";
    } catch (error) {
      console.error("Error decodificando token:", error);
    }
  }

  // Función para determinar si el usuario puede crear medidas
  const canCreate = 
    userRole === "admin" ||
    userRole === "general_auditor" ||
    userRole === "representative" ||
    userRole === "floor_auditor" ||
    userRole === "president";

  // Función para determinar si puede editar/eliminar
  const canEditOrDelete = (measure: DisciplinaryMeasure) => {
    if (userRole === "admin" || userRole === "general_auditor" || userRole === "president") return true;
    if (userRole === "representative" || userRole === "floor_auditor") {
      // Si no hay createdBy, permitir editar (medidas legacy)
      if (!measure.createdBy) return true;
      // Si hay createdBy, verificar que coincida
      return measure.createdBy.fullName === userName;
    }
    return false;
  };

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

  const getStatus = (measure: DisciplinaryMeasure) => {
    if (measure.status === "Activa")
      return {
        label: "Activa",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: AlertCircle,
      };
    return {
      label: "Resuelta",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: CheckCircle,
    };
  };

  const openModal = (measure: DisciplinaryMeasure) => {
    setSelectedMeasure(measure);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMeasure(null);
  };

  // Crear nueva medida - ARREGLADO: sintaxis y usando studentCode
  const createMeasure = async () => {
    if (!newMeasure.title.trim()) {
      alert("Debes ingresar un título para la medida.");
      return;
    }
    if (!newMeasure.description.trim()) {
      alert("Debes ingresar una descripción para la medida.");
      return;
    }
    if (!newMeasure.studentCode.trim()) {
      alert("Debes ingresar el código del estudiante.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Preparar datos para enviar al backend
      const measureData = {
        title: newMeasure.title,
        description: newMeasure.description,
        studentCode: Number(newMeasure.studentCode), // Convertir a número
        status: newMeasure.status,
      };

      const res = await fetch("http://localhost:3000/disciplinary-measures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(measureData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error(`Error ${res.status}: ${errorData}`);
        throw new Error(`Error creando medida: ${res.status}`);
      }

      setIsCreateModalOpen(false);
      setNewMeasure({
        title: "",
        description: "",
        studentCode: "",
        status: "Activa",
      });
      
      // Recargar medidas
      window.location.reload();
    } catch (err) {
      console.error("Error creando medida:", err);
      alert("Error al crear la medida. Revisa la consola para más detalles.");
    }
  };

  // Cambiar estado
  const updateStatus = async (id: string, newStatus: "Activa" | "Resuelta") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/disciplinary-measures/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error(`Error ${res.status}: ${errorData}`);
        throw new Error(`Error actualizando estado: ${res.status}`);
      }

      const updated = await res.json();
      setMeasures(measures.map((m) => (m._id === id ? updated : m)));
      setSelectedMeasure(updated);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  // Eliminar medida
  const deleteMeasure = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta medida disciplinaria?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/disciplinary-measures/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.text();
        console.error(`Error ${res.status}: ${errorData}`);
        throw new Error(`Error eliminando medida: ${res.status}`);
      }

      setMeasures(measures.filter((m) => m._id !== id));
      closeModal();
    } catch (err) {
      console.error("Error eliminando medida:", err);
    }
  };

  // Filtrar medidas
  const filteredMeasures = measures.filter(measure => {
    if (statusFilter === "all") return true;
    return measure.status === statusFilter;
  });

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
              <h2 className="text-2xl font-bold text-gray-900">
                Medidas Disciplinarias
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestión de medidas correctivas y seguimiento de acciones
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Filtro por estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "Activa" | "Resuelta")}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las medidas</option>
                <option value="Activa">Activas</option>
                <option value="Resuelta">Resueltas</option>
              </select>
              
              {canCreate && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" /> 
                  Nueva Medida
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de medidas */}
        <div className="divide-y divide-gray-100">
          {filteredMeasures.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Scale className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay medidas disciplinarias disponibles
              </h3>
              <p className="text-gray-500">
                {statusFilter !== "all" 
                  ? `No hay medidas ${statusFilter.toLowerCase()} en este momento.`
                  : "Las medidas disciplinarias aparecerán aquí cuando sean creadas."
                }
              </p>
            </div>
          ) : (
            filteredMeasures.map((measure, index) => {
              const status = getStatus(measure);
              const StatusIcon = status.icon;

              return (
                <div
                  key={measure._id}
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6 relative flex justify-between items-start">
                    {/* Indicador para la medida más reciente */}
                    {index === 0 && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                    )}

                    <div className="flex-1">
                      {/* Estado y fecha */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                        {measure.createdAt && (
                          <>
                            <span className="text-xs text-gray-500">
                              {getTimeAgo(measure.createdAt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(measure.createdAt)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Título */}
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                        onClick={() => openModal(measure)}
                      >
                        {measure.title}
                      </h3>

                      {/* Información adicional */}
                      <div className="space-y-1">
                        {/* Residente */}
                        {measure.residentId &&
                          typeof measure.residentId !== "string" && (
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            {(measure.residentId as any).fullName}
                          </div>
                        )}

                        {/* Creado por */}
                        {measure.createdBy && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Creada por:</span> {measure.createdBy.fullName}
                          </div>
                        )}

                        {/* Descripción (truncada) */}
                        {measure.description && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Descripción:</span> {
                              measure.description.length > 100 
                                ? `${measure.description.substring(0, 100)}...` 
                                : measure.description
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {canEditOrDelete(measure) && (
                      <div className="flex justify-between pt-4 border-t">
                        {/* Botón de editar */}
                        <button
                          onClick={() => {/* Aquí iría la función para editar */}}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Editar medida"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Botón cambiar estado - solo si está activa */}
                        {measure.status === "Activa" && (
                          <button
                            onClick={() => updateStatus(measure._id, "Resuelta")}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Marcar como resuelta"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => deleteMeasure(measure._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Eliminar medida"
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

      {/* Modal de detalles */}
      {isModalOpen && selectedMeasure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Medida Disciplinaria</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedMeasure.title}
                </h2>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{selectedMeasure.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedMeasure.createdAt && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Creada el {formatDate(selectedMeasure.createdAt)}</span>
                  </div>
                )}

                {selectedMeasure.residentId &&
                  typeof selectedMeasure.residentId !== "string" && (
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>Residente: {(selectedMeasure.residentId as any).fullName}</span>
                  </div>
                )}

                {selectedMeasure.createdBy && (
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Creada por: {selectedMeasure.createdBy.fullName}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedMeasure.status === "Activa"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedMeasure.status === "Activa" ? (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {selectedMeasure.status}
                  </span>
                </div>
              </div>

              {/* Botones de acción en el modal */}
              {canEditOrDelete(selectedMeasure) && (
                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() =>
                      updateStatus(
                        selectedMeasure._id,
                        selectedMeasure.status === "Activa" ? "Resuelta" : "Activa"
                      )
                    }
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Cambiar estado
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteMeasure(selectedMeasure._id)}
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

      {/* Modal Crear Nueva Medida */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">Nueva Medida Disciplinaria</h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título de la medida"
                value={newMeasure.title}
                onChange={(e) =>
                  setNewMeasure({ ...newMeasure, title: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Descripción detallada de la medida disciplinaria..."
                value={newMeasure.description}
                onChange={(e) =>
                  setNewMeasure({ ...newMeasure, description: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
                rows={4}
              />

              <input
                type="number"
                placeholder="Código de estudiante (ej: 20165)"
                value={newMeasure.studentCode}
                onChange={(e) =>
                  setNewMeasure({ ...newMeasure, studentCode: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado inicial
                </label>
                <select
                  value={newMeasure.status}
                  onChange={(e) =>
                    setNewMeasure({ ...newMeasure, status: e.target.value as "Activa" | "Resuelta" })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Activa">Activa</option>
                  <option value="Resuelta">Resuelta</option>
                </select>
              </div>

              <button
                onClick={createMeasure}
                className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors"
              >
                Crear Medida
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisciplinaryPage;