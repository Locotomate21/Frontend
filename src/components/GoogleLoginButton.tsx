import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface GoogleJwtPayload {
    name: string;
    email: string;
    picture: string;
}

const GoogleLoginButton = () => {
    const handleLogin = async (response: CredentialResponse) => {
        try {
            const { credential } = response;
            if (!credential) {
                throw new Error("No credential returned from Google");
            }
            const decoded = jwtDecode<GoogleJwtPayload>(credential);
            console.log('Google user:', decoded);

            // Enviar token al backend para validar y obtener JWT propio
            const res = await axios.post('http://localhost:2000/api/auth', {
                token: credential,
            });

            const ourToken = res.data.token;
            localStorage.setItem('token', ourToken); // guardar JWT propio
            alert('Login exitoso');

        // Redirigir si quieres
        // window.location.href = "/dashboard";
        } catch (err) {
        console.error('Login error', err);
        }
    };

return (
    <GoogleLogin onSuccess={handleLogin} onError={() => console.log('Login Failed')} />
);
};

export default GoogleLoginButton;
