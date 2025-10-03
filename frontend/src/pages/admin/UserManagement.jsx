import { useState, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../hooks/useAuth";
import {
  Edit,
  Save,
  Trash2,
  X,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mapeo de roles a colores de Tailwind para las etiquetas
const roleColorMap = {
  ADMIN: "bg-red-500/20 text-red-400 border border-red-500/30",
  TI: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  CLINICA: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  COMERCIAL: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  ADMINISTRACION: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
};

const roleOptions = ["CLINICA", "ADMINISTRACION", "COMERCIAL", "TI", "ADMIN"];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUsername, setEditedUsername] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const { userId: loggedInUserId } = useAuth();
  const navigate = useNavigate();

  // Estados para paginación y búsqueda
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = () => {
    api
      .get("/api/users/")
      .then((res) => setUsers(res.data))
      .catch((err) => alert(err));
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditedUsername(user.username);
    setSelectedRoles(user.profile ? user.profile.roles : []);
  };

  const handleCancelClick = () => setEditingUserId(null);

  const handleSaveClick = (userId) => {
    api
      .patch(`/api/users/${userId}/`, {
        username: editedUsername,
        profile: { roles: selectedRoles },
      })
      .then(() => {
        alert("¡Usuario actualizado exitosamente!");
        setEditingUserId(null);
        getUsers();
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.detail || JSON.stringify(err.response?.data);
        alert(`Error al actualizar: ${errorMessage}`);
      });
  };

  const handleDeleteClick = (userId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      api
        .delete(`/api/users/delete/${userId}/`)
        .then(() => {
          alert("¡Usuario eliminado exitosamente!");
          getUsers();
        })
        .catch((err) =>
          alert(`Error al eliminar: ${JSON.stringify(err.response.data)}`)
        );
    }
  };

  const toggleRole = (role) => {
    setSelectedRoles((prevRoles) =>
      prevRoles.includes(role)
        ? prevRoles.filter((r) => r !== role)
        : [...prevRoles, role]
    );
  };
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Home / Admin
            </p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Usuarios
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={18} />
              Añadir
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUserId === user.id ? (
                        <div className="flex flex-wrap gap-2">
                          {roleOptions.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRole(role)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                selectedRoles.includes(role)
                                  ? "bg-indigo-600 text-white shadow-md"
                                  : "bg-gray-200 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {user.profile?.roles.map((role) => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                roleColorMap[role] ||
                                "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingUserId === user.id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleSaveClick(user.id)}
                            className="text-green-500 hover:text-green-400"
                          >
                            <Save size={20} />
                          </button>
                          <button
                            onClick={handleCancelClick}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            disabled={user.id === loggedInUserId}
                            className="text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={user.id === loggedInUserId}
                            className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {page * rowsPerPage + 1}-
              {Math.min((page + 1) * rowsPerPage, filteredUsers.length)} de{" "}
              {filteredUsers.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setPage((p) =>
                    (p + 1) * rowsPerPage < filteredUsers.length ? p + 1 : p
                  )
                }
                disabled={(page + 1) * rowsPerPage >= filteredUsers.length}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
