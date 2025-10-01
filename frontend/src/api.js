import axios from "axios";
import { ACCES_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

//Función que se ejecuta antes de que la petición llegue al servidor (request) o antes de que la respuesta llegue al código (response).
//api.interceptors.request.use(success, error)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCES_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
