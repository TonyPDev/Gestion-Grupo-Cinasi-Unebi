import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center px-4 transition-colors duration-300">
      <div className="max-w-md">
        <div className="flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
          <AlertTriangle size={48} className="mr-4 drop-shadow-lg" />
          <h1 className="text-8xl font-bold tracking-tighter drop-shadow-lg">
            404
          </h1>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
          Página No Encontrada
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-all"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
