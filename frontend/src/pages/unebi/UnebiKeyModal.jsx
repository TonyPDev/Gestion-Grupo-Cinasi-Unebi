import React, { useState, useEffect } from "react";
import api from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { X } from "lucide-react";

const UnebiKeyModal = ({
  isOpen,
  onClose,
  unebiKey,
  userRole,
  focusedField,
}) => {
  const { username } = useAuth();
  const [formData, setFormData] = useState({});
  const [otherTipoEstudio, setOtherTipoEstudio] = useState("");

  useEffect(() => {
    const initialData = {
      elaborador: "",
      tipo_estudio: "",
      patrocinador: "",
      principio_activo: "",
      condicion: "",
      orden_servicio: "",
      fecha_solicitud: null,
      fecha_cofepris: null,
      clave_asignada: "",
      status: "",
      tipo_proyecto: "Nuevo Proyecto",
      comentarios: "",
      llave_pago_cofepris: "",
      no_cofepris: "",
      fecha_pago_ip: null,
      fecha_pago_comite: null,
      fecha: null,
      observaciones: "",
      historial: "",
      segmento_contable: "",
      diseno: "2x2",
      tamano_muestras: "",
    };

    if (unebiKey) {
      setFormData(unebiKey);
      const tipoEstudioOptions = [
        "Estudio",
        "Biodisponibilidad comparativa",
        "Fase l",
        "Otro",
      ];
      if (!tipoEstudioOptions.includes(unebiKey.tipo_estudio)) {
        setFormData((prev) => ({ ...prev, tipo_estudio: "Otro" }));
        setOtherTipoEstudio(unebiKey.tipo_estudio);
      }
    } else {
      setFormData(initialData);
    }
  }, [unebiKey, isOpen]);

  useEffect(() => {
    if (isOpen && focusedField) {
      setTimeout(() => {
        const fieldToFocus = document.querySelector(`[name="${focusedField}"]`);
        if (fieldToFocus) {
          fieldToFocus.focus();
          if (fieldToFocus.select) {
            fieldToFocus.select();
          }
        }
      }, 100);
    }
  }, [isOpen, focusedField]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let dataToSend = new FormData();
    const finalData = {
      ...formData,
      tipo_estudio:
        formData.tipo_estudio === "Otro"
          ? otherTipoEstudio
          : formData.tipo_estudio,
    };

    for (const key in finalData) {
      if (key === "historial") continue;
    }

    const apiCall = unebiKey
      ? api.patch(`/api/unebi/unebikeys/${unebiKey.id}/`, dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      : api.post("/api/unebi/unebikeys/", dataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

    apiCall
      .then(() => {
        alert(
          `¡Clave UNEBI ${unebiKey ? "actualizada" : "creada"} exitosamente!`
        );
        onClose();
      })
      .catch((err) => alert(`Error: ${JSON.stringify(err.response.data)}`));
  };

  const isFieldDisabled = (fieldName) => {
    const comercialFields = [
      "elaborador",
      "tipo_estudio",
      "principio_activo",
      "fecha_solicitud",
      "tipo_proyecto",
      "comentarios",
      "orden_servicio",
      "patrocinador",
      "observaciones",
      "segmento_contable",
      "fecha",
    ];
    const clinicaFields = [
      "condicion",
      "clave_asignada",
      "fecha_cofepris",
      "status",
      "llave_pago_cofepris",
      "no_cofepris",
      "observaciones",
      "diseno",
      "tamano_muestras",
    ];
    const administracionFields = [
      "no_cofepris",
      "fecha_cofepris",
      "llave_pago_cofepris",
      "fecha_pago_ip",
      "fecha_pago_comite",
      "segmento_contable",
    ];
    if (userRole.includes("ADMIN")) return false;

    if (!unebiKey) {
      if (userRole.includes("COMERCIAL")) {
        return !comercialFields.includes(fieldName);
      }
      return true;
    }

    let isDisabled = true;
    if (userRole.includes("COMERCIAL") && comercialFields.includes(fieldName))
      isDisabled = false;
    if (userRole.includes("CLINICA") && clinicaFields.includes(fieldName))
      isDisabled = false;
    if (
      userRole.includes("ADMINISTRACION") &&
      administracionFields.includes(fieldName)
    )
      isDisabled = false;

    return isDisabled;
  };

  if (!isOpen) return null;

  const inputClass =
    "mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-md dark:bg-gray-700 dark:border-gray-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-200 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full md:w-3/4 lg:w-2/3 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {unebiKey ? "Editar" : "Crear"} Clave UNEBI
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-md font-medium">Elaborador</label>
              <input
                type="text"
                name="elaborador"
                value={formData.elaborador || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("elaborador")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Tipo de Estudio
              </label>
              <select
                name="tipo_estudio"
                value={formData.tipo_estudio || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("tipo_estudio")}
                className={inputClass}
              >
                <option>Estudio</option>
                <option>Biodisponibilidad comparativa</option>
                <option>Fase l</option>
                <option>Otro</option>
              </select>
              {formData.tipo_estudio === "Otro" && (
                <input
                  type="text"
                  placeholder="Especificar otro"
                  value={otherTipoEstudio}
                  onChange={(e) => setOtherTipoEstudio(e.target.value)}
                  disabled={isFieldDisabled("tipo_estudio")}
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            <div>
              <label className="block text-md font-medium">Patrocinador</label>
              <input
                type="text"
                name="patrocinador"
                value={formData.patrocinador || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("patrocinador")}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-md font-medium">
                Principio activo/Dosis/Consideración de uso
              </label>
              <textarea
                name="principio_activo"
                value={formData.principio_activo || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("principio_activo")}
                rows="3"
                className={inputClass}
              ></textarea>
            </div>

            <div>
              <label className="block text-md font-medium">Condición</label>
              <select
                name="condicion"
                value={formData.condicion || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("condicion")}
                className={inputClass}
              >
                <option>Ayuno</option>
                <option>Alimentos</option>
              </select>
            </div>

            <div>
              <label className="block text-md font-medium">
                Orden de servicio
              </label>
              <input
                type="text"
                name="orden_servicio"
                value={formData.orden_servicio || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("orden_servicio")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Fecha de Solicitud
              </label>
              <input
                type="date"
                name="fecha_solicitud"
                value={formData.fecha_solicitud || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("fecha_solicitud")}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-md font-medium">
                Fecha Cofepris
              </label>
              <input
                type="date"
                name="fecha_cofepris"
                value={formData.fecha_cofepris || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("fecha_cofepris")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Clave Asignada
              </label>
              <input
                type="text"
                name="clave_asignada"
                value={formData.clave_asignada || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("clave_asignada")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">Status</label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("status")}
                className={inputClass}
              >
                <option>Escritura</option>
                <option>Revisión interna</option>
                <option>Revisión Patrocinador</option>
                <option>Por someter a comités</option>
                <option>Evaluación de Comités</option>
                <option>Cofepris</option>
              </select>
            </div>

            <div>
              <label className="block text-md font-medium">
                Tipo de Proyecto
              </label>
              <select
                name="tipo_proyecto"
                value={formData.tipo_proyecto || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("tipo_proyecto")}
                className={inputClass}
              >
                <option>Nuevo Proyecto</option>
                <option>Otra clínica</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-md font-medium">Comentarios</label>
              <textarea
                name="comentarios"
                value={formData.comentarios || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("comentarios")}
                rows="3"
                className={inputClass}
              ></textarea>
            </div>

            <div>
              <label className="block text-md font-medium">
                Llave de pago de Cofepris
              </label>
              <input
                type="text"
                name="llave_pago_cofepris"
                value={formData.llave_pago_cofepris || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("llave_pago_cofepris")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">No. Cofepris</label>
              <input
                type="text"
                name="no_cofepris"
                value={formData.no_cofepris || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("no_cofepris")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Fecha de Pago IP
              </label>
              <input
                type="date"
                name="fecha_pago_ip"
                value={formData.fecha_pago_ip || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("fecha_pago_ip")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Fecha de pago Comité
              </label>
              <input
                type="date"
                name="fecha_pago_comite"
                value={formData.fecha_pago_comite || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("fecha_pago_comite")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("fecha")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">
                Segmento contable
              </label>
              <input
                type="text"
                name="segmento_contable"
                value={formData.segmento_contable || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("segmento_contable")}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-md font-medium">Diseño</label>
              <select
                name="diseno"
                value={formData.diseno || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("diseno")}
                className={inputClass}
              >
                <option>2x2</option>
                <option>2x3</option>
              </select>
            </div>

            <div>
              <label className="block text-md font-medium">
                Tamaño de muestras
              </label>
              <input
                type="text"
                name="tamano_muestras"
                value={formData.tamano_muestras || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("tamano_muestras")}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-md font-medium">Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones || ""}
                onChange={handleChange}
                disabled={isFieldDisabled("observaciones")}
                rows="3"
                className={inputClass}
              ></textarea>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-md font-medium">Historial</label>
              <textarea
                name="historial"
                value={formData.historial || ""}
                readOnly
                rows="5"
                className={`${inputClass} bg-gray-100 dark:bg-gray-900`}
              ></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnebiKeyModal;
