import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import NewsPage from './pages/NewsPage';
import AssembliesPage from './pages/AssembliesPage';
import DisciplinaryPage from './pages/DisciplinaryPage';
import MaintenancePage from './pages/MaintenancePage';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './routes/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import DashboardRouter from './routes/DashboardRouter';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardRouter />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="assemblies" element={<AssembliesPage />} />
          <Route path="disciplinary" element={<DisciplinaryPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="profile" element={<ProfilePage />} />

        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

