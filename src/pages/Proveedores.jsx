import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Proveedores.css";
import { FaArrowLeft } from "react-icons/fa";

function Proveedores() {

  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    rfc: ""
  });

  useEffect(() => {
    obtenerProveedores();
  }, []);

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
      nombre: "",
      telefono: "",
      correo: "",
      direccion: "",
      rfc: ""
    });

    setEditando(false);
    setIdEditando(null);
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setGuardando(true);

      if (editando) {

        await api.patch(`/proveedores/${idEditando}`, formData);

      } else {

        await api.post("/proveedores", formData);

      }

      await obtenerProveedores();
      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (error) {

      console.error("Error al guardar proveedor:", error);
      alert("No se pudo guardar el proveedor");

    } finally {

      setGuardando(false);

    }

  };

  const handleEditar = (proveedor) => {

    setFormData({
      nombre: proveedor.nombre || "",
      telefono: proveedor.telefono || "",
      correo: proveedor.correo || "",
      direccion: proveedor.direccion || "",
      rfc: proveedor.rfc || ""
    });

    setIdEditando(proveedor.id_proveedor);
    setEditando(true);
    setMostrarFormulario(true);

  };

  const handleEliminar = async (id) => {

    const confirmar = window.confirm("¿Eliminar proveedor?");
    if (!confirmar) return;

    try {

      await api.delete(`/proveedores/${id}`);
      await obtenerProveedores();

    } catch (error) {

      console.error("Error al eliminar proveedor:", error);
      alert("No se pudo eliminar");

    }

  };

  const proveedoresFiltrados = useMemo(() => {

    return proveedores.filter((p) => {

      return `${p.nombre} ${p.telefono} ${p.correo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    });

  }, [proveedores, busqueda]);

  return (

    <div className="prov-page">

      <div className="prov-topbar">

        <button
          className="prov-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1>Proveedores</h1>

      </div>

      <div className="prov-actions">

        <button
          className="prov-add-btn"
          onClick={() => {
            limpiarFormulario();
            setMostrarFormulario(true);
          }}
        >
          ＋ Agregar
        </button>

        <input
          type="text"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

      </div>

      <div className="prov-table-wrapper">

        <table className="prov-table">

          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dirección</th>
              <th>RFC</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {proveedoresFiltrados.length > 0 ? (

              proveedoresFiltrados.map((p) => (

                <tr key={p.id_proveedor}>

                  <td>{p.nombre}</td>
                  <td>{p.telefono}</td>
                  <td>{p.correo}</td>
                  <td>{p.direccion}</td>
                  <td>{p.rfc}</td>

                  <td className="prov-actions-cell">

                    <button
                      className="prov-edit"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>

                    <button
                      className="prov-delete"
                      onClick={() => handleEliminar(p.id_proveedor)}
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="6" className="prov-empty">
                  No hay proveedores
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {mostrarFormulario && (

        <div className="prov-modal-overlay">

          <div className="prov-modal">

            <h2>{editando ? "Editar Proveedor" : "Nuevo Proveedor"}</h2>

            <form onSubmit={handleSubmit}>

              <input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />

              <input
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
              />

              <input
                name="correo"
                placeholder="Correo"
                value={formData.correo}
                onChange={handleChange}
              />

              <input
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
              />

              <input
                name="rfc"
                placeholder="RFC"
                value={formData.rfc}
                onChange={handleChange}
              />

              <div className="prov-form-actions">

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Proveedores;