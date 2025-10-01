import { useAuth } from "../hooks/useAuth";
// Supongamos que tienes componentes para cada dashboard
import ClinicaDashboard from "../components/ClinicaDashboard";
import TIDashboard from "../components/TIDashboard";

function Home() {
  const { role, username } = useAuth();

  return (
    <div>
      <h1>Bienvenido, {username}!</h1>
      <h2>Dashboard Principal</h2>

      {/* Renderizado condicional basado en el rol */}
      {role === "CLINICA" && <ClinicaDashboard />}
      {role === "TI" || ("ADMIN" && <TIDashboard />)}

      {/* Agrega más condiciones para otros roles */}
      {role !== "CLINICA" && role !== "TI" && (
        <p>No tienes un dashboard asignado.</p>
      )}
    </div>
  );
}

export default Home;
