import React, { useState, useEffect } from "react";
import api from "../../api";
import { Plus, Trash2, Download, Edit, Eye } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import miLogo from "../../assets/logo_cinasi_pdf.png";

function Requisiciones() {
  const [requisiciones, setRequisiciones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentRequisicion, setCurrentRequisicion] = useState(null);
  const [formData, setFormData] = useState({
    fecha_solicitud: "",
    tipo_requisicion: "Material",
    justificacion: "",
    nombre_solicitante: "",
    fecha_firma_solicitante: "",
    nombre_autoriza: "",
    fecha_firma_autoriza: "",
    items: [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
  });

  // ... (useEffect, fetchRequisiciones, handleInputChange, handleItemChange, addItem, removeItem, resetForm, handleSubmit, handleEdit, handleDelete - SIN CAMBIOS) ...
  useEffect(() => {
    fetchRequisiciones();
  }, []);
  const fetchRequisiciones = () => {
    api
      .get("/api/requisitions/requisitions/")
      .then((res) => setRequisiciones(res.data))
      .catch((err) => console.error("Error fetching requisiciones:", err));
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [name]: value };
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
    if (formData.items.length <= 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => (item.partida_num = i + 1));
    setFormData((prev) => ({ ...prev, items: newItems }));
  };
  const resetForm = () => {
    setFormData({
      fecha_solicitud: "",
      tipo_requisicion: "Material",
      justificacion: "",
      nombre_solicitante: "",
      fecha_firma_solicitante: null,
      nombre_autoriza: "",
      fecha_firma_autoriza: null,
      items: [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
    });
    setCurrentRequisicion(null);
    setShowForm(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      fecha_firma_solicitante: formData.fecha_firma_solicitante || null,
      fecha_firma_autoriza: formData.fecha_firma_autoriza || null,
    };
    const apiCall = currentRequisicion
      ? api.patch(
          `/api/requisitions/requisitions/${currentRequisicion.id}/`,
          dataToSubmit
        )
      : api.post("/api/requisitions/requisitions/", dataToSubmit);
    apiCall
      .then(() => {
        alert(
          `Requisición ${
            currentRequisicion ? "actualizada" : "creada"
          } con éxito.`
        );
        resetForm();
        fetchRequisiciones();
      })
      .catch((err) => {
        console.error(
          "Error submitting form:",
          err.response?.data || err.message
        );
        alert(`Error: ${JSON.stringify(err.response?.data || err.message)}`);
      });
  };
  const handleEdit = (req) => {
    setCurrentRequisicion(req);
    const formatDate = (dateString) =>
      dateString ? new Date(dateString).toISOString().split("T")[0] : "";
    setFormData({
      ...req,
      fecha_solicitud: formatDate(req.fecha_solicitud),
      fecha_firma_solicitante: formatDate(req.fecha_firma_solicitante),
      fecha_firma_autoriza: formatDate(req.fecha_firma_autoriza),
      items:
        req.items && req.items.length > 0
          ? req.items
          : [{ partida_num: 1, cantidad: "", unidad: "", producto: "" }],
    });
    setShowForm(true);
  };
  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta requisición?")) {
      api
        .delete(`/api/requisitions/requisitions/${id}/`)
        .then(() => {
          alert("Requisición eliminada.");
          fetchRequisiciones();
        })
        .catch((err) =>
          alert(`Error al eliminar: ${JSON.stringify(err.response?.data)}`)
        );
    }
  };

  // --- Función Base para Crear el Documento PDF (sin guardar/mostrar) ---
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
      if (typeof miLogo !== "undefined" && miLogo) {
        const logoWidth = 80;
        const logoHeight = 25;
        doc.addImage(miLogo, "WEBP", margin, y, logoWidth, logoHeight); // Ajusta 'WEBP' si tu logo es otro formato
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
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const codeStartY = margin + 5;
    doc.text("FRG-001_AD-006_V01", pageWidth - margin, codeStartY, {
      align: "right",
    });

    // Título Principal, Folio, Fecha, Checkboxes, Tabla, Nota, Justificación...
    // (Esta parte es idéntica a la función generatePDF anterior)
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
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
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPCION DE LO SOLICITADO", margin, y);
    y += 5;
    const tableBody = requisicionData.items.map((item) => [
      item.partida_num,
      item.cantidad,
      item.unidad,
      item.producto,
    ]);
    autoTable(doc, {
      startY: y,
      head: [
        [
          "Partida No.",
          "Cantidad Requerida",
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
      },
      bodyStyles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 25, halign: "right" },
        2: { cellWidth: 20, halign: "center" },
      },
      didDrawPage: (data) => {
        if (data.cursor && data.cursor.y > y) {
          y = data.cursor.y;
        }
      },
    });
    y += 5;
    const textPadding = 3;
    const textLineHeightNote = 3.5;
    const textLineHeightJust = 4;
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
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, y, usableWidth, notaHeight);
    doc.setDrawColor(0);
    doc.text(notaLines, margin + textPadding, y + textPadding + 3);
    y += notaHeight + 4;
    const justificationYStart = y;
    const titlePaddingY = 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      "JUSTIFICACION:",
      margin + textPadding,
      y + textPadding + titlePaddingY
    );
    let justificationTextY =
      y + textPadding + titlePaddingY + textLineHeightJust;
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
    doc.setDrawColor(180, 180, 180);
    doc.rect(margin, justificationYStart, usableWidth, justificationHeight);
    doc.setDrawColor(0);
    doc.text(justificationLines, margin + textPadding, justificationTextY);
    y = justificationYStart + justificationHeight + 6;

    // Firmas con Recuadros
    const signatureBoxHeight = 35;
    const signatureBoxWidth = (usableWidth - 10) / 2;
    const minimumYForSignatures = pageHeight - margin - signatureBoxHeight - 35;
    const signatureY = Math.max(y + 10, minimumYForSignatures);
    doc.rect(margin, signatureY, signatureBoxWidth, signatureBoxHeight);
    doc.rect(
      margin + signatureBoxWidth + 10,
      signatureY,
      signatureBoxWidth,
      signatureBoxHeight
    );
    let currentY = signatureY + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SOLICITADO POR:", margin + 5, currentY);
    currentY += 15;
    doc.line(margin + 5, currentY, margin + signatureBoxWidth - 5, currentY);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    const fechaFirmaS = requisicionData.fecha_firma_solicitante
      ? new Date(
          requisicionData.fecha_firma_solicitante + "T00:00:00Z"
        ).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "__________";
    doc.text(
      `${
        requisicionData.nombre_solicitante || "________________"
      } ${fechaFirmaS}`,
      margin + 5,
      currentY
    );
    currentY += 5;
    doc.setFontSize(8);
    doc.text("NOMBRE, FIRMA Y FECHA", margin + 5, currentY);
    currentY = signatureY + 5;
    const autorizaX = margin + signatureBoxWidth + 10 + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("AUTORIZADO POR: (JEFE INMEDIATO)", autorizaX, currentY);
    currentY += 15;
    doc.line(autorizaX, currentY, autorizaX + signatureBoxWidth - 10, currentY);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    const fechaFirmaA = requisicionData.fecha_firma_autoriza
      ? new Date(
          requisicionData.fecha_firma_autoriza + "T00:00:00Z"
        ).toLocaleDateString("es-MX", { timeZone: "UTC" })
      : "__________";
    doc.text(
      `${requisicionData.nombre_autoriza || "________________"} ${fechaFirmaA}`,
      autorizaX,
      currentY
    );
    currentY += 5;
    doc.setFontSize(8);
    doc.text("NOMBRE, FIRMA Y FECHA", autorizaX, currentY);
    const recibeBoxHeight = 25;
    const recibeBoxWidth = 90;
    const recibeBoxX = (pageWidth - recibeBoxWidth) / 2;
    const recibeBoxY = signatureY + signatureBoxHeight + 5;
    if (recibeBoxY + recibeBoxHeight < pageHeight - margin) {
      doc.setDrawColor(180, 180, 180);
      doc.rect(recibeBoxX, recibeBoxY, recibeBoxWidth, recibeBoxHeight);
      doc.setDrawColor(0);
      currentY = recibeBoxY + 5;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("RECIBE Responsable de Compras:", recibeBoxX + 5, currentY);
      currentY += 10;
      doc.line(
        recibeBoxX + 5,
        currentY,
        recibeBoxX + recibeBoxWidth - 5,
        currentY
      );
      currentY += 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("NOMBRE, FIRMA Y FECHA", recibeBoxX + 5, currentY);
    } else {
      console.warn(
        "No hay suficiente espacio para el recuadro 'RECIBE' en esta página."
      );
    }

    return doc; // Devuelve el objeto jsPDF en lugar de guardar
  };

  // --- Función para Descargar PDF ---
  const handleDownloadPDF = (requisicionData) => {
    const doc = createPDFDocument(requisicionData); // Llama a la función base
    doc.save(`Requisicion_${requisicionData.folio || "NUEVA"}.pdf`); // Guarda el archivo
  };

  // --- NUEVA Función para Vista Previa PDF ---
  const handlePreviewPDF = (requisicionData) => {
    const doc = createPDFDocument(requisicionData); // Llama a la función base
    const blobURL = doc.output("bloburl"); // Genera una URL temporal
    window.open(blobURL, "_blank"); // Abre la URL en una nueva pestaña
  };

  // --- Renderizado ---
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Requisiciones
          </h1>
          {!showForm && (
            <button
              onClick={() => {
                setCurrentRequisicion(null);
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={18} /> Nueva Requisición
            </button>
          )}
        </div>

        {/* --- Formulario (condicional) --- */}
        {showForm && (
          // ... (Código del formulario sin cambios) ...
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-md mb-6 border dark:border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">
              {currentRequisicion ? "Editar" : "Nueva"} Requisición
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos Principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">
                    Fecha Solicitud*
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
                  <label className="block text-sm font-medium">Tipo*</label>
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
                  <label className="block text-sm font-medium">
                    Solicitante*
                  </label>
                  <input
                    type="text"
                    name="nombre_solicitante"
                    value={formData.nombre_solicitante}
                    onChange={handleInputChange}
                    required
                    className="mt-1 input-style"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Justificación*
                </label>
                <textarea
                  name="justificacion"
                  value={formData.justificacion}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="mt-1 input-style"
                ></textarea>
              </div>
              {/* Items */}
              <h3 className="text-lg font-semibold border-t pt-4 mt-4 dark:border-gray-700">
                Items Solicitados
              </h3>
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-3 rounded dark:border-gray-700"
                >
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium">#</label>
                    <input
                      type="number"
                      name="partida_num"
                      value={item.partida_num}
                      readOnly
                      className="mt-1 input-style bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">
                      Cantidad*
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="cantidad"
                      value={item.cantidad}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Unidad*</label>
                    <input
                      type="text"
                      name="unidad"
                      value={item.unidad}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium">
                      Producto/Descripción*
                    </label>
                    <input
                      type="text"
                      name="producto"
                      value={item.producto}
                      onChange={(e) => handleItemChange(index, e)}
                      required
                      className="mt-1 input-style"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400"
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
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <Plus size={16} /> Añadir Item
              </button>
              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  {currentRequisicion ? "Actualizar" : "Guardar"} Requisición
                </button>
              </div>
            </form>
            <style jsx>{`
              .input-style {
                display: block;
                width: 100%;
                padding: 0.5rem;
                border-radius: 0.375rem;
                border-width: 1px;
                border-color: #d1d5db;
                box-shadow: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                background-color: white;
                color: #1f2937;
              }
              .dark .input-style {
                background-color: #374151;
                border-color: #4b5563;
                color: #f3f4f6;
              }
              .input-style::placeholder {
                color: #9ca3af;
              }
              .dark .input-style::placeholder {
                color: #6b7280;
              }
              .input-style:focus {
                outline: 2px solid transparent;
                outline-offset: 2px;
                border-color: #4f46e5;
                box-shadow: 0 0 0 2px #c7d2fe;
              }
              .dark .input-style:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
              }
            `}</style>
          </div>
        )}

        {/* --- Tabla de Requisiciones Existentes (ACTUALIZADA CON BOTÓN PREVIEW) --- */}
        {!showForm && (
          <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <tr>
                    <th className="p-4 font-semibold uppercase tracking-wider">
                      Folio
                    </th>
                    <th className="p-4 font-semibold uppercase tracking-wider">
                      Fecha Solicitud
                    </th>
                    <th className="p-4 font-semibold uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="p-4 font-semibold uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requisiciones.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">{req.folio}</td>
                      <td className="p-4 whitespace-nowrap">
                        {new Date(
                          req.fecha_solicitud + "T00:00:00Z"
                        ).toLocaleDateString("es-MX", { timeZone: "UTC" })}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {req.tipo_requisicion}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {req.nombre_solicitante}
                      </td>
                      <td className="p-4 text-center">
                        {/* BOTONES DE ACCIÓN */}
                        <div className="flex justify-center gap-3">
                          {/* Botón Editar */}
                          <button
                            onClick={() => handleEdit(req)}
                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          {/* NUEVO Botón Vista Previa */}
                          <button
                            onClick={() => handlePreviewPDF(req)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                            title="Vista Previa PDF"
                          >
                            <Eye size={18} />
                          </button>
                          {/* Botón Descargar */}
                          <button
                            onClick={() => handleDownloadPDF(req)}
                            className="text-green-500 hover:text-green-700 dark:hover:text-green-400"
                            title="Descargar PDF"
                          >
                            <Download size={18} />
                          </button>
                          {/* Botón Eliminar */}
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requisiciones.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-4 text-center text-gray-500 dark:text-gray-400"
                      >
                        No hay requisiciones registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Requisiciones;
