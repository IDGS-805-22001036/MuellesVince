import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/CuentasPorPagar.css";
import { FaArrowLeft } from "react-icons/fa";

function CuentasPorPagar() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [cuentas, setCuentas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    monto: "",
    fecha_registro: "",
    fecha_vencimiento: "",
    descripcion: "",
    estatus: "Por pagar",
    id_proveedor: "",
    forma_pago: "",
  });

  useEffect(() => {
    obtenerCuentas();
    obtenerProveedores();
    obtenerFormasPago();
  }, []);

  const obtenerCuentas = async () => {
    try {
      const response = await api.get("/cuentas-por-pagar");
      setCuentas(response.data);
    } catch (error) {
      console.error("Error al obtener cuentas por pagar:", error);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const response = await api.get("/proveedores");
      setProveedores(response.data);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    }
  };

  const obtenerFormasPago = async () => {
    try {
      const response = await api.get("/formas-pago");
      setFormasPago(response.data);
    } catch (error) {
      console.error("Error al obtener formas de pago:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      monto: "",
      fecha_registro: "",
      fecha_vencimiento: "",
      descripcion: "",
      estatus: "Por pagar",
      id_proveedor: "",
      forma_pago: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      const payload = {
        monto: Number(formData.monto),
        fecha_registro: formData.fecha_registro,
        fecha_vencimiento: formData.fecha_vencimiento,
        descripcion: formData.descripcion,
        estatus: formData.estatus,
        id_proveedor: Number(formData.id_proveedor),
        forma_pago: Number(formData.forma_pago),
      };

      await api.post("/cuentas-por-pagar", payload);

      await obtenerCuentas();
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al guardar la cuenta por pagar:", error);
      alert("No se pudo guardar el registro.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstatus = async (id, nuevoEstatus) => {
    try {
      await api.patch(`/cuentas-por-pagar/${id}`, {
        estatus: nuevoEstatus,
      });

      setCuentas((prev) =>
        prev.map((cuenta) =>
          cuenta.id_cxp === id
            ? { ...cuenta, estatus: nuevoEstatus }
            : cuenta
        )
      );
    } catch (error) {
      console.error("Error al cambiar estatus:", error);
      alert("No se pudo actualizar el estatus.");
    }
  };

  const cuentasFiltradas = useMemo(() => {
    return cuentas
      .filter((cuenta) => cuenta.estatus?.toLowerCase() !== "pagado")
      .filter((cuenta) => {
        const proveedor = cuenta.proveedor?.nombre || "";
        const concepto = cuenta.descripcion || "";
        const monto = cuenta.monto || "";
        const estatus = cuenta.estatus || "";

        return `${proveedor} ${concepto} ${monto} ${estatus}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      });
  }, [cuentas, busqueda]);

  return (
    <div className="cxp-page">
      <div className="cxp-topbar">
        <button
          className="cxp-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
           <FaArrowLeft />
        </button>
        <h1 className="cxp-title">Cuentas por Pagar</h1>
      </div>

      <div className="cxp-actions">
        <button
          className="cxp-add-btn"
          onClick={() => setMostrarFormulario(true)}
        >
          ＋ Agregar
        </button>

        <div className="cxp-search-box">
          <span className="cxp-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="cxp-modal-overlay">
          <div className="cxp-modal">
            <div className="cxp-modal-header">
              <h2>Agregar Cuenta por Pagar</h2>
              <button
                className="cxp-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form className="cxp-form" onSubmit={handleSubmit}>
              <div className="cxp-form-grid">
                <div className="cxp-form-group">
                  <label>Proveedor</label>
                  <select
                    name="id_proveedor"
                    value={formData.id_proveedor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((p) => (
                      <option key={p.id_proveedor} value={p.id_proveedor}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cxp-form-group">
                  <label>Forma de Pago</label>
                  <select
                    name="forma_pago"
                    value={formData.forma_pago}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una forma de pago</option>
                    {formasPago.map((f) => (
                      <option key={f.id_forma_pago} value={f.id_forma_pago}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cxp-form-group">
                  <label>Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cxp-form-group">
                  <label>Estatus</label>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="Por pagar">Por pagar</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>

                <div className="cxp-form-group">
                  <label>Fecha de Registro</label>
                  <input
                    type="date"
                    name="fecha_registro"
                    value={formData.fecha_registro}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cxp-form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cxp-form-group cxp-form-group-full">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="cxp-form-actions">
                <button
                  type="button"
                  className="cxp-cancel-btn"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="cxp-save-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cxp-table-wrapper">
        <table className="cxp-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {cuentasFiltradas.length > 0 ? (
              cuentasFiltradas.map((cuenta) => (
                <tr key={cuenta.id_cxp}>
                  <td>{cuenta.proveedor?.nombre || "Sin proveedor"}</td>
                  <td>{cuenta.descripcion}</td>
                  <td>${Number(cuenta.monto).toFixed(2)}</td>
                  <td>
                    <select
                      value={cuenta.estatus}
                      onChange={(e) =>
                        cambiarEstatus(cuenta.id_cxp, e.target.value)
                      }
                      className="cxp-status-select"
                    >
                     <option value="PENDIENTE">Por pagar</option>
                     <option value="PAGADA">Pagado</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="cxp-empty">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </div>
  );
}

export default CuentasPorPagar;