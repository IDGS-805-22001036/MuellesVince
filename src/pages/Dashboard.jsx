import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import logo from "../img/LogoTaller-removebg-preview.png";

function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
  const username =
    location.state?.username || usuarioGuardado?.nombre || "";

  const menuItems = [
    { id: "cuentas-pagar", label: "Cuentas por Pagar" },
    { id: "cuentas-cobrar", label: "Cuentas por Cobrar" },
    { id: "ingresos", label: "Ingresos" },
    { id: "gastos", label: "Gastos" },
    { id: "facturas", label: "Facturas" },
    { id: "clientes", label: "Clientes" },
    { id: "proveedores", label: "Proveedores" },
    { id: "cotizacion", label: "Cotización" },
  ];

  const handleNav = (id) => {
    setMenuOpen(false);

    if (id === "cuentas-pagar") {
      navigate("/cuentas-por-pagar");
      return;
    }

    if (id === "cuentas-cobrar") {
      navigate("/cuentas-por-cobrar");
      return;
    }

    if (id === "ingresos") {
      navigate("/ingresos");
      return;
    }

    if (id === "gastos") {
      navigate("/gastos");
      return;
    }

    if (id === "facturas") {
      navigate("/facturas");
      return;
    }

    if (id === "clientes") {
      navigate("/clientes");
      return;
    }

    if (id === "proveedores") {
      navigate("/proveedores");
      return;
    }

    if (id === "cotizacion") {
      navigate("/cotizacion");
      return;
    }

    setActiveSection(id);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("auth");
    navigate("/", { replace: true });
  };

  return (
    <div className="db-root">
      <header className="db-header">
        <button className="db-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`db-hamburger ${menuOpen ? "open" : ""}`}>
            <span />
            <span />
            <span />
          </span>
        </button>

        <div className="db-header-right">
          <span className="db-username">Bienvenida {username}</span>
          <button className="db-logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className={`db-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="db-sidebar-header">
          <span className="db-sidebar-title">Menú</span>
          <button
            className="db-sidebar-close"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="db-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`db-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleNav(item.id)}
            >
              <span className="db-nav-dot" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {menuOpen && (
        <div className="db-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className="db-main">
        {!activeSection ? (
          <div className="db-home">
            <img src={logo} alt="Muelles Vince" className="db-home-logo" />
            <h1 className="db-home-title">Sistema de Gestión</h1>
            <p className="db-home-sub">
              Selecciona una opción del menú para comenzar
            </p>
          </div>
        ) : (
          <div className="db-section">
            <h2 className="db-section-title">
              {menuItems.find((m) => m.id === activeSection)?.label}
            </h2>
            <p className="db-section-desc">Módulo en construcción...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;