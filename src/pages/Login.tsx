import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Usamos la instancia api que ya tiene baseURL y withCredentials
      const response = await api.post('/auth/login', { email, password });

      console.log("Respuesta del backend:", response.data);

      // 👇 Ajusta estos nombres cuando veamos qué trae exactamente
      const { token, role, fullName, user, access_token } = response.data;

      // Por ahora validamos con cualquiera de los formatos comunes
      if (!token && !access_token) {
        throw new Error('Respuesta del servidor no válida');
      }

      // Usamos token en cualquiera de las dos variantes
      const finalToken = token || access_token;

      // Guardamos la info en el store
      setAuth({
        _id: user?._id || null,
        token: finalToken,
        email: user?.email || email,
        role: role || user?.role || null,
        fullName: fullName || user?.fullName || null,
        floor: user?.floor ?? null,
      });

      localStorage.setItem('token', finalToken);

      console.log('Auth seteado:', {
        token: finalToken,
        email: user?.email || email,
        role: role || user?.role,
        fullName: fullName || user?.fullName,
        floor: user?.floor,
      });

      // Redirigimos al dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error en login:', err);

      if (err.response?.status === 401 || err.response?.status === 404) {
        setError(err.response.data?.error || 'Credenciales inválidas.');
      } else {
        setError('Error del servidor. Intenta más tarde.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 font-sans">
      <div className="flex flex-col md:flex-row w-[90%] max-w-[1200px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Lado izquierdo */}
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-700 text-white flex flex-col items-center justify-center px-10 py-16 relative">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
            <span className="text-blue-500 text-5xl font-bold font-serif">G</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-center leading-tight mb-4">
            Residencias Universitarias<br />Gabriel Soto Bayona
          </h1>
          <p className="text-center text-white/90 mb-8">
            "Residente una vez, residente para toda la vida."
          </p>
          <div className="absolute bottom-5 text-xs text-white/70">
            © 2025 Gabriel Soto Bayona. Todos los derechos reservados.
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex-1 px-8 md:px-12 py-14 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido residente!</h2>
          <p className="text-sm text-gray-600 mb-8">
            ¿No tienes una cuenta?{' '}
            <a href="#" className="text-blue-500 hover:underline">Regístrate aquí</a>
          </p>

          <form className="space-y-5" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Correo institucional"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-red-500 text-center text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
