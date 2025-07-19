    import { Routes, Route, BrowserRouter } from "react-router-dom";
    import Login from "../pages/Login";
    import Home from "../pages/Home";
    import Noticias from "../components/Noticias";
    import Asambleas from "../components/Asambleas";
    import Medidas from "../components/Medidas";
    import Reparaciones from "../components/Reparaciones";
    import ProtectedRoute from "../components/ProtectedRoute";
    import DashboardLayout from "../components/DashboardLayout";

    const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="noticias" element={<Noticias />} />
            <Route path="asambleas" element={<Asambleas />} />
            <Route path="medidas" element={<Medidas />} />
            <Route path="reparaciones" element={<Reparaciones />} />
            </Route>
        </Route>
        </Routes>
    </BrowserRouter>
    );

    export default AppRoutes;

