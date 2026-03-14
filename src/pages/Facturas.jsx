import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../services/api";
import "../styles/Facturas.css";

function Facturas() {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [facturas, setFacturas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);

  const [formData, setFormData] = useState({
    tipo: "INGRESO",
    pdf: null,
  });

  useEffect(() => {
    obtenerFacturas();
  }, []);

  const obtenerFacturas = async () => {
    try {
      const res = await api.get("/facturas");
      setFacturas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      setFacturas([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "pdf") {
      setFormData((prev) => ({
        ...prev,
        pdf: files && files[0] ? files[0] : null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const limpiarFormulario = () => {
    setFormData({
      tipo: "INGRESO",
      pdf: null,
    });
    setEditando(false);
    setIdEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);

      const form = new FormData();
      form.append("tipo", formData.tipo);

      if (formData.pdf) {
        form.append("pdf", formData.pdf);
      }

      if (editando && idEditando) {
        await api.patch(`/facturas/${idEditando}`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        if (!formData.pdf) {
          alert("Debes seleccionar un archivo PDF.");
          setGuardando(false);
          return;
        }

        await api.post("/facturas", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await obtenerFacturas();
      limpiarFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error al guardar factura:", error);
      alert("No se pudo guardar la factura.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (factura) => {
    setFormData({
      tipo: factura.tipo || "INGRESO",
      pdf: null,
    });

    setIdEditando(factura.id_factura);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Deseas eliminar esta factura?");
    if (!confirmar) return;

    try {
      await api.delete(`/facturas/${id}`);
      await obtenerFacturas();
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      alert("No se pudo eliminar la factura.");
    }
  };

  const obtenerNombreArchivo = (factura) => {
    return factura?.nombre_pdf || "Sin archivo";
  };

  const obtenerUrlPdf = (id) => {
    if (!id) return "#";

    const baseURL = api.defaults.baseURL || "http://localhost:3000";
    const origin = new URL(baseURL).origin;

    return `${origin}/facturas/${id}/pdf`;
  };

  const facturasFiltradas = useMemo(() => {
    if (!Array.isArray(facturas)) return [];

    return facturas.filter((factura) => {
      const tipo = factura.tipo || "";
      const nombre = factura.nombre_pdf || "";
      const fecha = factura.fecha || "";

      return `${tipo} ${nombre} ${fecha}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    });
  }, [facturas, busqueda]);

  return (
    <div className="fac-page">
      <div className="fac-topbar">
        <button
          className="fac-menu-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1 className="fac-title">Facturas</h1>
      </div>

      <div className="fac-actions">
        <button
          className="fac-add-btn"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
        >
          ＋ Agregar
        </button>

        <div className="fac-search-box">
          <span className="fac-search-icon">⌕</span>

          <input
            type="text"
            placeholder="Buscar factura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <div className="fac-modal-overlay">
          <div className="fac-modal">
            <div className="fac-modal-header">
              <h2>{editando ? "Editar Factura" : "Agregar Factura"}</h2>

              <button
                className="fac-close-btn"
                onClick={() => {
                  setMostrarFormulario(false);
                  limpiarFormulario();
                }}
              >
                ✕
              </button>
            </div>

            <form className="fac-form" onSubmit={handleSubmit}>
              <div className="fac-form-grid">
                <div className="fac-form-group">
                  <label>Tipo</label>

                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    <option value="INGRESO">INGRESO</option>
                    <option value="GASTO">GASTO</option>
                  </select>
                </div>

                <div className="fac-form-group">
                  <label>Archivo PDF</label>

                  <input
                    type="file"
                    name="pdf"
                    accept="application/pdf"
                    onChange={handleChange}
                    required={!editando}
                  />
                </div>

                {editando && (
                  <div className="fac-form-group fac-form-group-full">
                    <small className="fac-file-note">
                      Si no seleccionas un nuevo PDF, se conservará el archivo actual.
                    </small>
                  </div>
                )}
              </div>

              <div className="fac-form-actions">
                <button
                  type="button"
                  className="fac-cancel-btn"
                  onClick={() => {
                    setMostrarFormulario(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="fac-save-btn"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : editando ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="fac-table-wrapper">
        <table className="fac-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Archivo</th>
              <th>Fecha</th>
              <th>PDF</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {facturasFiltradas.length > 0 ? (
              facturasFiltradas.map((factura) => (
                <tr key={factura.id_factura}>
                  <td>{factura.id_factura}</td>
                  <td>
                    <span
                      className={
                        factura.tipo === "INGRESO"
                          ? "fac-badge fac-badge-ingreso"
                          : "fac-badge fac-badge-gasto"
                      }
                    >
                      {factura.tipo}
                    </span>
                  </td>
                  <td>{obtenerNombreArchivo(factura)}</td>
                  <td>
                    {factura.fecha
                      ? new Date(factura.fecha).toLocaleString()
                      : "Sin fecha"}
                  </td>
                  <td>
                    <a
                      href={obtenerUrlPdf(factura.id_factura)}
                      target="_blank"
                      rel="noreferrer"
                      className="fac-view-btn"
                    >
                      Ver PDF
                    </a>
                  </td>
                  <td>
                    <div className="fac-actions-cell">
                      <button
                        className="fac-edit-btn"
                        onClick={() => handleEditar(factura)}
                      >
                        Editar
                      </button>

                      <button
                        className="fac-delete-btn"
                        onClick={() => handleEliminar(factura.id_factura)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="fac-empty">
                  No se encontraron facturas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Facturas;