import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCES_TOKEN, REFRESH_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children, allowedRoles }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCES_TOKEN, res.data.access);
        // Después de refrescar, decodificamos el NUEVO token para verificar el rol.
        const decoded = jwtDecode(res.data.access);
        const userRoles = decoded.roles || []; //Esto es para los múltiples roles
        /// Comprueba si el usuario tiene al menos UNO de los roles permitidos.
        // Si no se especifican 'allowedRoles', se permite el acceso.
        const hasPermission = allowedRoles
          ? allowedRoles.some((allowed) => userRoles.includes(allowed))
          : true;
        setIsAuthorized(hasPermission);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log("Error al refrescar el token:", error);
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCES_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (tokenExpiration < now) {
      await refreshToken();
    } else {
      // Si el token es válido, verificamos el rol.
      const userRoles = decoded.roles || [];
      const hasPermission = allowedRoles
        ? allowedRoles.some((allowed) => userRoles.includes(allowed))
        : true;

      setIsAuthorized(hasPermission);
    }
  };

  // Muestra un estado de carga mientras se verifica la autorización.
  if (isAuthorized === null) {
    return <div>Cargando...</div>;
  }
  // Si está autorizado, muestra el componente hijo; si no, redirige a login.
  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
