    import axios from "axios";
    import { useAuthStore } from "../store/authStore";

    const API_URL = "http://localhost:3000/news"; // ajusta a tu backend

    // Obtener token desde store
    const getAuthHeaders = () => {
    const token = useAuthStore.getState().auth?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
    };

    export const getNews = async () => {
    const res = await axios.get(API_URL, {
        headers: getAuthHeaders(),
    });
    return res.data;
    };

    export const createNews = async (data: { title: string; content: string }) => {
    const res = await axios.post(API_URL, data, {
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return res.data;
    };

    export const deleteNews = async (id: string) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
    });
    return res.data;
    };