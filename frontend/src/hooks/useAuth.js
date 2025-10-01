import { jwtDecode } from "jwt-decode";
import { ACCES_TOKEN } from "../constants";

export const useAuth = () => {
  const token = localStorage.getItem(ACCES_TOKEN);

  if (!token) {
    return { isAuth: false, role: null, username: null };
  }

  try {
    const decoded = jwtDecode(token);
    return { isAuth: true, role: decoded.role, username: decoded.username };
  } catch (e) {
    console.error("Token inválido:", e);
    return { isAuth: false, role: null, username: null };
  }
};
