import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, X } from "lucide-react";
import api from "../services/axios";
import { useAuthStore } from "../store/authStore";

interface Assembly {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendance?: {
    present: number;
    total: number;
  };
  status: "Programada" | "Completada";
  type: "general" | "floor";
  floor?: number;
  createdBy?: string;
}

const AssembliesPage = () => {
  const { role, floor } = useAuthStore((state) => state.auth);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Assembly>>({
    title: "",
    date: "",
    time: "",
    location: "",
    status: "Programada",
    type: role === "representative" ? "floor" : "general",
  });
  const [isEditing, setIsEditing] = useState(false);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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

  const handleSave = async () => {
    try {
      if (isEditing && selectedAssembly) {
        // Editar
        const res = await api.put(`/assemblies/${selectedAssembly._id}`, formData);
        setAssemblies(
          assemblies.map((a) => (a._id === selectedAssembly._id ? res.data : a))
        );
      } else {
        // Crear
        const payload = {
          ...formData,
          ...(role === "representative" ? { floor } : {}),
        };
        const res = await api.post("/assemblies", payload);
        setAssemblies([...assemblies, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Error guardando asamblea:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta asamblea?")) return;
    try {
      await api.delete(`/assemblies/${id}`);
      setAssemblies(assemblies.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Error eliminando asamblea:", err);
    }
  };

  const canManage = (assembly: Assembly) => {
    if (role === "admin" || role === "president" || role === "secretary_general") {
      return true;
    }
    if (role === "representative" && assembly.type === "floor" && assembly.floor === floor) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Asambleas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Consulta, crea o administra asambleas
            </p>
          </div>
          {(role === "admin" || role === "president" || role === "secretary_general" || role === "representative") && (
            <button
              onClick={() => openModal()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nueva Asamblea
            </button>
          )}
        </div>

        {/* Lista de asambleas */}
        <div className="divide-y divide-gray-100">
          {assemblies.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No hay asambleas registradas.
            </div>
          ) : (
            assemblies.map((assembly) => (
              <div key={assembly._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assembly.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
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
                  </div>
                  {canManage(assembly) && (
                    <div className="flex gap-2 mt-3 md:mt-0">
                      <button
                        onClick={() => openModal(assembly)}
                        className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(assembly._id)}
                        className="px-3 py-1 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? "Editar Asamblea" : "Nueva Asamblea"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <input
                type="date"
                value={formData.date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <input
                type="time"
                value={formData.time || ""}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                placeholder="Ubicación"
                value={formData.location || ""}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full border rounded-lg p-2"
              />
              {(role === "admin" ||
                role === "president" ||
                role === "secretary_general") && (
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as "floor" | "general" })
                  }
                  className="w-full border rounded-lg p-2"
                >
                  <option value="general">General</option>
                  <option value="floor">De Piso</option>
                </select>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssembliesPage;
