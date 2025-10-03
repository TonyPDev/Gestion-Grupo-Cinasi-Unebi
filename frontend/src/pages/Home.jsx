import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
    route: "/admin/gestion-usuarios",
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
  const { role, username } = useAuth();
  const navigate = useNavigate();

  const availableModules = Object.entries(roleModules)
    .filter(([roleName]) => role?.includes(roleName))
    .map(([_, module]) => module);

  const handleModuleClick = (route) => {
    navigate(route);
  };

  const handleActionClick = (action) => {
    console.log(`Acción: ${action}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Pills of Zen</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Hola, {username}</span>
              <button
                onClick={() => navigate("/logout")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de vuelta!
          </h2>
          <p className="text-gray-600">
            Aquí está un resumen de tu actividad hoy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Tus Módulos</h3>
          <p className="text-gray-600">Accede a las áreas según tus permisos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableModules.map((module, index) => (
            <ModuleCard
              key={index}
              module={module}
              onClick={handleModuleClick}
            />
          ))}
        </div>

        <QuickActions onActionClick={handleActionClick} />
      </main>
    </div>
  );
}

export default Home;
