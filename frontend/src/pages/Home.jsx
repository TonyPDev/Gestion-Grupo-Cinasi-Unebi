import { useAuth } from "../hooks/useAuth";
// Supongamos que tienes componentes para cada dashboard
import ClinicaDashboard from "../components/ClinicaDashboard";
import TIDashboard from "../components/TIDashboard";
import AdministracionDashboard from "../components/AdministracionDashboard";
import ComercialDashboard from "../components/ComercialDashboard";

function Home() {
  const { role, username } = useAuth();
  const hasRole = (roleName) => Array.isArray(role) && role.includes(roleName);
  return (
    <div>
      <h1>Bienvenido, {username}!</h1>
      <h2>Dashboard Principal</h2>

      {/* Renderizado condicional basado en el rol */}
      {(hasRole("CLINICA") || hasRole("ADMIN")) && <ClinicaDashboard />}
      {(hasRole("TI") || hasRole("ADMIN")) && <TIDashboard />}
      {(hasRole("COMERCIAL") || hasRole("ADMIN")) && <ComercialDashboard />}
      {(hasRole("ADMINISTRACION") || hasRole("ADMIN")) && (
        <AdministracionDashboard />
      )}

      {/* Agrega más condiciones para otros roles */}
    </div>
  );
}

export default Home;
