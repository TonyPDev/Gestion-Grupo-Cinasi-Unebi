import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Database,
  ShoppingCart,
  FileText,
} from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import ModuleCard from "../components/dashboard/ModuleCard";
import QuickActions from "../components/dashboard/QuickActions";
import logo from "../assets/grupo-cinasi-logo.webp";
const roleModules = {
  CLINICA: {
    title: "Clínica",
    description: "Gestión de pacientes y citas médicas",
    icon: Activity,
    color: "from-blue-500 to-blue-600",
    route: "/clinica",
  },
  COMERCIAL: {
    title: "Comercial",
    description: "Ventas, clientes y reportes",
    icon: ShoppingCart,
    color: "from-purple-500 to-purple-600",
    route: "/comercial",
  },
  ADMINISTRACION: {
    title: "Administración",
    description: "Finanzas y recursos humanos",
    icon: FileText,
    color: "from-orange-500 to-orange-600",
    route: "/administracion",
  },
  TI: {
    title: "Tecnología",
    description: "Sistemas e infraestructura",
    icon: Database,
    color: "from-teal-500 to-teal-600",
    route: "/ti",
  },
  ADMIN: {
    title: "Administrador",
    description: "Configuración y usuarios",
    icon: Settings,
    color: "from-red-500 to-red-600",
    route: "/admin/dashboard",
  },
};

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1% from last month",
    positive: true,
    icon: DollarSign,
    color: "bg-blue-500",
  },
  {
    title: "Subscriptions",
    value: "2350",
    change: "+180.1% from last month",
    positive: true,
    icon: Users,
    color: "bg-purple-500",
  },
  {
    title: "Sales",
    value: "12,234",
    change: "-19% from last month",
    positive: false,
    icon: TrendingUp,
    color: "bg-orange-500",
  },
  {
    title: "Active Now",
    value: "573",
    change: "+20% from last month",
    positive: true,
    icon: Activity,
    color: "bg-green-500",
  },
];

function Home() {
  const { username } = useAuth();
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();

  // useEffect se ejecutará cada vez que el componente se monte (ej. al recargar la página).
  useEffect(() => {
    api
      .get("/api/users/me/")
      .then((res) => {
        // Guardamos los roles frescos del servidor en nuestro estado local.
        const roles = res.data.profile?.roles || [];
        setUserRoles(roles);
      })
      .catch((err) => {
        console.error("Error al obtener datos del usuario:", err);
        // Si hay un error (ej. token inválido), podríamos redirigir al login.
        // navigate("/logout");
      });
  }, []);

  const isAdmin = userRoles.includes("ADMIN");

  const availableModules = isAdmin
    ? Object.values(roleModules)
    : Object.entries(roleModules)
        .filter(([roleName]) => userRoles.includes(roleName))
        .map(([_, module]) => module);

  const handleModuleClick = (route) => {
    navigate(route);
  };

  const handleActionClick = (action) => {
    console.log(`Acción: ${action}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Panel Principal
        </h2>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tus Módulos
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Accede a las áreas según tus permisos
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {availableModules.map((module, index) => (
          <ModuleCard key={index} module={module} onClick={handleModuleClick} />
        ))}
      </div>
    </main>
  );
}

export default Home;
