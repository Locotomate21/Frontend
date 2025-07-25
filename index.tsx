import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./src/pages/Login";
import './index.css';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Otras rutas aquí */}
      </Routes>
    </BrowserRouter>
  );
}

