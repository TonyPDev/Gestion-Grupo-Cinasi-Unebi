import { useAuth } from "../hooks/useAuth";
// Supongamos que tienes componentes para cada dashboard
import ClinicaDashboard from "../components/ClinicaDashboard";
import TIDashboard from "../components/TIDashboard";
import AdministracionDashboard from "../components/AdministracionDashboard";
import ComercialDashboard from "../components/ComercialDashboard";

function Home() {
  const { role, username } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {username}!</h1>
      <h2>Dashboard Principal</h2>

      {/* Renderizado condicional basado en el rol */}
      {(role === "CLINICA" || role == "ADMIN") && <ClinicaDashboard />}
      {(role === "TI" || role === "ADMIN") && <TIDashboard />}
      {(role === "COMERCIAL" || role === "ADMIN") && <ComercialDashboard />}
      {(role === "ADMINISTRACION" || role === "ADMIN") && (
        <AdministracionDashboard />
      )}

      {/* Agrega más condiciones para otros roles */}
    </div>
  );
}

export default Home;
