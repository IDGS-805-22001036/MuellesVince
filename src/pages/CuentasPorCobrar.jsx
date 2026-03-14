import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/CuentasPorCobrar.css";
import { FaArrowLeft } from "react-icons/fa";

function CuentasPorCobrar() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [cuentas, setCuentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [formasPago, setFormasPago] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    monto: "",
    fecha_registro: "",
    fecha_vencimiento: "",
    descripcion: "",
    estatus: "Por pagar",
    id_cliente: "",
    forma_pago: "",
  });

  useEffect(() => {
    obtenerCuentas();
    obtenerClientes();
    obtenerFormasPago();
  }, []);

  const obtenerCuentas = async () => {
    try {
      const response = await api.get("/cuentas-por-cobrar");
      setCuentas(response.data);
    } catch (error) {
      console.error("Error al obtener cuentas por cobrar:", error);
    }
  };

  const obtenerClientes = async () => {
    try {
      const response = await api.get("/clientes");
      setClientes(response.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
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
      id_cliente: "",
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
        id_cliente: Number(formData.id_cliente),
        forma_pago: Number(formData.forma_pago),
      };

      await api.post("/cuentas-por-cobrar", payload);

      await obtenerCuentas();
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al guardar la cuenta por cobrar:", error);
      alert("No se pudo guardar el registro.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstatus = async (id, nuevoEstatus) => {
    try {
      await api.patch(`/cuentas-por-cobrar/${id}`, {
        estatus: nuevoEstatus,
      });

      setCuentas((prev) =>
        prev.map((cuenta) =>
          cuenta.id_cxc === id
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
        const cliente = cuenta.cliente?.nombre || "";
        const concepto = cuenta.descripcion || "";
        const monto = cuenta.monto || "";
        const estatus = cuenta.estatus || "";

        return `${cliente} ${concepto} ${monto} ${estatus}`
          .toLowerCase()
          .includes(busqueda.toLowerCase());
      });
  }, [cuentas, busqueda]);

  return (
    <div className="cxc-page">
      <div className="cxc-topbar">
        <button
          className="cxc-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>
        <h1 className="cxc-title">Cuentas por Cobrar</h1>
      </div>

      <div className="cxc-actions">
        <button
          className="cxc-add-btn"
          onClick={() => setMostrarFormulario(true)}
        >
          ＋ Agregar
        </button>

        <div className="cxc-search-box">
          <span className="cxc-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="cxc-modal-overlay">
          <div className="cxc-modal">
            <div className="cxc-modal-header">
              <h2>Agregar Cuenta por Cobrar</h2>
              <button
                className="cxc-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form className="cxc-form" onSubmit={handleSubmit}>
              <div className="cxc-form-grid">
                <div className="cxc-form-group">
                  <label>Cliente</label>
                  <select
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cxc-form-group">
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

                <div className="cxc-form-group">
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

                <div className="cxc-form-group">
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

                <div className="cxc-form-group">
                  <label>Fecha de Registro</label>
                  <input
                    type="date"
                    name="fecha_registro"
                    value={formData.fecha_registro}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cxc-form-group">
                  <label>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cxc-form-group cxc-form-group-full">
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

              <div className="cxc-form-actions">
                <button
                  type="button"
                  className="cxc-cancel-btn"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="cxc-save-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cxc-table-wrapper">
        <table className="cxc-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {cuentasFiltradas.length > 0 ? (
              cuentasFiltradas.map((cuenta) => (
                <tr key={cuenta.id_cxc}>
                  <td>{cuenta.cliente?.nombre || "Sin cliente"}</td>
                  <td>{cuenta.descripcion}</td>
                  <td>${Number(cuenta.monto).toFixed(2)}</td>
                  <td>
                    <select
                      value={cuenta.estatus}
                      onChange={(e) =>
                        cambiarEstatus(cuenta.id_cxc, e.target.value)
                      }
                      className="cxc-status-select"
                    >
                      <option value="Por pagar">Por pagar</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="cxc-empty">
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

export default CuentasPorCobrar;