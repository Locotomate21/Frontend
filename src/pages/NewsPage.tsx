import React, { useEffect, useState } from "react";
import api from "@/axios";
import { Calendar, User, ChevronRight, X, Clock } from "lucide-react";

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
  createdBy: string | CreatedBy; // puede venir como id o como objeto
}

const NewsSection = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get("/news");
        console.log("📡 Noticias desde backend:", res.data);
        setNews(res.data);
      } catch (error) {
        console.error("Error cargando noticias:", error);
      }
    };
    fetchNews();
  }, []);

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

    if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else if (diffInHours < 48) {
      return "Hace 1 día";
    } else {
      const days = Math.floor(diffInHours / 24);
      return `Hace ${days} días`;
    }
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const openModal = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  // 🧩 Función auxiliar para mostrar el nombre del autor
  const getAuthorName = (createdBy: string | CreatedBy) => {
    return typeof createdBy === "string" ? createdBy : createdBy.fullName;
  };

  return (
    <>
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
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{news.length} noticias</span>
            </div>
          </div>
        </div>

        {/* Lista de noticias */}
        <div className="divide-y divide-gray-100">
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
            news.map((item, index) => (
              <div
                key={item._id}
                className="group hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Fecha */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(item.publishedAt)}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>

                      {/* Título */}
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                        onClick={() => openModal(item)}
                      >
                        {item.title}
                      </h3>

                      {/* Contenido truncado */}
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {truncateContent(item.content)}
                      </p>

                      {/* Autor */}
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        <span>Por {getAuthorName(item.createdBy)}</span>
                      </div>
                    </div>

                    {/* Botón ver más */}
                    <div className="flex-shrink-0 ml-4">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        Ver más
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Indicador de novedad */}
                  {index === 0 && (
                    <div className="absolute left-0 top-6 w-1 h-16 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r-full"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedNews && (
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
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Noticia Completa
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(selectedNews.publishedAt)}
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

                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.content}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
                <div className="flex justify-end">
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
      )}
    </>
  );
};

export default NewsSection;
