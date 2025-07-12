    import { BrowserRouter, Routes, Route } from "react-router-dom";
    import LoginPage from "../pages/login";
    import DashboardPage from "../pages/Dashboard";

    export function AppRoutes() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
        </BrowserRouter>
    );
    }
    export default AppRoutes;