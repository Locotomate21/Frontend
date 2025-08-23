import axios from "./axios";

export const AuthAPI = {
  register: (data: { fullName: string; email: string; password: string }) =>
    axios.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    axios.post("/auth/login", data),
};