// frontend/src/pages/administracion/RequisicionesTodas.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import { useAuth } from "../../hooks/useAuth";
import {
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Loader2,
  X, // Para el modal
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import miLogo from "../../assets/logo_cinasi_pdf.png";

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

function RequisicionesTodas() {
  // Cambiado el nombre del componente
  const [requisiciones, setRequisiciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requisicionToShowDetails, setRequisicionToShowDetails] =
    useState(null);

  // Carga inicial y recarga usando el nuevo endpoint
  const fetchAllRequisiciones = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .get("/api/requisitions/requisitions/all_requisitions/") // <-- USA EL NUEVO ENDPOINT
      .then((res) => {
        // El endpoint ahora podría devolver datos paginados
        // Si devuelve { results: [...] }, usa res.data.results
        // Si devuelve directamente el array [...], usa res.data
        const data = res.data.results || res.data; // Ajusta según la respuesta del backend
        // Ordenar por fecha de creación (si no viene ordenado del backend)
        const sortedData = data.sort(
          (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        setRequisiciones(sortedData);
      })
      .catch((err) => {
        console.error("Error fetching all requisiciones:", err);
        setError("No se pudo cargar el historial completo. Intenta recargar.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchAllRequisiciones();
  }, [fetchAllRequisiciones]);

  // Abrir Modal Detalles
  const openDetailsModal = (requisicion) => {
    setRequisicionToShowDetails(requisicion);
    setShowDetailsModal(true);
  };

  // --- Funciones PDF (Copiadas de Requisiciones.jsx) ---
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
  // --- FIN Funciones PDF ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Historial Completo de Requisiciones
          </h1>
          {/* Podrías añadir filtros si es necesario */}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded border border-red-300 dark:border-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <tr>
                  {/* Simplifica las cabeceras si es necesario */}
                  <th className="p-3 font-semibold">Folio</th>
                  <th className="p-3 font-semibold">Fecha Sol.</th>
                  <th className="p-3 font-semibold">Tipo</th>
                  <th className="p-3 font-semibold">Solicitante</th>
                  <th className="p-3 font-semibold">Creado Por</th>
                  <th className="p-3 font-semibold">Estado</th>
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
                      Cargando historial...
                    </td>
                  </tr>
                )}
                {!isLoading && requisiciones.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No hay requisiciones en el historial.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  requisiciones.map((req) => (
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
                        {req.creado_por_username || "N/A"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          {/* Acciones solo de visualización */}
                          <button
                            onClick={() => openDetailsModal(req)}
                            className="action-button text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Ver Detalles"
                          >
                            <Info size={16} />
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Aquí podrías añadir paginación si el backend la soporta para este endpoint */}
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && (
        <DetailsModal
          requisicion={requisicionToShowDetails}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      {/* Estilos (puedes copiar los de Requisiciones.jsx si son necesarios) */}
      <style>{`
            .action-button { padding: 0.25rem; border-radius: 9999px; transition: background-color 0.15s ease-in-out; }
            .action-button:hover { background-color: rgba(128, 128, 128, 0.1); }
            .dark .action-button:hover { background-color: rgba(255, 255, 255, 0.1); }
       `}</style>
    </div>
  );
}

export default RequisicionesTodas; // Cambiado el nombre de exportación
