import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react'; // O un ícono más apropiado

function AdministracionDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Panel de Administración
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Otros módulos de administración si los hubiera... */}

          {/* Tarjeta para Requisiciones */}
          <Link
            to="/administracion/requisiciones" // Ruta que definiremos en App.jsx
            className="group block p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-lg dark:shadow-black/30 hover:-translate-y-1 transition-transform border border-gray-200 dark:border-gray-700/50 hover:border-blue-500 hover:dark:border-blue-400"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-lg bg-orange-600"> {/* Color del módulo Administración */}
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                Gestión de Requisiciones
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Crear, ver y gestionar requisiciones de material, equipo o servicio.
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default AdministracionDashboard;