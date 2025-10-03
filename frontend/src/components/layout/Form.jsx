import { useState } from "react";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { ACCES_TOKEN, REFRESH_TOKEN } from "../../constants";
import logo from "../../assets/grupo-cinasi-logo.webp";
const roleOptions = ["CLINICA", "ADMINISTRACION", "COMERCIAL", "TI", "ADMIN"];

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar Sesión" : "Crear Usuario";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSend = { username, password };

    if (method === "register") {
      if (roles.length === 0) {
        alert("Por favor, selecciona al menos un rol.");
        setLoading(false);
        return;
      }
      dataToSend.roles = roles;
    }

    try {
      const res = await api.post(route, dataToSend);

      if (method === "login") {
        localStorage.setItem(ACCES_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        alert("¡Usuario creado exitosamente!");
        navigate("/admin/gestion-usuarios");
      }
    } catch (error) {
      alert(`Error: ${JSON.stringify(error.response?.data || error.message)}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  if (method === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 pt-0 px-8 pb-5">
            <div className="text-center mb-6">
              <img
                src={logo}
                alt="Grupo Cinasi Logo"
                className="w-40 object-contain mx-auto pt-3"
              />
              <h1 className="text-2xl font-bold text-white mb-2 mt-4">
                Bienvenido
              </h1>
              <p className="text-gray-400">Inicia sesión para continuar</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese usuario"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            © 2025 Grupo Cinasi.
          </div>
        </div>
      </div>
    );
  }

  // Formulario de Registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{name}</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Roles <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      roles.includes(role)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Creando..." : name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
