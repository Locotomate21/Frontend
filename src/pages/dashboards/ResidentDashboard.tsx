import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  Bell,
  TrendingUp,
} from "lucide-react";
import jwtDecode from "jwt-decode";

interface DisciplinaryMeasure {
  _id: string;
  title: string;
  status: "Activa" | "Resuelta";
  createdAt: string;
}

interface Report {
  _id: string;
  reason: string;
  actionTaken?: string;
  date: string;
  urgent?: boolean;
}

interface News {
  _id: string;
  title: string;
  content: string;
  publishedAt: string;
  type: "general" | "floor";
  floor?: number;
}

interface Assembly {
  _id: string;
  title: string;
  date: string;   // ISO string
  time: string;
  floor?: number; // opcional
  isGeneral: boolean;
}

type TokenPayload = {
  sub: string;
  role: string;
  fullName?: string;
  floor?: number;
};

export default function ResidentDashboard() {
  const { auth } = useAuthStore();
  const [measures, setMeasures] = useState<DisciplinaryMeasure[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  let userFloor = 0;

  if (token) {
    try {
      const payload: TokenPayload = jwtDecode(token);
      userFloor = payload.floor || 0;
    } catch (error) {
      console.error("Error decodificando token:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Medidas disciplinarias
      const measuresRes = await fetch(
        "http://localhost:3000/disciplinary-measures/my/measures",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (measuresRes.ok) {
        setMeasures(await measuresRes.json());
      }

      // Reportes
      const reportsRes = await fetch("http://localhost:3000/report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportsRes.ok) {
        setReports(await reportsRes.json());
      }

      // Noticias
      const newsRes = await fetch("http://localhost:3000/news", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        const filteredNews = newsData.filter(
          (n: News) => n.type === "general" || n.floor === userFloor
        );
        setNews(filteredNews.slice(0, 10));
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
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

    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return "Hace 1 día";
    const days = Math.floor(diffInHours / 24);
    return `Hace ${days} días`;
  };

  // Estadísticas
  const activeMeasures = measures.filter((m) => m.status === "Activa").length;
  const pendingReports = reports.filter((r) => !r.actionTaken).length;
  const urgentReports = reports.filter((r) => r.urgent && !r.actionTaken).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {auth?.fullName?.charAt(0) || "R"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hola, {auth?.fullName || "Residente"} 
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Piso {userFloor} •{" "}
                {auth?.role === "resident" ? "Residente" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Última actualización</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Medidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            {activeMeasures > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {activeMeasures} activas
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Medidas Disciplinarias
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {activeMeasures > 0
              ? `Tienes ${activeMeasures} medida${activeMeasures > 1 ? "s" : ""} activa${activeMeasures > 1 ? "s" : ""}`
              : "No tienes medidas activas"}
          </p>
          <a
            href="/disciplinary"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver detalles →
          </a>
        </div>

        {/* Reportes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            {pendingReports > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {pendingReports} pendientes
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Mis Reportes
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {reports.length > 0
              ? `${reports.length} reporte${reports.length > 1 ? "s" : ""} creado${reports.length > 1 ? "s" : ""}`
              : "No has creado reportes"}
          </p>
          <a
            href="/reports"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver detalles →
          </a>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Resumen General
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total medidas:</span>
              <span className="font-medium">{measures.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total reportes:</span>
              <span className="font-medium">{reports.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Reportes urgentes:</span>
              <span className="font-medium text-red-600">{urgentReports}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Noticias + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Noticias - 2/3 */}
        <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Noticias Recientes
          </h2>
          {news.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm bg-white rounded-xl shadow-sm border border-gray-100">
              No hay noticias disponibles
            </div>
          ) : (
            news.map((item, index) => (
              <div
                key={item._id}
                className={`p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition ${
                  index === 0 ? "border-blue-400" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {item.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(item.publishedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {item.content}
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.type === "general"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.type === "general"
                      ? "General"
                      : `Piso ${item.floor}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(item.publishedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Próximas Asambleas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Próximas Asambleas</h2>
          {assemblies.length > 0 ? (
            <ul className="space-y-3">
              {assemblies.slice(0, 3).map((assembly) => (
                <li key={assembly._id} className="flex flex-col">
                  <span className="font-medium">{assembly.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(assembly.date).toLocaleDateString()} - {assembly.time}
                  </span>
                  <span className="text-xs text-gray-400">
                    {assembly.isGeneral ? "Asamblea General" : `Piso ${assembly.floor}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No hay asambleas próximas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
