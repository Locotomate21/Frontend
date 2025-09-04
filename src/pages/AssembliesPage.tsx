import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Clock, X } from "lucide-react";
import api from "@/axios";

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
}

const AssembliesSection = () => {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [selectedAssembly, setSelectedAssembly] = useState<Assembly | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAssemblies = async () => {
      try {
        const res = await api.get("/assemblies"); // Endpoint backend
        console.log("📡 Asambleas desde backend:", res.data);
        setAssemblies(res.data);
      } catch (err) {
        console.error("Error cargando asambleas:", err);
      }
    };
    fetchAssemblies();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const openModal = (assembly: Assembly) => {
    setSelectedAssembly(assembly);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAssembly(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Asambleas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Consulta las próximas y pasadas asambleas
              </p>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{assemblies.length} asambleas</span>
            </div>
          </div>
        </div>

        {/* Lista de asambleas */}
        <div className="divide-y divide-gray-100">
          {assemblies.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay asambleas disponibles
              </h3>
              <p className="text-gray-500">
                Las próximas asambleas aparecerán aquí cuando estén programadas.
              </p>
            </div>
          ) : (
            assemblies.map((assembly, index) => (
              <div
                key={assembly._id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="p-6 relative">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer group-hover:text-blue-600 transition-colors duration-200"
                        onClick={() => openModal(assembly)}
                      >
                        {assembly.title}
                      </h3>

                      <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-2">
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
                            {`${assembly.attendance.present}/${assembly.attendance.total} presentes (${Math.round((assembly.attendance.present/assembly.attendance.total)*100)}%)`}
                          </div>
                        )}
                      </div>

                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          assembly.status === "Programada"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {assembly.status}
                      </span>
                    </div>
                  </div>

                  {/* Indicador de novedad */}
                  {index === 0 && assembly.status === "Programada" && (
                    <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedAssembly && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            <div className="relative inline-block align-bottom bg-white rounded-xl shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Detalles de la Asamblea</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 py-6 space-y-3">
                <h2 className="text-xl font-bold text-gray-900">{selectedAssembly.title}</h2>
                <div className="flex flex-col space-y-1 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(selectedAssembly.date)} - {selectedAssembly.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedAssembly.location}
                  </div>
                  {selectedAssembly.attendance && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {`${selectedAssembly.attendance.present}/${selectedAssembly.attendance.total} presentes (${Math.round((selectedAssembly.attendance.present/selectedAssembly.attendance.total)*100)}%)`}
                    </div>
                  )}
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedAssembly.status === "Programada"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedAssembly.status}
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
};

export default AssembliesSection;
