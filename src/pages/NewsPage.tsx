import React, { useEffect, useState } from "react";
import api from "../services/axios";
import { Calendar, User, ChevronRight, X, Clock, Building } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface CreatedBy {
  _id: string;
  fullName: string;
  role: string;
}

interface News {
  _id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdBy: string | CreatedBy;
  type: "general" | "floor";
  floor?: number;
}

const NewsSection = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Crear/editar
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"general" | "floor">("general");
  const [floor, setFloor] = useState<number>(1); // Para noticias de piso

  const { auth } = useAuthStore((state) => state);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (error) {
      console.error("Error cargando noticias:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return "Hace 1 día";
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    return content.length <= maxLength
      ? content
      : content.substring(0, maxLength) + "...";
  };

  // 🔥 FUNCIÓN CORREGIDA CON DEBUG INTENSIVO
  const openModal = (newsItem: News) => {
    console.log("🔥🔥🔥 openModal EJECUTADA!");
    console.log("🔥 Parámetro recibido:", newsItem);
    console.log("🔥 newsItem es válido?:", !!newsItem);
    console.log("🔥 newsItem._id:", newsItem?._id);
    console.log("🔥 Estado ANTES de cambiar:", { isModalOpen, selectedNews });
    
    // Cambiamos el estado paso a paso
    console.log("🔥 Ejecutando setSelectedNews...");
    setSelectedNews(newsItem);
    
    console.log("🔥 Ejecutando setIsModalOpen(true)...");
    setIsModalOpen(true);
    
    console.log("🔥 Comandos enviados. Esperando re-render...");
    
    // Verificamos después de un timeout para ver si cambió
    setTimeout(() => {
      console.log("🔥 Estado después de 100ms:", { 
        isModalOpen,
        selectedNews: selectedNews?.title || "null"
      });
    }, 100);
  };

  const closeModal = () => {
    console.log("🔥 Cerrando modal");
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const getAuthorName = (createdBy: string | CreatedBy) => {
    return typeof createdBy === "string" ? createdBy : createdBy.fullName;
  };

  // Verificar si el usuario puede modificar la noticia
  const canModifyNews = (newsItem: News) => {
    if (auth?.role === "admin" || auth?.role === "president" || auth?.role === "secretary_general") {
      return true;
    }
    if (auth?.role === "representative") {
      const createdById = typeof newsItem.createdBy === "string" 
        ? newsItem.createdBy 
        : newsItem.createdBy._id;
      return auth?._id === createdById;
    }
    return false;
  };

  // Verificar si el usuario puede crear noticias
  const canCreateNews = () => {
    return ["admin", "president", "secretary_general", "representative"].includes(auth?.role ?? "");
  };

  // --------------------
  // Crear noticia
  // --------------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let dto: any = { title, content };

      if (auth?.role === "representative") {
        dto.type = "floor";
        dto.floor = floor;
      } else {
        dto.type = type;
        if (type === "floor") {
          dto.floor = floor;
        }
      }

      const res = await api.post("/news", dto, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      setNews((prev) => [res.data, ...prev]);
      resetForm();
    } catch (err) {
      console.error("Error creando noticia:", err);
      alert("Error al crear noticia");
    }
  };

  // --------------------
  // Editar noticia
  // --------------------
  const handleEdit = (newsItem: News) => {
    console.log("🔥 handleEdit llamada con:", newsItem);
    setEditingNews(newsItem);
    setTitle(newsItem.title);
    setContent(newsItem.content);
    setType(newsItem.type);
    setFloor(newsItem.floor || 1);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingNews) return;
      
      let dto: any = { title, content };
      
      if (auth?.role === "representative") {
        dto.type = "floor";
        dto.floor = floor;
      } else {
        dto.type = type;
        if (type === "floor") {
          dto.floor = floor;
        }
      }

      const res = await api.patch(`/news/${editingNews._id}`, dto, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });

      setNews((prev) =>
        prev.map((n) => (n._id === res.data._id ? res.data : n))
      );
      resetEditForm();
    } catch (err) {
      console.error("Error editando noticia:", err);
      alert("Error al editar noticia");
    }
  };

  // --------------------
  // Eliminar noticia
  // --------------------
  const handleDelete = async (id: string) => {
    console.log("🔥 handleDelete llamada con ID:", id);
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.")) return;
    
    try {
      await api.delete(`/news/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      
      // Actualizar la lista de noticias
      setNews((prev) => prev.filter((n) => n._id !== id));
      
      // Cerrar el modal si está abierto
      if (isModalOpen) {
        closeModal();
      }
      
      // Mostrar mensaje de éxito
      alert("Noticia eliminada correctamente");
      
    } catch (err: any) {
      console.error("Error eliminando noticia:", err);
      
      // Mostrar error específico si está disponible
      const errorMessage = err.response?.data?.message || "Error al eliminar la noticia. Intenta de nuevo.";
      alert(errorMessage);
    }
  };

  // Helper functions
  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("general");
    setFloor(1);
    setIsCreateOpen(false);
  };

  const resetEditForm = () => {
    setIsEditOpen(false);
    setEditingNews(null);
    setTitle("");
    setContent("");
    setType("general");
    setFloor(1);
  };

  // 🔥 DEBUG DEL ESTADO ACTUAL
  console.log("🔥 Render - Estado modal:", { isModalOpen, selectedNews: selectedNews?.title || null });

  return (
    <div className="flex flex-col h-full">
      {/* Header Fijo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Noticias y Avisos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Mantente al día con las últimas actualizaciones
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {canCreateNews() && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Crear noticia</span>
                </button>
              )}
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{news.length} noticias</span>
              </div>
            </div>
          </div>
      </div>

        {/* Lista de noticias */}
        <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
          {news.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay noticias disponibles
              </h3>
              <p className="text-gray-500">
                Las nuevas noticias aparecerán aquí cuando estén disponibles.
              </p>
            </div>
          ) : (
            [...news]
              .sort(
                (a, b) =>
                  new Date(b.publishedAt).getTime() -
                  new Date(a.publishedAt).getTime()
              )
              .map((item, index) => (
                <div
                  key={item._id}
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          {item.type === "general" ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Calendar className="w-3 h-3 mr-1" />
                              General
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Building className="w-3 h-3 mr-1" />
                              Piso {item.floor}
                            </span>
                          )}

                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(item.publishedAt)}
                          </span>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(item.publishedAt)}
                          </div>
                        </div>

                        <h3
                          className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("🔥🔥🔥 CLICK EN TÍTULO DETECTADO!");
                            console.log("🔥 Item completo:", item);
                            console.log("🔥 Item._id:", item._id);
                            console.log("🔥 Item.title:", item.title);
                            console.log("🔥 Llamando openModal...");
                            openModal(item);
                          }}
                        >
                          {item.title}
                        </h3>

                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {truncateContent(item.content)}
                        </p>

                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          <span>Por {getAuthorName(item.createdBy)}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0"> {/* Header Fijo (SCROLL) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("🔥🔥🔥 CLICK EN 'VER MÁS' DETECTADO!");
                            console.log("🔥 Item completo:", item);
                            console.log("🔥 Llamando openModal...");
                            openModal(item);
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                        >
                          Ver más
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>

                    {/* Indicador para la noticia más reciente */}
                    {index === 0 && (
                      <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* 🔥 Modal detalle - CORREGIDO */}
      {isModalOpen && selectedNews && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>
            <div className="relative bg-white rounded-xl shadow-xl sm:w-full sm:max-w-2xl">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b rounded-t-xl flex justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedNews.type === "general" 
                      ? "bg-blue-100" 
                      : "bg-green-100"
                  }`}>
                    {selectedNews.type === "general" ? (
                      <Calendar className={`w-5 h-5 ${
                        selectedNews.type === "general" ? "text-blue-600" : "text-green-600"
                      }`} />
                    ) : (
                      <Building className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedNews.type === "general"
                        ? "Noticia General"
                        : `Noticia Piso ${selectedNews.floor}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedNews.publishedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedNews.title}
                </h2>
                <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>Por {getAuthorName(selectedNews.createdBy)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{getTimeAgo(selectedNews.publishedAt)}</span>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedNews.content}
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-between items-center">
                <div className="flex space-x-2">
                  {canModifyNews(selectedNews) && (
                    <>
                      <button
                        onClick={() => {
                          console.log("🔥 Click en editar desde modal");
                          closeModal();
                          handleEdit(selectedNews);
                        }}
                        className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          console.log("🔥 Click en eliminar desde modal");
                          handleDelete(selectedNews._id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Noticia */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Crear noticia</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Título de la noticia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              <textarea
                placeholder="Contenido de la noticia"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />

              {auth?.role !== "representative" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de noticia
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "general" | "floor")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="floor">Piso específico</option>
                  </select>
                </div>
              )}

              {(type === "floor" || auth?.role === "representative") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Número de piso
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear noticia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditOpen && editingNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Editar noticia</h2>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
              />
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contenido"
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                required
              />
              
              {auth?.role !== "representative" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de noticia
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "general" | "floor")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="floor">Piso específico</option>
                  </select>
                </div>
              )}

              {(type === "floor" || auth?.role === "representative") && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Número de piso
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={floor}
                    onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;