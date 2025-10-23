// frontend/src/pages/modules/TIDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { KeySquare, Settings } from "lucide-react"; // Importa KeySquare y Settings (o el icono que quieras)

function TIDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Panel de TI
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Existente */}
          <Link
            to="/unebi/gestion-claves"
            className="group block p-6 ..." // Estilos existentes
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-lg bg-teal-600">
                <KeySquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold ...">
                Asignación de clave UNEBI
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Gestiona las claves UNEBI.
            </p>
          </Link>

          {/* Nueva Tarjeta */}
          <Link
            to="/ti/nuevo-modulo" // La nueva ruta
            className="group block p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md hover:shadow-lg dark:shadow-black/30 hover:-translate-y-1 transition-transform border border-gray-200 dark:border-gray-700/50 hover:border-teal-500 hover:dark:border-teal-400"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-lg bg-teal-600">
                <Settings className="w-6 h-6 text-white" /> {/* Nuevo Icono */}
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                Nuevo Módulo TI
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Descripción de la funcionalidad de este nuevo módulo.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TIDashboard;
