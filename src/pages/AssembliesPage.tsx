import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  RefreshCcw,
} from "lucide-react";
import api from "../services/axios";
import { useAuthStore } from "../store/authStore";

interface Assembly {
  _id: string;
  title: string;
  date: string;
  time: string;
  urgent?: boolean;
  location: string;
  attendance?: {
    present: number;
    total: number;
  };
  status: "Programada" | "Completada" | "Aplazada" | "Cancelada";
  type: "general" | "floor";
  floor?: number;
  createdBy?: string;
  postponementReason?: string;
  description?: string;
  newDate?: string;
  newTime?: string;
}

const AssembliesPage = () => {
  // obtén role y floor desde tu store exactamente como lo usas ahora
  const { role, floor } = useAuthStore((state) => state.auth);

  const [assemblies, setAssemblies] = useState<Assembly[]>([]);

  // estados para crear/editar (ya los tenías)
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<"completed" | "postponed" | "cancelled" | null>(null);
  const [postponementData, setPostponementData] = useState({
    reason: "",
    newDate: "",
    newTime: ""
  });
  const [formData, setFormData] = useState<Partial<Assembly>>({
    title: "",
    date: "",
    time: "",
    location: "",
    status: "Programada",
    type: role === "representative" ? "floor" : "general",
    description: ""
  });
  const [isEditing, setIsEditing] = useState(false);

  // nuevos estados para modal de DETALLES (separado del modal de crear/editar)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsAssembly, setDetailsAssembly] = useState<Assembly | null>(null);

  useEffect(() => {
    fetchAssemblies();
  }, []);

  const fetchAssemblies = async () => {
    try {
      const res = await api.get("/assemblies");
      setAssemblies(res.data);
    } catch (err) {
      console.error("Error cargando asambleas:", err);
    }
  };

  // abrir modal crear/editar (ya existente)
  const openModal = (assembly?: Assembly) => {
    if (assembly) {
      setIsEditing(true);
      setFormData({ ...assembly });
      setSelectedAssembly(assembly);
    } else {
      setIsEditing(false);
      setFormData({
        title: "",
        date: "",
        time: "",
        location: "",
        status: "Programada",
        type: role === "representative" ? "floor" : "general",
        description: ""
      });
      setSelectedAssembly(null);
    }
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssembly(null);
    setFormData({});
  };

  // abrir modal de cambio de estado (ya existente)
  const openStatusModal = (assembly: Assembly, action: "completed" | "postponed" | "cancelled") => {
    setSelectedAssembly(assembly);
    setStatusAction(action);
    setIsStatusModalOpen(true);

    if (action === "postponed") {
      setPostponementData({ reason: "", newDate: "", newTime: "" });
    }
  };
  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedAssembly(null);
    setStatusAction(null);
    setPostponementData({ reason: "", newDate: "", newTime: "" });
  };

  // manejar el cambio de estado (usa tu endpoint ya creado)
  const updateStatus = async (id: string, updateData: any) => {
    try {
      const res = await api.patch(`/assemblies/${id}/status`, updateData);
      setAssemblies((prev) => prev.map((a) => (a._id === id ? res.data : a)));
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };
  const handleStatusChange = async () => {
    if (!selectedAssembly || !statusAction) return;
    let updateData: any = {};
    switch (statusAction) {
      case "completed":
        updateData = { status: "Completada" };
        break;
      case "cancelled":
        updateData = { status: "Cancelada" };
        break;
      case "postponed":
        if (!postponementData.reason.trim()) {
          alert("Debes proporcionar un motivo para el aplazamiento");
          return;
        }
        updateData = {
          status: "Aplazada",
          postponementReason: postponementData.reason,
          ...(postponementData.newDate && { newDate: postponementData.newDate }),
          ...(postponementData.newTime && { newTime: postponementData.newTime })
        };
        break;
    }

    await updateStatus(selectedAssembly._id, updateData);
    closeStatusModal();
  };

  // eliminar asamblea (se usa tanto dentro de la card como en el modal detalles)
  const deleteAssembly = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta asamblea?")) return;
    try {
      await api.delete(`/assemblies/${id}`);
      setAssemblies((prev) => prev.filter((a) => a._id !== id));
      // cerrar modales si están abiertos y apuntan a la misma asamblea
      if (detailsAssembly?._id === id) closeDetailsModal();
      if (selectedAssembly?._id === id) closeModal();
    } catch (err) {
      console.error("Error eliminando asamblea:", err);
    }
  };

  // helpers de UI
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-100 text-green-800 border-green-200";
      case "Aplazada":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelada":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completada":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "Aplazada":
        return <Clock className="w-4 h-4 mr-1" />;
      case "Cancelada":
        return <AlertCircle className="w-4 h-4 mr-1" />;
      default:
        return <Calendar className="w-4 h-4 mr-1" />;
    }
  };

  // permisos (igual que tenías)
  const canManage = (assembly: Assembly) => {
    const result =
      role === "admin" ||
      role === "president" ||
      role === "secretary_general" ||
      (role === "representative" && assembly.type === "floor" && assembly.floor === floor);
    return result;
  };

  // ---- DETALLES modal handlers ----
  const openDetailsModal = (assembly: Assembly) => {
    setDetailsAssembly(assembly);
    setIsDetailsOpen(true);
  };
  const closeDetailsModal = () => {
    setDetailsAssembly(null);
    setIsDetailsOpen(false);
  };

  // ordena para que la más reciente quede en index 0 y se resalte
  const sortedAssemblies = [...assemblies].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // guardar (crear/editar)
  const handleSave = async () => {
    try {
      if (!formData.title?.trim() || !formData.date || !formData.time || !formData.location?.trim()) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      if (isEditing && selectedAssembly) {
        const res = await api.put(`/assemblies/${selectedAssembly._id}`, formData);
        setAssemblies((prev) => prev.map((a) => (a._id === selectedAssembly._id ? res.data : a)));
      } else {
        const payload = { ...formData, ...(role === "representative" ? { floor } : {}) };
        const res = await api.post("/assemblies", payload);
        setAssemblies((prev) => [res.data, ...prev]); // insertamos al inicio
      }
      closeModal();
    } catch (err) {
      console.error("Error guardando asamblea:", err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asambleas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Consulta, crea y administra asambleas
            </p>
          </div>
          {(role === "admin" || role === "president" || role === "secretary_general" || role === "representative") && (
            <button
              onClick={() => openModal()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Asamblea
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="divide-y divide-gray-100">
          {sortedAssemblies.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No hay asambleas registradas.</div>
          ) : (
            sortedAssemblies.map((assembly, index) => (
              <div
                key={assembly._id}
                onClick={() => openDetailsModal(assembly)}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="p-6 relative flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                        <h3
                            onClick={() => openDetailsModal(assembly)}
                            className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            {assembly.title}
                          </h3>

                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(assembly.status)}`}>
                        {getStatusIcon(assembly.status)}
                        <span className="ml-1">{assembly.status}</span>
                      </span>

                      {assembly.type === "floor" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Piso {assembly.floor}
                        </span>
                      )}
                    </div>

                    {assembly.description && <p className="text-sm text-gray-600 mb-3">{assembly.description}</p>}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(assembly.date)} - {assembly.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {assembly.location}
                      </div>
                      {assembly.attendance && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {`${assembly.attendance.present}/${assembly.attendance.total} presentes`}
                        </div>
                      )}
                    </div>

                    {assembly.status === "Aplazada" && assembly.postponementReason && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm font-medium text-yellow-800">Motivo del aplazamiento:</p>
                        <p className="text-sm text-yellow-700">{assembly.postponementReason}</p>
                        {(assembly.newDate || assembly.newTime) && (
                          <p className="text-sm text-yellow-700 mt-1">
                            Nueva fecha: {assembly.newDate ? formatDate(assembly.newDate) : "Por definir"} {assembly.newTime && ` - ${assembly.newTime}`}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones (stopPropagation para que no abra modal) */}
                  {canManage(assembly) && (
                    <div className="flex justify-between pt-4 border-t">
                      {assembly.status === "Programada" && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusModal(assembly, "completed"); }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusModal(assembly, "postponed"); }}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                            title="Aplazar asamblea"
                          >
                            <Clock className="w-4 h-4"/>
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); openStatusModal(assembly, "cancelled"); }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Cancelar asamblea"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(assembly); }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Editar asamblea"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAssembly(assembly._id); }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Eliminar asamblea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Indicadores laterales */}
                  {assembly.urgent && <div className="absolute left-0 top-6 w-1 h-16 bg-red-500 rounded-r-full" />}

                  {/* Indicador para la asamblea más reciente */}
                  {index === 0 && <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{isEditing ? "Editar Asamblea" : "Nueva Asamblea"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Título *" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg p-2" required />
              <textarea placeholder="Descripción (opcional)" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2 h-20 resize-none" rows={3} />
              <input type="date" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border rounded-lg p-2" required />
              <input type="time" value={formData.time || ""} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full border rounded-lg p-2" required />
              <input type="text" placeholder="Ubicación *" value={formData.location || ""} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded-lg p-2" required />
              {(role === "admin" || role === "president" || role === "secretary_general") && (
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "floor" | "general" })} className="w-full border rounded-lg p-2">
                  <option value="general">General</option>
                  <option value="floor">De Piso</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={closeModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {isStatusModalOpen && selectedAssembly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {statusAction === "completed" && "Marcar como Completada"}
                {statusAction === "postponed" && "Aplazar Asamblea"}
                {statusAction === "cancelled" && "Cancelar Asamblea"}
              </h3>
              <button onClick={closeStatusModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">Asamblea: <strong>{selectedAssembly.title}</strong></p>

              {statusAction === "postponed" && (
                <div className="space-y-3">
                  <textarea placeholder="Motivo del aplazamiento *" value={postponementData.reason} onChange={(e) => setPostponementData({ ...postponementData, reason: e.target.value })} className="w-full border rounded-lg p-2 h-20 resize-none" required />
                  <input type="date" value={postponementData.newDate} onChange={(e) => setPostponementData({ ...postponementData, newDate: e.target.value })} className="w-full border rounded-lg p-2" />
                  <input type="time" value={postponementData.newTime} onChange={(e) => setPostponementData({ ...postponementData, newTime: e.target.value })} className="w-full border rounded-lg p-2" />
                </div>
              )}

              {statusAction === "completed" && <p className="text-sm text-gray-600">¿Confirmas que esta asamblea se ha completado exitosamente?</p>}
              {statusAction === "cancelled" && <p className="text-sm text-gray-600">¿Confirmas que deseas cancelar esta asamblea?</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={closeStatusModal} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleStatusChange} className={`px-4 py-2 text-white rounded-lg transition-colors ${statusAction === "completed" ? "bg-green-600 hover:bg-green-700" : statusAction === "postponed" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"}`}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de DETALLES (estructura y look similar a DisciplinaryPage) */}
      {isDetailsOpen && detailsAssembly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold">Detalles de la Asamblea</h3>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{detailsAssembly.title}</h2>

              {detailsAssembly.description && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-700">{detailsAssembly.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(detailsAssembly.date)} - {detailsAssembly.time}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{detailsAssembly.location}</span>
                </div>

                {detailsAssembly.attendance && (
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{`${detailsAssembly.attendance.present}/${detailsAssembly.attendance.total} presentes`}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(detailsAssembly.status)}`}>
                    {getStatusIcon(detailsAssembly.status)}
                    <span className="ml-1">{detailsAssembly.status}</span>
                  </span>
                </div>
              </div>

              {detailsAssembly.status === "Aplazada" && detailsAssembly.postponementReason && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-sm font-medium text-yellow-800">Motivo del aplazamiento:</p>
                  <p className="text-sm text-yellow-700">{detailsAssembly.postponementReason}</p>
                </div>
              )}

              {/* Botones de acción en detalles */}
              {canManage(detailsAssembly) && (
                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => { openStatusModal(detailsAssembly, "completed"); closeDetailsModal(); }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Cambiar estado
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => { deleteAssembly(detailsAssembly._id); }}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </button>
                    <button
                      onClick={closeDetailsModal}
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
    </>
  );
};

export default AssembliesPage;