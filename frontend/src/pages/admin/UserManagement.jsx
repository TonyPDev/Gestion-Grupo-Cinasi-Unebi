// frontend/src/pages/admin/UserManagement.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
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
  UserCheck,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mapa de colores para los roles (sin cambios)
const roleColorMap = {
  ADMIN:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700/50",
  TI: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50",
  CLINICA:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-200 dark:border-sky-700/50",
  COMERCIAL:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700/50",
  ADMINISTRACION:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50",
  COMPRAS:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50",
  default:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
};

const roleOptions = [
  "CLINICA",
  "ADMINISTRACION",
  "COMERCIAL",
  "TI",
  "ADMIN",
  "COMPRAS",
];

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  // Estados para edición
  const [editedUsername, setEditedUsername] = useState("");
  const [editedFullName, setEditedFullName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(null);

  const { userId: loggedInUserId } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Paginación y búsqueda
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Opciones para el selector de Manager
  const managerOptions = useMemo(() => {
    return users
      .filter((u) => u.id !== editingUserId)
      .map((u) => ({
        id: u.id,
        name: u.profile?.full_name
          ? `${u.profile.full_name} (@${u.username})`
          : `@${u.username}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, editingUserId]);

  // Función para obtener usuarios
  const getUsers = useCallback(() => {
    setIsLoading(true);
    api
      .get("/api/users/")
      .then((res) => {
        setUsers(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        alert("Error al cargar usuarios.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Iniciar edición
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditedUsername(user.username);
    setSelectedRoles(user.profile?.roles || []);
    setEditedFullName(user.profile?.full_name || "");
    setSelectedManagerId(user.profile?.manager ?? null);
  };

  // Cancelar edición
  const handleCancelClick = () => setEditingUserId(null);

  // Guardar cambios
  const handleSaveClick = (userId) => {
    setIsSaving(true);
    api
      .patch(`/api/users/${userId}/`, {
        // **RESTAURADO:** Edición de username
        username: editedUsername,
        profile: {
          roles: selectedRoles,
          full_name: editedFullName,
          manager: selectedManagerId ? parseInt(selectedManagerId, 10) : null,
        },
      })
      .then((res) => {
        console.log("Respuesta del servidor al guardar:", res.data); // <-- VERIFICAR ESTA RESPUESTA EN CONSOLA
        alert("¡Usuario actualizado exitosamente!");
        setEditingUserId(null);
        // **INTENTO 1: Actualizar estado local**
        // Si esto no funciona visualmente para el manager,
        // comenta la línea de setUsers y descomenta getUsers().
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? res.data : u))
        );
        // **INTENTO 2: Refrescar toda la lista (más seguro si la respuesta no es completa)**
        // getUsers();
      })
      .catch((err) => {
        // ... (Manejo de errores detallado) ...
        const errorData = err.response?.data;
        let errorMessage = "Ocurrió un error al actualizar.";
        if (errorData && typeof errorData === "object") {
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => {
              if (
                key === "profile" &&
                typeof value === "object" &&
                value !== null
              ) {
                return Object.entries(value)
                  .map(
                    ([pKey, pValue]) =>
                      `Perfil (${pKey}): ${
                        Array.isArray(pValue) ? pValue.join(", ") : pValue
                      }`
                  )
                  .join("; ");
              }
              // Mostrar error de username si existe
              if (key === "username") {
                return `Usuario: ${
                  Array.isArray(value) ? value.join(", ") : value
                }`;
              }
              return `${key}: ${
                Array.isArray(value) ? value.join(", ") : value
              }`;
            })
            .join("\n");
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
        console.error("Error al actualizar:", err.response);
        alert(`Error al actualizar:\n${errorMessage}`);
      })
      .finally(() => setIsSaving(false));
  };

  // Eliminar usuario
  const handleDeleteClick = (userId, username) => {
    if (userId === loggedInUserId) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (window.confirm(`¿Seguro que quieres eliminar a @${username}?`)) {
      api
        .delete(`/api/users/delete/${userId}/`)
        .then(() => {
          alert(`Usuario @${username} eliminado.`);
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
          // Lógica para ajustar página si es necesario
          const newTotalUsers = filteredUsers.length - 1;
          const newPageCount = Math.ceil(newTotalUsers / rowsPerPage);
          if (page >= newPageCount && page > 0) setPage(page - 1);
          else if (paginatedUsers.length === 1 && page > 0) setPage(page - 1);
        })
        .catch((err) => {
          const errorMsg =
            err.response?.data?.detail ||
            JSON.stringify(err.response?.data) ||
            err.message;
          alert(`Error al eliminar: ${errorMsg}`);
        });
    }
  };

  // Cambiar roles seleccionados
  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  // Cambiar filas por página
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrado y Paginación (Memoizados)
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.username?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (user.profile?.full_name?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      ),
    [users, searchTerm]
  );

  const paginatedUsers = useMemo(
    () =>
      filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const pageCount = Math.ceil(filteredUsers.length / rowsPerPage);

  // --- RENDERIZADO ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado y Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Usuarios
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm" // dark:border-gray-600
              />
            </div>
            {/* Add User Button */}
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-sm shadow hover:shadow-md"
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && users.length === 0 && (
          <div className="text-center py-10">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Cargando...
            </p>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              {/* Table Head */}
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3 font-semibold w-1/4">Usuario / Nombre</th>
                  <th className="p-3 font-semibold w-1/4">Jefe Directo</th>
                  <th className="p-3 font-semibold">Roles</th>
                  <th className="p-3 font-semibold text-center w-24">
                    Acciones
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600 text-gray-700 dark:text-gray-300">
                {/* No Users Message */}
                {!isLoading && paginatedUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="p-6 text-center text-gray-500 dark:text-gray-400 italic"
                    >
                      {searchTerm
                        ? "No se encontraron coincidencias."
                        : "No hay usuarios."}
                    </td>
                  </tr>
                )}
                {/* User Rows */}
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`${
                      editingUserId === user.id
                        ? "bg-indigo-50 dark:bg-indigo-900/10"
                        : "hover:bg-gray-50/50 dark:hover:bg-gray-700/20"
                    } transition-colors duration-100`}
                  >
                    {/* User/Name Cell */}
                    <td className="p-3 align-top">
                      {editingUserId === user.id ? (
                        <div className="space-y-1.5">
                          {/* **RESTAURADO:** Input para Username */}
                          <input
                            type="text"
                            value={editedUsername}
                            placeholder="Usuario"
                            onChange={(e) => setEditedUsername(e.target.value)}
                            className="input-table-edit bg-gray-700 pl-2"
                          />
                          {/* **CORREGIDO:** Input para Nombre Completo con estilos dark */}
                          <input
                            type="text"
                            value={editedFullName}
                            placeholder="Nombre Completo"
                            onChange={(e) => setEditedFullName(e.target.value)}
                            className="input-table-edit bg-gray-700 pl-2"
                          />
                        </div>
                      ) : (
                        <div>
                          <p
                            className="font-medium text-gray-800 dark:text-white truncate"
                            title={user.profile?.full_name || user.username}
                          >
                            {user.profile?.full_name || (
                              <span className="text-gray-400 italic">
                                Sin nombre
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            @{user.username}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Manager Cell */}
                    <td className="p-3 align-top">
                      {editingUserId === user.id ? (
                        <div className="relative">
                          <UserCheck className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <select
                            value={selectedManagerId ?? ""}
                            onChange={(e) =>
                              setSelectedManagerId(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : null
                              )
                            }
                            className="input-table-edit bg-gray-700 pl-7 pr-6 py-1 text-xs appearance-none w-full max-w-[200px]" // Estilos dark ya están en la clase CSS
                          >
                            <option value="">-- Ninguno --</option>
                            {managerOptions.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center px-1 text-gray-400">
                            {" "}
                            {/* Flecha */}
                            <svg
                              className="fill-current h-3 w-3"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          </div>
                        </div>
                      ) : user.profile?.manager_username ? (
                        <span className="text-xs inline-flex items-center gap-1">
                          <UserCheck size={12} /> @
                          {user.profile.manager_username}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          N/A
                        </span>
                      )}
                    </td>

                    {/* Roles Cell */}
                    <td className="p-3 align-top">
                      {editingUserId === user.id ? (
                        <div className="flex flex-wrap gap-1">
                          {roleOptions.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRole(role)}
                              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors duration-150 ${
                                selectedRoles.includes(role)
                                  ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
                                  : "bg-gray-200 dark:bg-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              {" "}
                              {role}{" "}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {user.profile?.roles?.length > 0 ? (
                            user.profile.roles.map((role) => (
                              <span
                                key={role}
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  roleColorMap[role] || roleColorMap.default
                                }`}
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic text-xs">
                              Sin roles
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Cell */}
                    <td className="p-3 text-center align-middle">
                      <div className="flex justify-center items-center gap-2">
                        {editingUserId === user.id ? (
                          <>
                            <button
                              onClick={() => handleSaveClick(user.id)}
                              className="action-button text-green-500 hover:text-green-600 dark:hover:text-green-400"
                              title="Guardar"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Save size={16} />
                              )}
                            </button>
                            <button
                              onClick={handleCancelClick}
                              className="action-button text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              title="Cancelar"
                            >
                              {" "}
                              <X size={16} />{" "}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(user)}
                              className="action-button text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Editar"
                            >
                              {" "}
                              <Edit size={15} />{" "}
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteClick(user.id, user.username)
                              }
                              className={`action-button text-red-500 hover:text-red-600 dark:hover:text-red-400 ${
                                user.id === loggedInUserId
                                  ? "disabled-button"
                                  : ""
                              }`}
                              title="Eliminar"
                              disabled={user.id === loggedInUserId}
                            >
                              {" "}
                              <Trash2 size={15} />{" "}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-600 text-xs">
              {" "}
              {/* dark:border-gray-600 */}
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className="text-gray-600 dark:text-gray-400">Filas:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="pagination-select"
                >
                  <option value={5}>5</option> <option value={10}>10</option>{" "}
                  <option value={25}>25</option> <option value={50}>50</option>
                </select>
              </div>
              <span className="text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                Pág {page + 1} de {pageCount} ({filteredUsers.length}{" "}
                {filteredUsers.length === 1 ? "usuario" : "usuarios"})
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="pagination-button"
                >
                  {" "}
                  <ChevronLeft size={14} />{" "}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                  disabled={page >= pageCount - 1}
                  className="pagination-button"
                >
                  {" "}
                  <ChevronRight size={14} />{" "}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Styles */}
      {/* Styles */}
      <style>{`
        .input-table-edit {
            @apply block w-full px-2 py-1 text-xs rounded border border-gray-300 shadow-sm
                   bg-white placeholder-gray-400 text-gray-900 /* Ensure text color is set for light mode */
                   focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500;
        }
        .dark .input-table-edit {
             @apply bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 /* Changed bg-gray-800 to bg-gray-700 */
                    dark:focus:border-indigo-400 dark:focus:ring-indigo-400/50;
        }
        select.input-table-edit {
            background-image: none; /* Quita flecha default si usas ícono */
            padding-right: 1.5rem; /* Espacio para el ícono si es necesario */
        }
         .action-button {
             @apply p-1.5 rounded-full transition-colors duration-150;
         }
        .action-button:hover:not(:disabled) {
            @apply bg-gray-100 dark:bg-gray-700;
        }
         .action-button:disabled, .disabled-button {
             @apply opacity-50 cursor-not-allowed;
         }
        .pagination-select {
            @apply bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500;
        }
        .pagination-button {
            @apply p-1 rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-600 dark:text-gray-300;
        }
      `}</style>
    </div>
  );
}

export default UserManagement;
