import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Clientes.css";
import { FaArrowLeft } from "react-icons/fa";

function Clientes() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
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
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await api.get("/clientes");
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      setClientes([]);
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
        await api.patch(`/clientes/${idEditando}`, formData);
      } else {
        await api.post("/clientes", formData);
      }

      await obtenerClientes();
      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("No se pudo guardar el cliente");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (cliente) => {
    setFormData({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
      rfc: cliente.rfc || ""
    });

    setIdEditando(cliente.id_cliente);
    setEditando(true);
    setMostrarFormulario(true);
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm("¿Eliminar cliente?");
    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${id}`);
      await obtenerClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("No se pudo eliminar");
    }
  };

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      return `${c.nombre} ${c.telefono} ${c.correo}`
        .toLowerCase()
        .includes(busqueda.toLowerCase());
    });
  }, [clientes, busqueda]);

  return (
    <div className="cli-page">

      <div className="cli-topbar">
        <button
          className="cli-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
        </button>

        <h1>Clientes</h1>
      </div>

      <div className="cli-actions">

        <button
          className="cli-add-btn"
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

      <div className="cli-table-wrapper">

        <table className="cli-table">

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

            {clientesFiltrados.length > 0 ? (

              clientesFiltrados.map((c) => (

                <tr key={c.id_cliente}>

                  <td>{c.nombre}</td>
                  <td>{c.telefono}</td>
                  <td>{c.correo}</td>
                  <td>{c.direccion}</td>
                  <td>{c.rfc}</td>

                  <td className="cli-actions-cell">

                    <button
                      className="cli-edit"
                      onClick={() => handleEditar(c)}
                    >
                      Editar
                    </button>

                    <button
                      className="cli-delete"
                      onClick={() => handleEliminar(c.id_cliente)}
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="6" className="cli-empty">
                  No hay clientes
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {mostrarFormulario && (

        <div className="cli-modal-overlay">

          <div className="cli-modal">

            <h2>{editando ? "Editar Cliente" : "Nuevo Cliente"}</h2>

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

              <div className="cli-form-actions">

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

export default Clientes;