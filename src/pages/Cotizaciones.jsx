import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import api from "../services/api";
import "../styles/Cotizaciones.css";

function Cotizaciones() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [cotizaciones, setCotizaciones] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const estadoInicial = {
    nombre_cliente: "",
    telefono: "",
    correo: "",
    direccion: "",
    rfc: "",
    fecha: new Date().toISOString().split("T")[0],
    notas: "",
    ivaPorcentaje: 16,
    detalles: [
      {
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
      },
    ],
  };

  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    obtenerCotizaciones();
  }, []);

  const obtenerCotizaciones = async () => {
    try {
      const res = await api.get("/cotizaciones");
      setCotizaciones(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener cotizaciones:", error);
      setCotizaciones([]);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      ...estadoInicial,
      fecha: new Date().toISOString().split("T")[0],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "ivaPorcentaje" ? Number(value) : value,
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    nuevosDetalles[index][field] =
      field === "cantidad" || field === "precio_unitario"
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      detalles: nuevosDetalles,
    }));
  };

  const agregarDetalle = () => {
    setFormData((prev) => ({
      ...prev,
      detalles: [
        ...prev.detalles,
        {
          descripcion: "",
          cantidad: 1,
          precio_unitario: 0,
        },
      ],
    }));
  };

  const eliminarDetalle = (index) => {
    if (formData.detalles.length === 1) return;

    const nuevosDetalles = formData.detalles.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      detalles: nuevosDetalles,
    }));
  };

  const subtotal = useMemo(() => {
    return formData.detalles.reduce((acc, item) => {
      const cantidad = Number(item.cantidad) || 0;
      const precio = Number(item.precio_unitario) || 0;
      return acc + cantidad * precio;
    }, 0);
  }, [formData.detalles]);

  const iva = useMemo(() => {
    return subtotal * ((Number(formData.ivaPorcentaje) || 0) / 100);
  }, [subtotal, formData.ivaPorcentaje]);

  const total = useMemo(() => subtotal + iva, [subtotal, iva]);

  const validarFormulario = () => {
    if (!formData.nombre_cliente.trim()) {
      alert("Ingresa el nombre del cliente.");
      return false;
    }

    const detallesValidos = formData.detalles.every(
      (item) =>
        item.descripcion.trim() &&
        Number(item.cantidad) > 0 &&
        Number(item.precio_unitario) >= 0
    );

    if (!detallesValidos) {
      alert("Revisa las partidas de la cotización.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setGuardando(true);

      const payload = {
        ...formData,
        detalles: formData.detalles.map((item) => ({
          descripcion: item.descripcion.trim(),
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precio_unitario),
        })),
      };

      const res = await api.post("/cotizaciones", payload);
      const id = res.data?.id_cotizacion;

      await obtenerCotizaciones();
      setMostrarFormulario(false);
      limpiarFormulario();

      if (id) {
        const baseURL = api.defaults.baseURL || "http://localhost:3000";
        const origin = new URL(baseURL).origin;
        window.open(`${origin}/cotizaciones/${id}/pdf`, "_blank");
      }

      alert("Cotización generada correctamente.");
    } catch (error) {
      console.error("Error al generar cotización:", error);
      alert("No se pudo generar la cotización.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta cotización?");
    if (!confirmar) return;

    try {
      await api.delete(`/cotizaciones/${id}`);
      await obtenerCotizaciones();
    } catch (error) {
      console.error("Error al eliminar cotización:", error);
      alert("No se pudo eliminar la cotización.");
    }
  };

  const obtenerUrlPdf = (id) => {
    const baseURL = api.defaults.baseURL || "http://localhost:3000";
    const origin = new URL(baseURL).origin;
    return `${origin}/cotizaciones/${id}/pdf`;
  };

  const cotizacionesFiltradas = useMemo(() => {
    if (!Array.isArray(cotizaciones)) return [];

    return cotizaciones.filter((cotizacion) => {
      const folio = cotizacion.folio || "";
      const cliente = cotizacion.nombre_cliente || "";
      const telefono = cotizacion.telefono || "";
      const fecha = cotizacion.fecha || "";
      const totalTexto = String(cotizacion.total || "");

      return `${folio} ${cliente} ${telefono} ${fecha} ${totalTexto}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    });
  }, [cotizaciones, busqueda]);

  return (
    <div className="cot-page">
      <div className="cot-topbar">
        <button
          className="cot-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1 className="cot-title">Cotizaciones</h1>
      </div>

      <div className="cot-actions">
        <button
          className="cot-add-btn"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
        >
          ＋ Agregar
        </button>

        <div className="cot-search-box">
          <span className="cot-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar cotización..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="cot-modal-overlay">
          <div className="cot-modal cot-modal-xl">
            <div className="cot-modal-header">
              <h2>Generar Cotización</h2>

              <button
                className="cot-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form className="cot-form" onSubmit={handleSubmit}>
              <div className="cot-form-card">
                <h3 className="cot-section-title">Datos del cliente</h3>

                <div className="cot-form-grid">
                  <div className="cot-form-group">
                    <label>Nombre del cliente</label>
                    <input
                      type="text"
                      name="nombre_cliente"
                      value={formData.nombre_cliente}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="cot-form-group">
                    <label>Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cot-form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cot-form-group">
                    <label>Correo</label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cot-form-group">
                    <label>RFC</label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="cot-form-group">
                    <label>IVA (%)</label>
                    <input
                      type="number"
                      name="ivaPorcentaje"
                      value={formData.ivaPorcentaje}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="cot-form-group cot-form-group-full">
                    <label>Dirección</label>
                    <textarea
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className="cot-form-group cot-form-group-full">
                    <label>Notas</label>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="cot-form-card">
                <div className="cot-items-header">
                  <h3 className="cot-section-title">Partidas</h3>

                  <button
                    type="button"
                    className="cot-add-item-btn"
                    onClick={agregarDetalle}
                  >
                    <FaPlus /> Agregar partida
                  </button>
                </div>

                <div className="cot-items-table">
                  <div className="cot-items-head">
                    <span>Descripción</span>
                    <span>Cantidad</span>
                    <span>P. Unitario</span>
                    <span>Importe</span>
                    <span>Acción</span>
                  </div>

                  {formData.detalles.map((item, index) => {
                    const importe =
                      (Number(item.cantidad) || 0) *
                      (Number(item.precio_unitario) || 0);

                    return (
                      <div className="cot-items-row" key={index}>
                        <input
                          type="text"
                          placeholder="Descripción del producto o servicio"
                          value={item.descripcion}
                          onChange={(e) =>
                            handleDetalleChange(index, "descripcion", e.target.value)
                          }
                        />

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.cantidad}
                          onChange={(e) =>
                            handleDetalleChange(index, "cantidad", e.target.value)
                          }
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={(e) =>
                            handleDetalleChange(index, "precio_unitario", e.target.value)
                          }
                        />

                        <div className="cot-importe">
                          ${importe.toFixed(2)}
                        </div>

                        <button
                          type="button"
                          className="cot-delete-item-btn"
                          onClick={() => eliminarDetalle(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="cot-summary-card">
                <div className="cot-summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>

                <div className="cot-summary-row">
                  <span>IVA</span>
                  <strong>${iva.toFixed(2)}</strong>
                </div>

                <div className="cot-summary-row cot-total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <div className="cot-form-actions">
                  <button
                    type="button"
                    className="cot-cancel-btn"
                    onClick={() => {
                      setMostrarFormulario(false);
                      limpiarFormulario();
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="cot-save-btn"
                    disabled={guardando}
                  >
                    {guardando ? "Generando..." : "Generar cotización"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cot-table-wrapper">
        <table className="cot-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>PDF</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cotizacionesFiltradas.length > 0 ? (
              cotizacionesFiltradas.map((cotizacion) => (
                <tr key={cotizacion.id_cotizacion}>
                  <td>{cotizacion.id_cotizacion}</td>
                  <td>{cotizacion.folio || "-"}</td>
                  <td>{cotizacion.nombre_cliente || "-"}</td>
                  <td>{cotizacion.telefono || "-"}</td>
                  <td>
                    {cotizacion.fecha
                      ? new Date(cotizacion.fecha).toLocaleDateString()
                      : "Sin fecha"}
                  </td>
                  <td>${Number(cotizacion.total || 0).toFixed(2)}</td>
                  <td>
                    <a
                      href={obtenerUrlPdf(cotizacion.id_cotizacion)}
                      target="_blank"
                      rel="noreferrer"
                      className="cot-view-btn"
                    >
                      Ver PDF
                    </a>
                  </td>
                  <td>
                    <div className="cot-actions-cell">
                      <button
                        className="cot-delete-btn"
                        onClick={() => handleEliminar(cotizacion.id_cotizacion)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="cot-empty">
                  No se encontraron cotizaciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Cotizaciones;