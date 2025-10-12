import { useState, useEffect } from "react";
import api from "../../api";

const ACTION_TYPES = [
  "Create User",
  "Update User",
  "Delete User",
  "Create UnebiKey",
  "Update UnebiKey",
  "Delete UnebiKey",
];

function ActivityLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let url = "/api/activity-logs/";
    if (filter) {
      url += `?action=${encodeURIComponent(filter)}`;
    }

    setLoading(true);
    api
      .get(url)
      .then((res) => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        alert("Error al cargar los registros de actividad.");
        setLoading(false);
      });
  }, [filter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registro de Actividad
          </h1>
          <div className="flex items-center gap-2">
            <label htmlFor="action-filter" className="text-sm font-medium">
              Filtrar por acción:
            </label>
            <select
              id="action-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm"
            >
              <option value="">Todas las acciones</option>
              {ACTION_TYPES.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <p>Cargando registros...</p>
        ) : (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Detalles
                    </th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">
                        {/* --- SE MUESTRA EL NOMBRE COMPLETO Y USUARIO --- */}
                        <p className="font-medium text-gray-900 dark:text-white">
                          {log.user_full_name || "N/A"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          @{log.user_username}
                        </p>
                      </td>
                      <td className="p-4 whitespace-nowrap">{log.action}</td>
                      <td className="p-4">{log.details}</td>
                      <td className="p-4 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLogViewer;
