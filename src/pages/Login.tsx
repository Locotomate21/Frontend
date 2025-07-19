import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:2000/api/auth/login', {
        username: email,
        password,
      });

      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Verifica tus datos.');
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

            <button
              type="button"
              className="w-full bg-white text-gray-700 border-2 border-gray-200 rounded-lg py-3 flex items-center justify-center gap-2 hover:border-blue-500 hover:shadow-md transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" className="inline">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75c-2.09 0-3.87-1.4-4.5-3.32H1.78v2.08A7.99 7.99 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.7a4.8 4.8 0 0 1 0-3.07V5.55H1.78a7.98 7.98 0 0 0 0 7.17l2.72-2.02z"/>
                <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.7A7.98 7.98 0 0 0 8.98 1a7.99 7.99 0 0 0-7.2 4.55l2.72 2.05c.63-1.93 2.4-3.32 4.5-3.02z"/>
              </svg>
              Iniciar con Google
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" className="text-blue-500 hover:underline">Haz clic aquí</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
