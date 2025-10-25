// frontend/src/pages/administracion/Requisiciones.jsx
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
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import miLogo from "../../assets/logo_cinasi_pdf.png";

// Componente StatusBadge
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

// Componente DetailsModal
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
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 backdrop-blur-sm"
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <strong className="font-medium text-gray-600 dark:text-gray-400">
                Estado:
              </strong>{" "}
              <StatusBadge status={requisicion.status} />
            </p>
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
              {requisicion.creado_por_full_name ||
                requisicion.creado_por_username ||
                "N/A"}
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
              {requisicion.approver_assigned_full_name ||
              requisicion.approver_assigned_username
                ? requisicion.approver_assigned_full_name ||
                  `@${requisicion.approver_assigned_username}`
                : requisicion.status === "PENDING_PURCHASING"
                ? "Pendiente Compras"
                : requisicion.status === "APPROVED" ||
                  requisicion.status === "REJECTED"
                ? "--"
                : "N/A"}
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
          <div className="pt-3 border-t dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Historial Aprobación:
            </h4>
            {requisicion.approved_by_manager_username ? (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle size={14} /> Aprobado por Jefe (
                {requisicion.approved_by_manager_full_name ||
                  `@${requisicion.approved_by_manager_username}`}
                ) el {formatDate(requisicion.manager_approval_date)}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {" "}
                <Clock size={14} /> Pendiente aprobación Jefe{" "}
              </p>
            )}
            {requisicion.approved_by_purchasing_username ? (
              <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                <CheckCircle size={14} /> Aprobado por Compras (
                {requisicion.approved_by_purchasing_full_name ||
                  `@${requisicion.approved_by_purchasing_username}`}
                ) el {formatDate(requisicion.purchasing_approval_date)}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                {" "}
                <Clock size={14} /> Pendiente aprobación Compras{" "}
              </p>
            )}
          </div>

          {requisicion.status === "REJECTED" &&
            requisicion.rejection_reason && (
              <div className="pt-3 border-t dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400 flex items-center gap-1">
                  {" "}
                  <XCircle size={14} /> Motivo Rechazo:{" "}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-700">
                  {" "}
                  {requisicion.rejection_reason}{" "}
                </p>
              </div>
            )}
          <div className="pt-3 border-t dark:border-gray-700">
            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Items:
            </h4>
            {requisicion.items && requisicion.items.length > 0 ? (
              <div className="overflow-x-auto max-h-60 border rounded dark:border-gray-600">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
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
                        </td>
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
            {" "}
            Cerrar{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal Requisiciones
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
    newItems.forEach((item, i) => (item.partida_num = i + 1));
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
    setError(null);
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
    setError(null);
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
        const action = currentRequisicion ? "actualizada" : "creada";
        const folio =
          res.data?.folio || currentRequisicion?.folio || "desconocido";
        alert(`Requisición ${folio} ${action} con éxito.`);
        resetForm();
        fetchRequisiciones();
      })
      .catch((err) => {
        console.error(
          "Error submitting form:",
          err.response?.data || err.message
        );
        const errorData = err.response?.data;
        let errorMessage = "Ocurrió un error al guardar.";
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === "object") {
          errorMessage = Object.entries(errorData)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("\n");
        }
        setError(`Error al guardar: ${errorMessage}`);
      })
      .finally(() => setIsLoading(false));
  };

  // --- Cargar datos para Editar ---
  const handleEdit = (req) => {
    // No necesita validación aquí, se controla por visibilidad del botón
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
          ? req.items.map((item) => ({ ...item }))
          : [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
    });
    setShowForm(true);
    setError(null);
  };

  // --- Eliminar ---
  const handleDelete = (req) => {
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
        fetchRequisiciones();
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
        { rejection_reason: rejectionReason }
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

  // --- Funciones PDF (CON LA MODIFICACIÓN DE FIRMAS) ---
  const createPDFDocument = (requisicionData) => {
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    // Encabezado con LOGO
    try {
      if (miLogo) {
        const img = new Image();
        img.src = miLogo;
        const originalWidth = img.width || 200;
        const originalHeight = img.height || 50;
        const logoWidth = 60;
        const logoHeight = (originalHeight * logoWidth) / originalWidth;
        doc.addImage(miLogo, "PNG", margin, y, logoWidth, logoHeight);
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

    // Código FRG, Folio, Fecha, Título, Checkboxes
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const codeStartY = margin + 5;
    doc.text("FRG-001_AD-006_V01", pageWidth - margin, codeStartY, {
      align: "right",
    });
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
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      "REQUISICION DE MATERIAL, EQUIPO, INSTRUMENTO Y SERVICIO",
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 8;
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

    // Calcular anchos totales para centrar
    const labelMaterial = "Material";
    const labelEquipo = "Equipo/Instrumento";
    const labelServicio = "Servicio";
    const widthMaterialBox = 4 + 2 + doc.getTextWidth(labelMaterial);
    const widthEquipoBox = 4 + 2 + doc.getTextWidth(labelEquipo);
    const widthServicioBox = 4 + 2 + doc.getTextWidth(labelServicio);
    const totalCheckboxWidth =
      widthMaterialBox + 10 + widthEquipoBox + 10 + widthServicioBox;
    const startXCentered = (pageWidth - totalCheckboxWidth) / 2;

    const widthMaterial = drawCheckbox(
      startXCentered,
      labelMaterial,
      requisicionData.tipo_requisicion === "Material"
    );
    const widthEquipo = drawCheckbox(
      startXCentered + widthMaterial + 10,
      labelEquipo,
      requisicionData.tipo_requisicion === "Equipo/Instrumento"
    );
    drawCheckbox(
      startXCentered + widthMaterial + widthEquipo + 20,
      labelServicio,
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
      }),
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
        3: { cellWidth: "auto" },
      },
      didParseCell: function (data) {
        data.cell.styles.valign = "middle";
      },
      didDrawPage: (data) => {
        if (data.cursor && data.cursor.y > y) y = data.cursor.y;
      },
    });
    y = doc.lastAutoTable.finalY + 5;

    // Nota y Justificación
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
    doc.setLineWidth(0.2);
    doc.text(notaLines, margin + textPadding, y + textPadding + 3);
    y += notaHeight + 4;
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

    // --- SECCIÓN DE FIRMAS MODIFICADA (2 ARRIBA, 1 ABAJO - MISMO TAMAÑO) ---
    const signatureBoxHeight = 35; // Altura más grande para mejor visibilidad
    const signatureBoxWidth = (usableWidth - 10) / 2; // Mismo ancho para todas
    const minimumYForSignatures =
      pageHeight - margin - signatureBoxHeight * 2 - 20;
    const signatureY = Math.max(y + 8, minimumYForSignatures);

    // Dibuja las 2 cajas superiores (Solicitado y Autorizado por Jefe)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    const box1X = margin; // Solicitado por
    const box2X = margin + signatureBoxWidth + 10; // Autorizado por Jefe
    doc.rect(box1X, signatureY, signatureBoxWidth, signatureBoxHeight);
    doc.rect(box2X, signatureY, signatureBoxWidth, signatureBoxHeight);

    // Dibuja la caja inferior (Compras) - mismo ancho, centrada
    const bottomSignatureY = signatureY + signatureBoxHeight + 6;
    const box3X = margin + (usableWidth - signatureBoxWidth) / 2; // Centrada
    doc.rect(box3X, bottomSignatureY, signatureBoxWidth, signatureBoxHeight);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);

    const drawSignatureContent = (
      boxX,
      boxY,
      boxWidth,
      title,
      name,
      date,
      isDateField = false
    ) => {
      let currentYsig = boxY + 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      // Split title if too long for the box width
      const titleLines = doc.splitTextToSize(title, boxWidth - 10);
      doc.text(titleLines, boxX + 5, currentYsig);
      currentYsig += titleLines.length * 4 + 12; // Adjust space based on title lines

      doc.setLineWidth(0.1);
      doc.line(boxX + 5, currentYsig, boxX + boxWidth - 5, currentYsig);
      doc.setLineWidth(0.2);
      currentYsig += 4;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      const nameToShow = name || "________________";
      // Use formatDateOnly for date fields, formatDate for datetime fields
      const dateToShow = date
        ? isDateField
          ? new Date(date + "T00:00:00Z").toLocaleDateString("es-MX", {
              timeZone: "UTC",
            }) // Treat as date only
          : new Date(date).toLocaleDateString("es-MX", { timeZone: "UTC" }) // Treat as datetime (just date part)
        : "__________";

      // Check if name and date fit on one line, otherwise split
      const nameDateText = `${nameToShow} ${dateToShow}`;
      if (doc.getTextWidth(nameDateText) > boxWidth - 10) {
        doc.text(nameToShow, boxX + 5, currentYsig);
        currentYsig += 4; // Move down for the date
        doc.text(dateToShow, boxX + 5, currentYsig);
      } else {
        doc.text(nameDateText, boxX + 5, currentYsig);
      }
      currentYsig += 4.5; // Space before the label
      doc.setFontSize(7);
      doc.text("NOMBRE, FIRMA Y FECHA", boxX + 5, currentYsig);
    };

    // Llama a la función para las 2 cajas superiores
    drawSignatureContent(
      box1X,
      signatureY,
      signatureBoxWidth,
      "SOLICITADO POR:",
      requisicionData.nombre_solicitante,
      requisicionData.fecha_solicitud,
      true
    ); // Mark as a date field

    drawSignatureContent(
      box2X,
      signatureY,
      signatureBoxWidth,
      "AUTORIZADO POR: (JEFE INMEDIATO)",
      requisicionData.approved_by_manager_full_name ||
        requisicionData.approved_by_manager_username,
      requisicionData.manager_approval_date
    ); // This is DateTimeField

    // Llama a la función para la caja inferior (Compras) - centrada
    drawSignatureContent(
      box3X,
      bottomSignatureY,
      signatureBoxWidth,
      "AUTORIZADO POR: (COMPRAS)",
      requisicionData.approved_by_purchasing_full_name ||
        requisicionData.approved_by_purchasing_username,
      requisicionData.purchasing_approval_date
    ); // This is DateTimeField

    // --- FIN SECCIÓN DE FIRMAS MODIFICADA ---

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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            {" "}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {" "}
              Gestión de Requisiciones{" "}
            </h1>{" "}
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setCurrentRequisicion(null);
                setFormData(initialFormData);
                setShowForm(true);
                setError(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow hover:shadow-md"
            >
              {" "}
              <Plus size={18} /> Nueva Requisición{" "}
            </button>
          )}
        </div>

        {error && !showForm && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 text-sm">
            {" "}
            {error}{" "}
          </div>
        )}

        {/* --- Formulario --- */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 border dark:border-gray-700">
            {/* ... Contenido del formulario (sin cambios) ... */}
            <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white border-b pb-3 dark:border-gray-700">
              {" "}
              {currentRequisicion ? "Editar" : "Crear"} Requisición{" "}
              {currentRequisicion?.folio ? `(${currentRequisicion.folio})` : ""}{" "}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campos Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {" "}
                    Fecha Solicitud <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <input
                    type="date"
                    name="fecha_solicitud"
                    value={formData.fecha_solicitud}
                    onChange={handleInputChange}
                    required
                    className="mt-1 input-style"
                  />{" "}
                </div>
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {" "}
                    Tipo <span className="text-red-500">*</span>{" "}
                  </label>{" "}
                  <select
                    name="tipo_requisicion"
                    value={formData.tipo_requisicion}
                    onChange={handleInputChange}
                    required
                    className="mt-1 input-style"
                  >
                    {" "}
                    <option value="Material">Material</option>{" "}
                    <option value="Equipo/Instrumento">
                      {" "}
                      Equipo/Instrumento{" "}
                    </option>{" "}
                    <option value="Servicio">Servicio</option>{" "}
                  </select>{" "}
                </div>
                <div>
                  {" "}
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {" "}
                    Nombre Solicitante <span className="text-red-500">
                      *
                    </span>{" "}
                  </label>{" "}
                  <input
                    type="text"
                    name="nombre_solicitante"
                    value={formData.nombre_solicitante}
                    onChange={handleInputChange}
                    placeholder="Tu nombre completo"
                    required
                    className="mt-1 input-style"
                  />{" "}
                </div>
              </div>
              <div>
                {" "}
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {" "}
                  Justificación <span className="text-red-500">*</span>{" "}
                </label>{" "}
                <textarea
                  name="justificacion"
                  value={formData.justificacion}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe por qué se necesita esto..."
                  className="mt-1 input-style"
                ></textarea>{" "}
              </div>

              {/* Items */}
              <h3 className="text-lg font-semibold border-t pt-4 mt-4 dark:border-gray-700 text-gray-800 dark:text-white">
                {" "}
                Items Solicitados{" "}
              </h3>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border p-4 rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                >
                  <div className="md:col-span-1">
                    {" "}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      #
                    </label>{" "}
                    <input
                      type="number"
                      name="partida_num"
                      value={item.partida_num}
                      readOnly
                      className="mt-1 input-style text-center bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                      tabIndex={-1}
                    />{" "}
                  </div>
                  <div className="md:col-span-2">
                    {" "}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Cantidad*
                    </label>{" "}
                    <input
                      type="number"
                      step="1"
                      min="1"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Ej: 1.00"
                      required
                      className="mt-1 input-style"
                    />{" "}
                  </div>
                  <div className="md:col-span-2">
                    {" "}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Unidad*
                    </label>{" "}
                    <input
                      type="text"
                      name="unidad"
                      value={item.unidad}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Ej: pza, caja, L"
                      required
                      className="mt-1 input-style"
                    />{" "}
                  </div>
                  <div className="md:col-span-6">
                    {" "}
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Producto/Descripción*
                    </label>{" "}
                    <input
                      type="text"
                      name="producto"
                      value={item.producto}
                      onChange={(e) => handleItemChange(index, e)}
                      placeholder="Detalla el producto o servicio"
                      required
                      className="mt-1 input-style"
                    />{" "}
                  </div>
                  <div className="md:col-span-1 flex justify-end self-center pt-3 md:pt-0">
                    {" "}
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                        title="Eliminar Item"
                      >
                        {" "}
                        <Trash2 size={18} />{" "}
                      </button>
                    )}{" "}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium py-1"
              >
                {" "}
                <Plus size={16} /> Añadir Item{" "}
              </button>

              {/* Botones formulario */}
              <div className="flex justify-end gap-3 pt-5 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  {" "}
                  Cancelar{" "}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {" "}
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}{" "}
                  {isLoading
                    ? "Guardando..."
                    : currentRequisicion
                    ? "Actualizar"
                    : "Guardar"}{" "}
                </button>
              </div>
            </form>
            <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; border-radius: 0.375rem; border-width: 1px; border-color: #d1d5db; box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05); background-color: white; color: #1f2937; } .dark .input-style { background-color: #374151; border-color: #4b5563; color: #f3f4f6; } .input-style::placeholder { color: #9ca3af; } .dark .input-style::placeholder { color: #6b7280; } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #6366f1; box-shadow: 0 0 0 2px #a5b4fc; } .dark .input-style:focus { border-color: #818cf8; box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5); } .input-style:disabled { cursor: not-allowed; background-color: #f3f4f6; color: #9ca3af; } .dark .input-style:disabled { background-color: #1f2937; color: #6b7280; } textarea.input-style { min-height: 70px; }`}</style>
          </div>
        )}

        {/* --- Tabla de Requisiciones --- */}
        {!showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              {/* ... Contenido de la tabla (sin cambios) ... */}
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {" "}
                  <tr>
                    {" "}
                    <th className="p-3 font-semibold">Folio</th>{" "}
                    <th className="p-3 font-semibold">Fecha</th>{" "}
                    <th className="p-3 font-semibold">Tipo</th>{" "}
                    <th className="p-3 font-semibold">Solicitante</th>{" "}
                    <th className="p-3 font-semibold">Estado</th>{" "}
                    <th className="p-3 font-semibold">Aprobador Actual</th>{" "}
                    <th className="p-3 font-semibold text-center">Acciones</th>{" "}
                  </tr>{" "}
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
                        (userRoles.includes("ADMINISTRACION") ||
                          userRoles.includes("COMPRAS")); // Ajusta si usas rol COMPRAS
                      const canReject =
                        canApproveManager || canApprovePurchasing;
                      const canEdit =
                        (req.status === "REJECTED" ||
                          req.status === "PENDING_MANAGER") &&
                        req.creado_por === loggedInUserId;
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
                            {" "}
                            {req.approver_assigned_full_name ||
                            req.approver_assigned_username
                              ? req.approver_assigned_full_name ||
                                `@${req.approver_assigned_username}`
                              : "--"}{" "}
                          </td>
                          <td className="p-3 text-center">
                            {" "}
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => openDetailsModal(req)}
                                className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Ver Detalles"
                              >
                                {" "}
                                <Info size={16} />{" "}
                              </button>
                              {canApproveManager && (
                                <button
                                  onClick={() => handleApproveManager(req.id)}
                                  className="action-button text-green-500 hover:text-green-700 dark:hover:text-green-400"
                                  title="Aprobar (Jefe)"
                                >
                                  {" "}
                                  <CheckCircle size={18} />{" "}
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
                                  {" "}
                                  <CheckCircle size={18} />{" "}
                                </button>
                              )}
                              {canReject && (
                                <button
                                  onClick={() => openRejectModal(req)}
                                  className="action-button text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                  title="Rechazar"
                                >
                                  {" "}
                                  <XCircle size={18} />{" "}
                                </button>
                              )}
                              {canEdit && (
                                <button
                                  onClick={() => handleEdit(req)}
                                  className="action-button text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                                  title="Editar"
                                >
                                  {" "}
                                  <Edit size={16} />{" "}
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
                                {" "}
                                <Eye size={16} />{" "}
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(req)}
                                className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Descargar PDF"
                              >
                                {" "}
                                <Download size={16} />{" "}
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(req)}
                                  className="action-button text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                  title="Eliminar"
                                >
                                  {" "}
                                  <Trash2 size={16} />{" "}
                                </button>
                              )}
                            </div>{" "}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Modales (sin cambios) --- */}
        {showRejectModal && requisicionToReject && (
          // ... Contenido del modal de rechazo ...
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b dark:border-gray-700">
                {" "}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {" "}
                  Rechazar Requisición: {requisicionToReject.folio}{" "}
                </h3>{" "}
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {" "}
                  <X size={20} />{" "}
                </button>{" "}
              </div>
              <div className="p-6 space-y-3">
                {" "}
                <label
                  htmlFor="rejectionReason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {" "}
                  Motivo del Rechazo <span className="text-red-500">
                    *
                  </span>{" "}
                </label>{" "}
                <textarea
                  id="rejectionReason"
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full input-style"
                  placeholder="Describe por qué se rechaza esta requisición..."
                />{" "}
                {!rejectionReason.trim() && (
                  <p className="text-xs text-red-500">
                    {" "}
                    El motivo es obligatorio.{" "}
                  </p>
                )}{" "}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end gap-3">
                {" "}
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md font-medium"
                >
                  {" "}
                  Cancelar{" "}
                </button>{" "}
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {" "}
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}{" "}
                  {isLoading ? "Rechazando..." : "Confirmar Rechazo"}{" "}
                </button>{" "}
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
      {/* Estilos */}
      <style>{`.action-button { padding: 0.25rem; border-radius: 9999px; transition: background-color 0.15s ease-in-out; } .action-button:hover { background-color: rgba(128, 128, 128, 0.1); } .dark .action-button:hover { background-color: rgba(255, 255, 255, 0.1); } .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; border-radius: 0.375rem; border-width: 1px; border-color: #d1d5db; box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05); background-color: white; color: #1f2937; } .dark .input-style { background-color: #374151; border-color: #4b5563; color: #f3f4f6; } .input-style::placeholder { color: #9ca3af; } .dark .input-style::placeholder { color: #6b7280; } .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #6366f1; box-shadow: 0 0 0 2px #a5b4fc; } .dark .input-style:focus { border-color: #818cf8; box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5); } .input-style:disabled { cursor: not-allowed; background-color: #f3f4f6; color: #9ca3af; } .dark .input-style:disabled { background-color: #1f2937; color: #6b7280; } textarea.input-style { min-height: 70px; }`}</style>
    </div>
  );
}

export default Requisiciones;
