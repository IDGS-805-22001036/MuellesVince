import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Gastos.css";
import { FaArrowLeft } from "react-icons/fa";

function Gastos() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [formData, setFormData] = useState({
    fecha: "",
    concepto: "",
    monto: "",
    id_proveedor: ""
  });

  useEffect(() => {
    obtenerGastos();
    obtenerProveedores();
  }, []);

  const obtenerGastos = async () => {
    try {
      const res = await api.get("/gastos");
      setGastos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      setGastos([]);
    }
  };

  const obtenerProveedores = async () => {
    try {
      const res = await api.get("/proveedores");
      setProveedores(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      setProveedores([]);
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
      id_proveedor: ""
    });
    setEditando(false);
    setIdEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      const payload = {
        fecha: formData.fecha,
        concepto: formData.concepto,
        monto: Number(formData.monto),
        id_proveedor: formData.id_proveedor ? Number(formData.id_proveedor) : undefined
      };

      if (editando && idEditando) {
        await api.patch(`/gastos/${idEditando}`, payload);
      } else {
        await api.post("/gastos", payload);
      }

      await obtenerGastos();
      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (error) {
      console.error("Error al guardar gasto:", error);
      alert("No se pudo guardar el gasto.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (gasto) => {
    setFormData({
      fecha: gasto.fecha || "",
      concepto: gasto.concepto || "",
      monto: gasto.monto || "",
      id_proveedor: gasto.proveedor?.id_proveedor
        ? String(gasto.proveedor.id_proveedor)
        : ""
    });

    setIdEditando(gasto.id_movimiento);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar este gasto?");
    if (!confirmar) return;

    try {
      await api.delete(`/gastos/${id}`);
      await obtenerGastos();
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      alert("No se pudo eliminar el gasto.");
    }
  };

  const gastosFiltrados = useMemo(() => {
    if (!Array.isArray(gastos)) return [];

    return gastos.filter((gasto) => {
      const proveedor = gasto.proveedor?.nombre || "";
      const concepto = gasto.concepto || "";
      const monto = gasto.monto || "";

      return `${proveedor} ${concepto} ${monto}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    });
  }, [gastos, busqueda]);

  return (
    <div className="gas-page">
      <div className="gas-topbar">
        <button
          className="gas-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1 className="gas-title">Gastos</h1>
      </div>

      <div className="gas-actions">
        <button
          className="gas-add-btn"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
        >
          ＋ Agregar
        </button>

        <div className="gas-search-box">
          <span className="gas-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="gas-modal-overlay">
          <div className="gas-modal">
            <div className="gas-modal-header">
              <h2>{editando ? "Editar Gasto" : "Agregar Gasto"}</h2>

              <button
                className="gas-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form className="gas-form" onSubmit={handleSubmit}>
              <div className="gas-form-grid">
                <div className="gas-form-group">
                  <label>Proveedor</label>

                  <select
                    name="id_proveedor"
                    value={formData.id_proveedor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un proveedor</option>

                    {proveedores.map((p) => (
                      <option
                        key={p.id_proveedor}
                        value={p.id_proveedor}
                      >
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="gas-form-group">
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

                <div className="gas-form-group">
                  <label>Fecha</label>

                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="gas-form-group gas-form-group-full">
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

              <div className="gas-form-actions">
                <button
                  type="button"
                  className="gas-cancel-btn"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="gas-save-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="gas-table-wrapper">
        <table className="gas-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {gastosFiltrados.length > 0 ? (
              gastosFiltrados.map((gasto) => (
                <tr key={gasto.id_movimiento}>
                  <td>{gasto.proveedor?.nombre || "Sin proveedor"}</td>
                  <td>{gasto.concepto}</td>
                  <td>${Number(gasto.monto).toFixed(2)}</td>
                  <td>{gasto.fecha}</td>
                  <td>
                    <div className="gas-actions-cell">
                      <button
                        className="gas-edit-btn"
                        onClick={() => handleEditar(gasto)}
                      >
                        Editar
                      </button>

                      <button
                        className="gas-delete-btn"
                        onClick={() => handleEliminar(gasto.id_movimiento)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="gas-empty">
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

export default Gastos;