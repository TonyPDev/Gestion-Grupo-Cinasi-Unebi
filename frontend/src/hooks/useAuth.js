import { jwtDecode } from "jwt-decode";
import { ACCES_TOKEN } from "../constants";

export const useAuth = () => {
  const token = localStorage.getItem(ACCES_TOKEN);

  if (!token) {
    return { isAuth: false, role: null, username: null, fullName: null };
  }

  try {
    const decoded = jwtDecode(token);
    return {
      isAuth: true,
      role: decoded.roles,
      username: decoded.username,
      userId: decoded.user_id,
      fullName: decoded.full_name,
    };
  } catch (e) {
    console.error("Token inválido:", e);
    return {
      isAuth: false,
      roles: [],
      username: null,
      userId: null,
      fullName: null,
    };
  }
};
