import { useState, useEffect, useMemo } from "react";
import api from "../../api";
import { useAuth } from "../../hooks/useAuth";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Columns,
} from "lucide-react";
import UnebiKeyModal from "./UnebiKeyModal";

const ALL_COLUMNS = [
  { id: "elaborador", label: "Elaborador" },
  { id: "tipo_estudio", label: "Tipo de Estudio" },
  { id: "patrocinador", label: "Patrocinador" },
  { id: "principio_activo", label: "Principio Activo/Dosis/Consideración" },
  { id: "condicion", label: "Condición" },
  { id: "orden_servicio", label: "Orden de Servicio" },
  { id: "fecha_solicitud", label: "Fecha de Solicitud" },
  { id: "fecha_cofepris", label: "Fecha Cofepris" },
  { id: "clave_asignada", label: "Clave Asignada" },
  { id: "status", label: "Status" },
  { id: "tipo_proyecto", label: "Tipo de Proyecto" },
  { id: "comentarios", label: "Comentarios" },
  { id: "llave_pago_cofepris", label: "Llave Pago Cofepris" },
  { id: "no_cofepris", label: "No. Cofepris" },
  { id: "fecha_pago_ip", label: "Fecha Pago IP" },
  { id: "fecha_pago_comite", label: "Fecha Pago Comité" },
  { id: "fecha", label: "Fecha" },
  { id: "observaciones", label: "Observaciones" },
  { id: "segmento_contable", label: "Segmento Contable" },
  { id: "diseno", label: "Diseño" },
  { id: "tamano_muestras", label: "Tamaño de Muestras" },
];

const DEFAULT_VISIBLE_COLUMNS = {
  elaborador: true,
  tipo_estudio: true,
  patrocinador: true,
  principio_activo: true,
  status: true,
  clave_asignada: true,
};

function UnebiKeyManagement() {
  const [unebiKeys, setUnebiKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const { role } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const saved = localStorage.getItem("unebiVisibleColumns");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse visible columns from localStorage", e);
    }
    const initialVisible = {};
    ALL_COLUMNS.forEach((col) => {
      initialVisible[col.id] = DEFAULT_VISIBLE_COLUMNS[col.id] || false;
    });
    return initialVisible;
  });

  useEffect(() => {
    getUnebiKeys();
  }, []);

  const getUnebiKeys = () => {
    api
      .get("/api/unebi/unebikeys/")
      .then((res) => setUnebiKeys(res.data))
      .catch((err) => alert("Error al obtener las claves UNEBI: " + err));
  };

  const handleOpenModal = (key = null, columnId = null) => {
    setEditingKey(key);
    setFocusedField(columnId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingKey(null);
    setIsModalOpen(false);
    setFocusedField(null);
    getUnebiKeys();
  };

  const handleDeleteClick = (keyId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta clave UNEBI?")
    ) {
      api
        .delete(`/api/unebi/unebikeys/${keyId}/`)
        .then(() => {
          alert("¡Clave UNEBI eliminada exitosamente!");
          getUnebiKeys();
        })
        .catch((err) =>
          alert(`Error al eliminar: ${JSON.stringify(err.response.data)}`)
        );
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  const handleColumnVisibilityChange = (columnId) => {
    const newVisibleColumns = {
      ...visibleColumns,
      [columnId]: !visibleColumns[columnId],
    };
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(
      "unebiVisibleColumns",
      JSON.stringify(newVisibleColumns)
    );
  };

  const handleSelectAllColumns = (select) => {
    const newVisibleColumns = {};
    ALL_COLUMNS.forEach((col) => {
      newVisibleColumns[col.id] = select;
    });
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem(
      "unebiVisibleColumns",
      JSON.stringify(newVisibleColumns)
    );
  };

  const filteredKeys = useMemo(() => {
    return unebiKeys
      .filter((key) => {
        return Object.values(key).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .filter((key) => {
        return Object.entries(filters).every(([col, filterValue]) => {
          if (!filterValue) return true;
          return String(key[col])
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
  }, [unebiKeys, searchTerm, filters]);

  const paginatedKeys = filteredKeys.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const canCreate = role.includes("COMERCIAL") || role.includes("ADMIN");
  const canDelete = role.includes("COMERCIAL") || role.includes("ADMIN");

  const displayColumns = ALL_COLUMNS.filter((col) => visibleColumns[col.id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Claves UNEBI
            </h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en todo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                <Columns size={18} />
                Columnas
              </button>
              {isColumnSelectorOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10">
                  <div className="p-2 text-sm font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">
                    Mostrar columnas
                  </div>

                  <div className="flex justify-between p-2 border-b dark:border-gray-700">
                    <button
                      onClick={() => handleSelectAllColumns(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Marcar Todas
                    </button>
                    <button
                      onClick={() => handleSelectAllColumns(false)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Desmarcar Todas
                    </button>
                  </div>

                  <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                    {ALL_COLUMNS.map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[col.id]}
                          onChange={() => handleColumnVisibilityChange(col.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {col.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {canCreate && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Plus size={18} />
                Añadir
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
          <div className="overflow-x-auto">
            {displayColumns.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {displayColumns.map((col) => (
                      <th
                        key={col.id}
                        className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          <Filter size={14} />
                        </div>
                        <input
                          type="text"
                          placeholder={`Filtrar...`}
                          onChange={(e) =>
                            handleFilterChange(col.id, e.target.value)
                          }
                          className="mt-1 w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs"
                        />
                      </th>
                    ))}
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedKeys.map((key) => (
                    // Se quita el hover de la fila completa
                    <tr key={key.id}>
                      {displayColumns.map((col) => (
                        <td
                          key={col.id}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(key, col.id);
                          }}
                          // Se añade el hover y la transición a cada celda
                          className="p-4 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer"
                        >
                          {key[col.id]}
                        </td>
                      ))}
                      <td className="p-4 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal(key);
                            }}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Edit size={20} />
                          </button>
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(key.id);
                              }}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <p className="font-semibold">No hay columnas seleccionadas.</p>
                <p className="mt-2 text-sm">
                  Usa el botón "Columnas" para elegir qué datos deseas
                  visualizar.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800">
            {/* ... (Paginación sin cambios) ... */}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <UnebiKeyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          unebiKey={editingKey}
          userRole={role}
          focusedField={focusedField}
        />
      )}
    </div>
  );
}

export default UnebiKeyManagement;
