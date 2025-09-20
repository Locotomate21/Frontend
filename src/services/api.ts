import axios from "../services/axios";

export const AuthAPI = {
  register: (data: { fullName: string; email: string; password: string }) =>
    axios.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    axios.post("/auth/login", data),
};

// ✅ Nueva sección para Reports
export const ReportsAPI = {
  getAll: () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.get("/reports", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getByResident: (residentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.get(`/reports/resident/${residentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getById: (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.get(`/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  create: (data: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.post("/reports", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  update: (id: string, data: any) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.patch(`/reports/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  delete: (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    return axios.delete(`/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
