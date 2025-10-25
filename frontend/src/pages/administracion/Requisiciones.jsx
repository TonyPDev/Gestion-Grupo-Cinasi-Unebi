import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { useAuth } from "../../hooks/useAuth"; // Hook para obtener info del usuario logueado
import {
  Plus,
  Trash2,
  Download,
  Edit,
  Eye,
  CheckCircle,
  XCircle, // Ícono para rechazar (¡Importado!)
  Clock,
  Info,
  FileText,
  User,
  X, // Asegúrate que X esté importado para el modal
  Loader2, // Para indicar carga en botones
} from "lucide-react"; // <--- Asegurarse que X está aquí
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import miLogo from "../../assets/logo_cinasi_pdf.png";

// Componente StatusBadge (sin cambios)
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100 dark:bg-gray-700";
  let textColor = "text-gray-600 dark:text-gray-300";
  let Icon = Clock;
  let statusText = status || "Desconocido"; // Manejar posible undefined

  // Convertir el ID de estado a texto legible si viene como ID
  const statusMap = {
    DRAFT: "Borrador",
    PENDING_MANAGER: "Pendiente Jefe",
    PENDING_PURCHASING: "Pendiente Compras",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
  };

  // Usar el texto legible si está en el mapa, si no, usar el texto original formateado
  statusText =
    statusMap[status] ||
    statusText
      .replace("_", " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

  switch (status) {
    case "PENDING_MANAGER":
      bgColor = "bg-yellow-100 dark:bg-yellow-900/50";
      textColor = "text-yellow-600 dark:text-yellow-400";
      Icon = Clock;
      break;
    case "PENDING_PURCHASING":
      bgColor = "bg-blue-100 dark:bg-blue-900/50";
      textColor = "text-blue-600 dark:text-blue-400";
      Icon = Clock;
      break;
    case "APPROVED":
      bgColor = "bg-green-100 dark:bg-green-900/50";
      textColor = "text-green-600 dark:text-green-400";
      Icon = CheckCircle;
      break;
    case "REJECTED":
      bgColor = "bg-red-100 dark:bg-red-900/50";
      textColor = "text-red-600 dark:text-red-400";
      Icon = XCircle;
      break;
    case "DRAFT":
      bgColor = "bg-gray-100 dark:bg-gray-700";
      textColor = "text-gray-500 dark:text-gray-400";
      Icon = Edit;
      break;
    default: // Para estados desconocidos o nulos
      bgColor = "bg-gray-100 dark:bg-gray-700";
      textColor = "text-gray-500 dark:text-gray-400";
      Icon = Info; // O un ícono genérico
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      <Icon size={12} />
      {statusText}
    </span>
  );
};

// Componente DetailsModal (Corregido: botón X)
const DetailsModal = ({ requisicion, onClose }) => {
  if (!requisicion) return null;

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleString("es-MX", {
          timeZone: "UTC",
          dateStyle: "short",
          timeStyle: "short",
        })
      : "N/A";
  const formatDateOnly = (dateString) =>
    dateString
      ? new Date(dateString + "T00:00:00Z").toLocaleDateString("es-MX", {
          timeZone: "UTC",
        })
      : "N/A";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm" // Aumentado z-index
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Detalles Requisición: {requisicion.folio}
          </h3>
          <button /* CORREGIDO: Botón de cierre */
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto text-sm">
          {/* ... (resto del contenido del modal sin cambios) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Estado:
              </strong>{" "}
              <StatusBadge status={requisicion.status} />
            </p>{" "}
            {/* Usar req.status */}
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Tipo:
              </strong>{" "}
              {requisicion.tipo_requisicion}
            </p>
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Fecha Solicitud:
              </strong>{" "}
              {formatDateOnly(requisicion.fecha_solicitud)}
            </p>
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Creado por:
              </strong>{" "}
              {requisicion.creado_por_username || "N/A"}
            </p>
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Solicitante (Nombre):
              </strong>{" "}
              {requisicion.nombre_solicitante || "N/A"}
            </p>
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Aprobador Actual:
              </strong>{" "}
              {requisicion.approver_assigned_username || "N/A"}
            </p>
          </div>
          <div className="pt-3 border-t dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Justificación:
            </h4>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
              {requisicion.justificacion}
            </p>
          </div>
          {/* Historial de Aprobaciones */}
          <div className="pt-3 border-t dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Historial Aprobación:
            </h4>
            {requisicion.approved_by_manager_username ? (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle size={14} /> Aprobado por Jefe (
                {requisicion.approved_by_manager_username}) el{" "}
                {formatDate(requisicion.manager_approval_date)}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock size={14} /> Pendiente aprobación Jefe
              </p>
            )}
            {requisicion.approved_by_purchasing_username ? (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                <CheckCircle size={14} /> Aprobado por Compras (
                {requisicion.approved_by_purchasing_username}) el{" "}
                {formatDate(requisicion.purchasing_approval_date)}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <Clock size={14} /> Pendiente aprobación Compras
              </p>
            )}
          </div>

          {requisicion.status === "REJECTED" &&
            requisicion.rejection_reason && (
              <div className="pt-3 border-t dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400 flex items-center gap-1">
                  <XCircle size={14} /> Motivo Rechazo:
                </h4>
                <p className="text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700">
                  {requisicion.rejection_reason}
                </p>
              </div>
            )}
          {/* Tabla de Items */}
          <div className="pt-3 border-t dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Items:
            </h4>
            {requisicion.items && requisicion.items.length > 0 ? (
              <div className="overflow-x-auto max-h-60 border rounded dark:border-gray-600">
                {" "}
                {/* Añadido max-h y borde */}
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    {" "}
                    {/* Sticky header */}
                    <tr>
                      <th className="p-2 text-left font-medium">#</th>
                      <th className="p-2 text-right font-medium">Cantidad</th>
                      <th className="p-2 text-left font-medium">Unidad</th>
                      <th className="p-2 text-left font-medium">
                        Producto/Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-600">
                    {requisicion.items.map((item) => (
                      <tr key={item.id || item.partida_num}>
                        <td className="p-2">{item.partida_num}</td>
                        <td className="p-2 text-right">
                          {Number(item.cantidad).toLocaleString("es-MX", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>{" "}
                        {/* Formato número */}
                        <td className="p-2">{item.unidad}</td>
                        <td className="p-2">{item.producto}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay items registrados.</p>
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentRequisicion, setCurrentRequisicion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId: loggedInUserId, role: userRoles } = useAuth();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [requisicionToReject, setRequisicionToReject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requisicionToShowDetails, setRequisicionToShowDetails] =
    useState(null);

  const initialFormData = {
    fecha_solicitud: "",
    tipo_requisicion: "Material",
    justificacion: "",
    nombre_solicitante: "",
    items: [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
  };
  const [formData, setFormData] = useState(initialFormData);

  // Carga inicial y recarga
  const fetchRequisiciones = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .get("/api/requisitions/requisitions/")
      .then((res) => {
        // Ordenar por fecha de creación descendente (más recientes primero)
        const sortedData = res.data.sort(
          (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        setRequisiciones(sortedData);
      })
      .catch((err) => {
        console.error("Error fetching requisiciones:", err);
        setError("No se pudieron cargar las requisiciones. Intenta recargar.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchRequisiciones();
  }, [fetchRequisiciones]);

  // --- Manejadores de Formulario ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    const finalValue =
      name === "cantidad"
        ? value === ""
          ? ""
          : parseFloat(value) || 0
        : value;
    newItems[index] = { ...newItems[index], [name]: finalValue };
    newItems.forEach((item, i) => (item.partida_num = i + 1)); // Recalcula partida_num
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          partida_num: prev.items.length + 1,
          cantidad: "",
          unidad: "",
          producto: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      alert("Debe haber al menos un item en la requisición.");
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => (item.partida_num = i + 1));
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentRequisicion(null);
    setShowForm(false);
    setError(null); // Limpiar errores al cancelar/resetear
  };

  // --- Submit del Formulario (Crear/Actualizar) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.items.every(
        (item) =>
          item.cantidad > 0 && item.unidad.trim() && item.producto.trim()
      )
    ) {
      setError(
        "Error: Complete todos los campos (*Cantidad, Unidad, Producto*) para cada item. La cantidad debe ser mayor a 0."
      );
      return;
    }
    setError(null); // Limpiar error si la validación pasa

    const dataToSubmit = { ...formData };
    setIsLoading(true);

    const apiCall = currentRequisicion
      ? api.patch(
          `/api/requisitions/requisitions/${currentRequisicion.id}/`,
          dataToSubmit
        )
      : api.post("/api/requisitions/requisitions/", dataToSubmit);

    apiCall
      .then((res) => {
        // Capturar la respuesta para obtener el folio si es nueva
        const action = currentRequisicion ? "actualizada" : "creada";
        const folio =
          res.data?.folio || currentRequisicion?.folio || "desconocido"; // Obtener folio
        alert(`Requisición ${folio} ${action} con éxito.`);
        resetForm();
        fetchRequisiciones();
      })
      .catch((err) => {
        console.error(
          "Error submitting form:",
          err.response?.data || err.message
        );
        // Mostrar un mensaje de error más específico si es posible
        const errorData = err.response?.data;
        let errorMessage = "Ocurrió un error al guardar.";
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === "object") {
          // Intenta obtener mensajes de error específicos del serializer
          errorMessage = Object.entries(errorData)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
        }
        setError(`Error al guardar: ${errorMessage}`);
        // No ocultar el formulario en caso de error para que el usuario pueda corregir
      })
      .finally(() => setIsLoading(false));
  };

  // --- Cargar datos para Editar ---
  const handleEdit = (req) => {
    // Permitir editar solo si está Rechazada y eres el creador
    if (req.status !== "REJECTED" || req.creado_por !== loggedInUserId) {
      alert("Solo puedes editar requisiciones rechazadas que tú creaste.");
      return;
    }
    setCurrentRequisicion(req);
    const formatDate = (dateString) =>
      dateString ? new Date(dateString).toISOString().split("T")[0] : "";
    setFormData({
      fecha_solicitud: formatDate(req.fecha_solicitud),
      tipo_requisicion: req.tipo_requisicion,
      justificacion: req.justificacion,
      nombre_solicitante: req.nombre_solicitante,
      items:
        req.items && req.items.length > 0
          ? req.items.map((item) => ({ ...item })) // Copia simple
          : [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
    });
    setShowForm(true);
    setError(null); // Limpiar errores al abrir el form de edición
  };

  // --- Eliminar ---
  const handleDelete = (req) => {
    // Pasar el objeto req completo
    // Permitir eliminar si está rechazada/borrador y es creador, O si es Admin
    const canDelete =
      ((req.status === "REJECTED" || req.status === "DRAFT") &&
        req.creado_por === loggedInUserId) ||
      (userRoles && userRoles.includes("ADMIN"));

    if (!canDelete) {
      alert(
        "No tienes permiso para eliminar esta requisición en su estado actual."
      );
      return;
    }

    if (
      window.confirm(
        `¿Estás seguro de eliminar la requisición ${req.folio}? Esta acción no se puede deshacer.`
      )
    ) {
      setIsLoading(true);
      api
        .delete(`/api/requisitions/requisitions/${req.id}/`)
        .then(() => {
          alert(`Requisición ${req.folio} eliminada.`);
          fetchRequisiciones();
        })
        .catch((err) =>
          alert(
            `Error al eliminar: ${JSON.stringify(
              err.response?.data || err.message
            )}`
          )
        )
        .finally(() => setIsLoading(false));
    }
  };

  // --- Acciones de Aprobación/Rechazo ---
  const handleApproveManager = (id) => {
    if (
      !window.confirm(
        "¿Confirmas la aprobación como Jefe Directo? La requisición pasará a Compras."
      )
    )
      return;
    setIsLoading(true);
    api
      .post(`/api/requisitions/requisitions/${id}/approve_manager/`)
      .then((res) => {
        alert("Requisición aprobada por jefe.");
        fetchRequisiciones(); // Recargar para ver el cambio de estado
      })
      .catch((err) =>
        alert(
          `Error al aprobar (Jefe): ${JSON.stringify(
            err.response?.data || err.message
          )}`
        )
      )
      .finally(() => setIsLoading(false));
  };

  const handleApprovePurchasing = (id) => {
    if (!window.confirm("¿Confirmas la aprobación final como Compras?")) return;
    setIsLoading(true);
    api
      .post(`/api/requisitions/requisitions/${id}/approve_purchasing/`)
      .then((res) => {
        alert("Requisición aprobada por compras.");
        fetchRequisiciones();
      })
      .catch((err) =>
        alert(
          `Error al aprobar (Compras): ${JSON.stringify(
            err.response?.data || err.message
          )}`
        )
      )
      .finally(() => setIsLoading(false));
  };

  const openRejectModal = (requisicion) => {
    setRequisicionToReject(requisicion);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectSubmit = () => {
    if (!requisicionToReject || !rejectionReason.trim()) {
      alert("Por favor, ingresa un motivo para el rechazo.");
      return;
    }
    setIsLoading(true);
    api
      .post(
        `/api/requisitions/requisitions/${requisicionToReject.id}/reject/`,
        {
          rejection_reason: rejectionReason,
        }
      )
      .then((res) => {
        alert(`Requisición ${requisicionToReject.folio} rechazada.`);
        setShowRejectModal(false);
        setRequisicionToReject(null);
        fetchRequisiciones();
      })
      .catch((err) =>
        alert(
          `Error al rechazar: ${JSON.stringify(
            err.response?.data || err.message
          )}`
        )
      )
      .finally(() => setIsLoading(false));
  };

  // --- Abrir Modal Detalles ---
  const openDetailsModal = (requisicion) => {
    setRequisicionToShowDetails(requisicion);
    setShowDetailsModal(true);
  };

  // --- Funciones PDF (sin cambios aquí, ya estaban correctas) ---
  const createPDFDocument = (requisicionData) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const usableWidth = pageWidth - margin * 2;
    let y = margin;
    let logoAdded = false;

    // Encabezado con LOGO
    try {
      if (miLogo) {
        const img = new Image();
        img.src = miLogo;
        // Calculamos proporciones (asumimos que el logo base tiene cierto ancho/alto)
        const originalWidth = img.width || 200; // Ancho original o default
        const originalHeight = img.height || 50; // Alto original o default
        const logoWidth = 60; // Ancho deseado en PDF
        const logoHeight = (originalHeight * logoWidth) / originalWidth; // Alto proporcional

        doc.addImage(miLogo, "PNG", margin, y, logoWidth, logoHeight);
        logoAdded = true;
        y += logoHeight + 3;
      } else {
        y += 15;
      }
    } catch (e) {
      console.error("Error adding logo:", e);
      doc.setFontSize(8);
      doc.text("Logo Error", margin, y + 5);
      y += 15;
    }

    // Código FRG
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const codeStartY = margin + 5; // Ajustar Y si hay logo
    doc.text("FRG-001_AD-006_V01", pageWidth - margin, codeStartY, {
      align: "right",
    });

    // Folio y Fecha
    doc.setFontSize(10);
    doc.text(`Folio: ${requisicionData.folio || "N/A"}`, margin, y);
    const fechaSolicitudStr = requisicionData.fecha_solicitud
      ? new Date(
          requisicionData.fecha_solicitud + "T00:00:00Z"
        ).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "N/A";
    doc.text(
      `Fecha de solicitud: ${fechaSolicitudStr}`,
      pageWidth - margin,
      y,
      { align: "right" }
    );
    y += 8;

    // Título Principal
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      "REQUISICION DE MATERIAL, EQUIPO, INSTRUMENTO Y SERVICIO",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 8;

    // Checkboxes
    const tipoY = y;
    const drawCheckbox = (x, label, checked) => {
      doc.rect(x, tipoY - 3.5, 4, 4);
      if (checked) {
        doc.setFontSize(12);
        doc.text("X", x + 0.5, tipoY + 0.5);
        doc.setFontSize(10);
      }
      doc.text(label, x + 6, tipoY);
      return 4 + 2 + doc.getTextWidth(label);
    };
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const widthMaterial = 4 + 2 + doc.getTextWidth("Material");
    const widthEquipo = 4 + 2 + doc.getTextWidth("Equipo/Instrumento");
    const widthServicio = 4 + 2 + doc.getTextWidth("Servicio");
    const totalCheckWidth = widthMaterial + widthEquipo + widthServicio + 20;
    let startX = (pageWidth - totalCheckWidth) / 2;
    drawCheckbox(
      startX,
      "Material",
      requisicionData.tipo_requisicion === "Material"
    );
    startX += widthMaterial + 10;
    drawCheckbox(
      startX,
      "Equipo/Instrumento",
      requisicionData.tipo_requisicion === "Equipo/Instrumento"
    );
    startX += widthEquipo + 10;
    drawCheckbox(
      startX,
      "Servicio",
      requisicionData.tipo_requisicion === "Servicio"
    );
    y = tipoY + 10;

    // Tabla Items
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCION DE LO SOLICITADO", margin, y);
    y += 5;
    const tableBody = (requisicionData.items || []).map((item) => [
      item.partida_num,
      Number(item.cantidad).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }), // Formatear cantidad
      item.unidad,
      item.producto,
    ]);
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Partida No.",
          "Cantidad",
          "Unidad",
          "Producto y Descripción Específica",
        ],
      ],
      body: tableBody,
      theme: "grid",
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 1.5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 20, halign: "right" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: "auto" }, // Ancho automático para descripción
      },
      didParseCell: function (data) {
        // Centrar verticalmente el texto en todas las celdas
        data.cell.styles.valign = "middle";
      },
      didDrawPage: (data) => {
        if (data.cursor && data.cursor.y > y) y = data.cursor.y;
      },
    });
    y = doc.lastAutoTable.finalY + 5; // Obtener Y después de la tabla

    // Nota
    const textPadding = 3;
    const textLineHeightNote = 3.5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const notaText =
      "NOTA: En caso de solicitar un servicio de Calificación o Calibración, especificar el intervalo y los puntos requeridos a calibrar o los requisitos a calificar.";
    const notaLines = doc.splitTextToSize(
      notaText,
      usableWidth - textPadding * 2
    );
    const notaHeight =
      notaLines.length * textLineHeightNote + textPadding * 2 + 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, y, usableWidth, notaHeight);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2); // Restaurar valores por defecto
    doc.text(notaLines, margin + textPadding, y + textPadding + 3);
    y += notaHeight + 4;

    // Justificación
    const justificationYStart = y;
    const titlePaddingY = 4;
    const textLineHeightJust = 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "JUSTIFICACION:",
      margin + textPadding,
      y + textPadding + titlePaddingY
    );
    let justificationTextY =
      y + textPadding + titlePaddingY + textLineHeightJust;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const justificationText = requisicionData.justificacion || "N/A";
    const justificationLines = doc.splitTextToSize(
      justificationText,
      usableWidth - textPadding * 2
    );
    const justificationHeight =
      textPadding +
      titlePaddingY +
      justificationLines.length * textLineHeightJust +
      textPadding +
      2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, justificationYStart, usableWidth, justificationHeight);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.text(justificationLines, margin + textPadding, justificationTextY);
    y = justificationYStart + justificationHeight + 6;

    // Firmas
    const signatureBoxHeight = 30;
    const signatureBoxWidth = (usableWidth - 10) / 2;
    const minimumYForSignatures = pageHeight - margin - signatureBoxHeight - 30; // Margen inf + espacio recibe
    const signatureY = Math.max(y + 8, minimumYForSignatures);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(margin, signatureY, signatureBoxWidth, signatureBoxHeight); // Solicitado
    doc.rect(
      margin + signatureBoxWidth + 10,
      signatureY,
      signatureBoxWidth,
      signatureBoxHeight
    ); // Autorizado Jefe
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);

    let currentYsig = signatureY + 4;
    // Solicitado
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("SOLICITADO POR:", margin + 5, currentYsig);
    currentYsig += 15; // Espacio para firma
    doc.setLineWidth(0.1);
    doc.line(
      margin + 5,
      currentYsig,
      margin + signatureBoxWidth - 5,
      currentYsig
    );
    doc.setLineWidth(0.2);
    currentYsig += 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const fechaFirmaS = "__________"; // Ya no tenemos esta fecha separada
    doc.text(
      `${
        requisicionData.nombre_solicitante || "________________"
      } ${fechaFirmaS}`,
      margin + 5,
      currentYsig
    );
    currentYsig += 4;
    doc.setFontSize(7);
    doc.text("NOMBRE, FIRMA Y FECHA", margin + 5, currentYsig);

    // Autorizado Jefe
    currentYsig = signatureY + 4;
    const autorizaX = margin + signatureBoxWidth + 10 + 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("AUTORIZADO POR: (JEFE INMEDIATO)", autorizaX, currentYsig);
    currentYsig += 15;
    doc.setLineWidth(0.1);
    doc.line(
      autorizaX,
      currentYsig,
      autorizaX + signatureBoxWidth - 10,
      currentYsig
    );
    doc.setLineWidth(0.2);
    currentYsig += 4;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    const managerName =
      requisicionData.approved_by_manager_username || "________________";
    const managerDate = requisicionData.manager_approval_date
      ? new Date(requisicionData.manager_approval_date).toLocaleDateString(
          "es-MX",
          { timeZone: "UTC" }
        )
      : "__________";
    doc.text(`${managerName} ${managerDate}`, autorizaX, currentYsig);
    currentYsig += 4;
    doc.setFontSize(7);
    doc.text("NOMBRE, FIRMA Y FECHA", autorizaX, currentYsig);

    // Recibe Compras
    const recibeBoxHeight = 25;
    const recibeBoxWidth = 90;
    const recibeBoxX = (pageWidth - recibeBoxWidth) / 2;
    const recibeBoxY = signatureY + signatureBoxHeight + 5;
    if (recibeBoxY + recibeBoxHeight < pageHeight - margin - 5) {
      // Margen inferior
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(recibeBoxX, recibeBoxY, recibeBoxWidth, recibeBoxHeight);
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      currentYsig = recibeBoxY + 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBE Responsable de Compras:", recibeBoxX + 5, currentYsig);
      currentYsig += 10;
      doc.setLineWidth(0.1);
      doc.line(
        recibeBoxX + 5,
        currentYsig,
        recibeBoxX + recibeBoxWidth - 5,
        currentYsig
      );
      doc.setLineWidth(0.2);
      currentYsig += 4;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const purchaserName =
        requisicionData.approved_by_purchasing_username || "";
      const purchaserDate = requisicionData.purchasing_approval_date
        ? new Date(requisicionData.purchasing_approval_date).toLocaleDateString(
            "es-MX",
            { timeZone: "UTC" }
          )
        : "";
      // Escribir nombre y fecha si existen, si no, el placeholder
      if (purchaserName) {
        doc.text(
          `${purchaserName} ${purchaserDate}`,
          recibeBoxX + 5,
          currentYsig
        );
      } else {
        doc.text("NOMBRE, FIRMA Y FECHA", recibeBoxX + 5, currentYsig);
      }
    }
    return doc;
  };

  const handleDownloadPDF = (requisicionData) => {
    try {
      const doc = createPDFDocument(requisicionData);
      doc.save(`Requisicion_${requisicionData.folio || "TEMP"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF for download:", error);
      alert("Hubo un error al generar el PDF para descargar.");
    }
  };

  const handlePreviewPDF = (requisicionData) => {
    try {
      const doc = createPDFDocument(requisicionData);
      // Usar output('bloburl') o output('dataurlnewwindow')
      // bloburl es generalmente preferido
      const blobURL = doc.output("bloburl");
      window.open(blobURL, "_blank");
    } catch (error) {
      console.error("Error generating PDF for preview:", error);
      alert("Hubo un error al generar el PDF para previsualizar.");
    }
  };

  // --- Renderizado ---
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {" "}
      {/* Fondo a toda la pantalla */}
      <div className="max-w-7xl mx-auto">
        {/* ... (Encabezado y botón Nueva sin cambios) ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Requisiciones
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setCurrentRequisicion(null);
                setFormData(initialFormData);
                setShowForm(true);
                setError(null); // Limpiar errores al abrir form nuevo
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow hover:shadow-md"
            >
              <Plus size={18} /> Nueva Requisición
            </button>
          )}
        </div>

        {/* Mensaje de error global */}
        {error && !showForm && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 text-sm">
            {error}
          </div>
        )}

        {/* --- Formulario --- */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
              {currentRequisicion ? "Editar" : "Crear"} Requisición{" "}
              {currentRequisicion?.folio ? `(${currentRequisicion.folio})` : ""}
            </h2>
            {/* Mensaje de error dentro del form */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ... (resto del form sin cambios) ... */}
              {/* Campos Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha Solicitud <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleInputChange}
                    required
                    className="mt-1 input-style"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipo_requisicion"
                    value={formData.tipo_requisicion}
                    onChange={handleInputChange}
                    required
                    className="mt-1 input-style"
                  >
                    <option value="Material">Material</option>
                    <option value="Equipo/Instrumento">
                      Equipo/Instrumento
                    </option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre Solicitante <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre_solicitante"
                    value={formData.nombre_solicitante}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    required
                    className="mt-1 input-style"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Justificación <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="justificacion"
                  value={formData.justificacion}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe por qué se necesita esto..."
                  className="mt-1 input-style"
                ></textarea>
              </div>

              {/* Items */}
              <h3 className="text-lg font-semibold border-t pt-4 mt-4 dark:border-gray-700 text-gray-800 dark:text-white">
                Items Solicitados
              </h3>
              {formData.items.map((item, index) => (
                <div
                  key={index} // Usar index como key temporal si no hay IDs únicos aún
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border p-4 rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                >
                  {/* Partida Num */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      #
                    </label>
                    <input
                      type="number"
                      name="partida_num"
                      value={item.partida_num}
                      readOnly
                      className="mt-1 input-style text-center bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      tabIndex={-1}
                    />
                  </div>
                  {/* Cantidad */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Cantidad*
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Ej: 1.00"
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  {/* Unidad */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Unidad*
                    </label>
                    <input
                      type="text"
                      name="unidad"
                      value={item.unidad}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Ej: pza, caja, L"
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  {/* Producto/Descripción */}
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Producto/Descripción*
                    </label>
                    <input
                      type="text"
                      name="producto"
                      value={item.producto}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Detalla el producto o servicio"
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  {/* Botón Eliminar Item */}
                  <div className="md:col-span-1 flex justify-end self-center pt-3 md:pt-0">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                        title="Eliminar Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium py-1"
              >
                <Plus size={16} /> Añadir Item
              </button>

              {/* Botones de acción del formulario */}
              <div className="flex justify-end gap-3 pt-5 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isLoading
                    ? "Guardando..."
                    : currentRequisicion
                    ? "Actualizar"
                    : "Guardar"}
                </button>
              </div>
            </form>
            {/* CORREGIDO: Quitar jsx y global de style */}
            <style>{`
              .input-style {
                display: block;
                width: 100%;
                padding: 0.5rem 0.75rem; /* Ajuste padding */
                font-size: 0.875rem; /* text-sm */
                line-height: 1.25rem;
                border-radius: 0.375rem; /* rounded-md */
                border-width: 1px;
                border-color: #d1d5db; /* border-gray-300 */
                box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                background-color: white;
                color: #1f2937; /* text-gray-800 */
              }
              .dark .input-style {
                background-color: #374151; /* dark:bg-gray-700 */
                border-color: #4b5563; /* dark:border-gray-600 */
                color: #f3f4f6; /* dark:text-gray-100 */
              }
              .input-style::placeholder {
                color: #9ca3af; /* placeholder-gray-400 */
              }
              .dark .input-style::placeholder {
                color: #6b7280; /* dark:placeholder-gray-500 */
              }
              .input-style:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: #6366f1; /* focus:border-indigo-500 */
                box-shadow: 0 0 0 2px #a5b4fc; /* focus:ring-indigo-300 */
              }
              .dark .input-style:focus {
                border-color: #818cf8; /* dark:focus:border-indigo-400 */
                 box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5); /* dark:focus:ring-indigo-400 */
              }
               .input-style:disabled {
                    cursor: not-allowed;
                    background-color: #f3f4f6; /* bg-gray-100 */
                    color: #9ca3af; /* text-gray-400 */
               }
               .dark .input-style:disabled {
                   background-color: #1f2937; /* dark:bg-gray-800 */
                   color: #6b7280; /* dark:text-gray-500 */
               }
               textarea.input-style {
                  min-height: 70px; /* Altura mínima para textareas */
              }
            `}</style>
          </div>
        )}

        {/* --- Tabla de Requisiciones --- */}
        {!showForm && (
          // ... (El div contenedor de la tabla y la tabla misma están bien) ...
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[700px]">
                {" "}
                {/* min-w para evitar compresión excesiva */}
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-semibold">Folio</th>
                    <th className="p-3 font-semibold">Fecha</th>
                    <th className="p-3 font-semibold">Tipo</th>
                    <th className="p-3 font-semibold">Solicitante</th>
                    <th className="p-3 font-semibold">Estado</th>
                    <th className="p-3 font-semibold">Aprobador Actual</th>
                    <th className="p-3 font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                  {isLoading && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-6 text-center text-gray-500 animate-pulse"
                      >
                        Cargando requisiciones...
                      </td>
                    </tr>
                  )}
                  {!isLoading && requisiciones.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gray-500">
                        No se encontraron requisiciones.
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    requisiciones.map((req) => {
                      const canApproveManager =
                        req.status === "PENDING_MANAGER" &&
                        req.approver_assigned === loggedInUserId;
                      const canApprovePurchasing =
                        req.status === "PENDING_PURCHASING" &&
                        userRoles &&
                        userRoles.includes("ADMINISTRACION");
                      const canReject =
                        canApproveManager || canApprovePurchasing;
                      const canEdit =
                        req.status === "REJECTED" &&
                        req.creado_por === loggedInUserId; // CORREGIDO: Lógica de Edición
                      const canDelete =
                        ((req.status === "REJECTED" ||
                          req.status === "DRAFT") &&
                          req.creado_por === loggedInUserId) ||
                        (userRoles && userRoles.includes("ADMIN"));

                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                        >
                          <td className="p-3 whitespace-nowrap font-medium text-gray-800 dark:text-gray-100">
                            {req.folio}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {new Date(
                              req.fecha_solicitud + "T00:00:00Z"
                            ).toLocaleDateString("es-MX", { timeZone: "UTC" })}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {req.tipo_requisicion}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {req.nombre_solicitante}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <StatusBadge status={req.status} />
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {req.approver_assigned_username || "--"}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => openDetailsModal(req)}
                                className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Ver Detalles"
                              >
                                <Info size={16} />
                              </button>
                              {canApproveManager && (
                                <button
                                  onClick={() => handleApproveManager(req.id)}
                                  className="action-button text-green-500 hover:text-green-700 dark:hover:text-green-400"
                                  title="Aprobar (Jefe)"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {canApprovePurchasing && (
                                <button
                                  onClick={() =>
                                    handleApprovePurchasing(req.id)
                                  }
                                  className="action-button text-green-500 hover:text-green-700 dark:hover:text-green-400"
                                  title="Aprobar (Compras)"
                                >
                                  <CheckCircle size={18} />
                                </button>
                              )}
                              {canReject && (
                                <button
                                  onClick={() => openRejectModal(req)}
                                  className="action-button text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                  title="Rechazar"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              {canEdit && (
                                <button
                                  onClick={() => handleEdit(req)}
                                  className="action-button text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {(canApproveManager ||
                                canApprovePurchasing ||
                                canReject ||
                                canEdit) && (
                                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                              )}
                              <button
                                onClick={() => handlePreviewPDF(req)}
                                className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Vista Previa PDF"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(req)}
                                className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Descargar PDF"
                              >
                                <Download size={16} />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(req)}
                                  className="action-button text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div> /* Fin div tabla */
        )}

        {/* --- Modales --- */}
        {showRejectModal && requisicionToReject && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            {" "}
            {/* Mayor z-index */}
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Rechazar Requisición: {requisicionToReject.folio}
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <label
                  htmlFor="rejectionReason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Motivo del Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="rejectionReason"
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full input-style" // Reutiliza la clase de estilo
                  placeholder="Describe por qué se rechaza esta requisición..."
                />
                {!rejectionReason.trim() && (
                  <p className="text-xs text-red-500">
                    El motivo es obligatorio.
                  </p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isLoading ? "Rechazando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showDetailsModal && (
          <DetailsModal
            requisicion={requisicionToShowDetails}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </div>
      {/* Estilos globales y para botones de acción */}
      <style>{`
            .action-button {
                padding: 0.25rem; /* p-1 */
                border-radius: 9999px; /* rounded-full */
                transition: background-color 0.15s ease-in-out;
            }
            .action-button:hover {
                background-color: rgba(128, 128, 128, 0.1); /* Ligero fondo gris al hacer hover */
            }
            .dark .action-button:hover {
                 background-color: rgba(255, 255, 255, 0.1); /* Ligero fondo blanco al hacer hover en dark mode */
            }

            /* Estilos de input (repetidos de arriba para asegurar alcance global si es necesario) */
             .input-style {
                display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem;
                border-radius: 0.375rem; border-width: 1px; border-color: #d1d5db; /* gray-300 */
                box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05); background-color: white; color: #1f2937; /* gray-800 */
              }
              .dark .input-style { background-color: #374151; /* gray-700 */ border-color: #4b5563; /* gray-600 */ color: #f3f4f6; /* gray-100 */ }
              .input-style::placeholder { color: #9ca3af; /* gray-400 */ }
              .dark .input-style::placeholder { color: #6b7280; /* gray-500 */ }
              .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #6366f1; /* indigo-500 */ box-shadow: 0 0 0 2px #a5b4fc; /* ring-indigo-300 */ }
              .dark .input-style:focus { border-color: #818cf8; /* indigo-400 */ box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5); /* ring-indigo-400 */ }
              .input-style:disabled { cursor: not-allowed; background-color: #f3f4f6; /* gray-100 */ color: #9ca3af; /* gray-400 */ }
              .dark .input-style:disabled { background-color: #1f2937; /* gray-800 */ color: #6b7280; /* gray-500 */ }
              textarea.input-style { min-height: 70px; }
       `}</style>
    </div>
  );
}

export default Requisiciones;
