import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/grupo-cinasi-logo.webp";
import { useTheme } from "../../context/ThemeContext"; // Importa el hook useTheme
import { Sun, Moon } from "lucide-react";

function Navbar() {
  const { username } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme(); // Usa el hook para obtener el tema y la función para cambiarlo

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm border-b border-gray-200/80 dark:border-gray-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <img src={logo} alt="Grupo Cinasi Logo" className="h-9 w-auto" />
            <span className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
              Sistema de Gestión
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Hola, {username}
            </span>
            {/* Botón para cambiar el tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none"
            >
              {theme === "light" ? (
                <Moon size={20} className="text-gray-700" />
              ) : (
                <Sun size={20} className="text-yellow-400" />
              )}
            </button>
            <button
              onClick={() => navigate("/logout")}
              className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-red-700 transition-all"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
