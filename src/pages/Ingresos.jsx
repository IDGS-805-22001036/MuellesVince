import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Ingresos.css";
import { FaArrowLeft } from "react-icons/fa";

function Ingresos() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [ingresos, setIngresos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    concepto: "",
    monto: "",
    id_cliente: ""
  });

  useEffect(() => {
    obtenerIngresos();
    obtenerClientes();
  }, []);

  const obtenerIngresos = async () => {
    try {
      const res = await api.get("/ingresos");
      setIngresos(res.data);
    } catch (error) {
      console.error("Error al obtener ingresos:", error);
    }
  };

  const obtenerClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      fecha: "",
      concepto: "",
      monto: "",
      id_cliente: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      const payload = {
        fecha: formData.fecha,
        concepto: formData.concepto,
        monto: Number(formData.monto),
        id_cliente: Number(formData.id_cliente)
      };

      await api.post("/ingresos", payload);

      await obtenerIngresos();
      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (error) {
      console.error("Error al guardar ingreso:", error);
      alert("No se pudo guardar el ingreso.");
    } finally {
      setGuardando(false);
    }
  };

  const ingresosFiltrados = useMemo(() => {
    return ingresos.filter((ingreso) => {
      const cliente = ingreso.cliente?.nombre || "";
      const concepto = ingreso.concepto || "";
      const monto = ingreso.monto || "";

      return `${cliente} ${concepto} ${monto}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    });
  }, [ingresos, busqueda]);

  return (
    <div className="ing-page">

      <div className="ing-topbar">
        <button
          className="ing-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1 className="ing-title">
          Ingresos
        </h1>
      </div>

      <div className="ing-actions">

        <button
          className="ing-add-btn"
          onClick={() => setMostrarFormulario(true)}
        >
          ＋ Agregar
        </button>

        <div className="ing-search-box">
          <span className="ing-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

      </div>

      {mostrarFormulario && (
        <div className="ing-modal-overlay">

          <div className="ing-modal">

            <div className="ing-modal-header">
              <h2>Agregar Ingreso</h2>

              <button
                className="ing-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>

            </div>

            <form className="ing-form" onSubmit={handleSubmit}>

              <div className="ing-form-grid">

                <div className="ing-form-group">
                  <label>Cliente</label>

                  <select
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un cliente</option>

                    {clientes.map((c) => (
                      <option
                        key={c.id_cliente}
                        value={c.id_cliente}
                      >
                        {c.nombre}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="ing-form-group">
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

                <div className="ing-form-group">
                  <label>Fecha</label>

                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ing-form-group ing-form-group-full">
                  <label>Concepto</label>

                  <textarea
                    name="concepto"
                    value={formData.concepto}
                    onChange={handleChange}
                    rows="3"
                    required
                  />

                </div>

              </div>

              <div className="ing-form-actions">

                <button
                  type="button"
                  className="ing-cancel-btn"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="ing-save-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      <div className="ing-table-wrapper">

        <table className="ing-table">

          <thead>
            <tr>
              <th>Cliente</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>

          <tbody>

            {ingresosFiltrados.length > 0 ? (

              ingresosFiltrados.map((ingreso) => (

                <tr key={ingreso.id_movimiento}>

                  <td>{ingreso.cliente?.nombre || "Sin cliente"}</td>

                  <td>{ingreso.concepto}</td>

                  <td>
                    ${Number(ingreso.monto).toFixed(2)}
                  </td>

                  <td>{ingreso.fecha}</td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="4" className="ing-empty">
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

export default Ingresos;