import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { API_URL } from "../services/api";
import "../App.css";
import logo from "../img/LogoTaller-removebg-preview.png";

function Login() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!user.trim() || !pass.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("API URL:", import.meta.env.VITE_API_URL);
      console.log("AXIOS BASE URL:", api.defaults.baseURL);

      const res = await api.post(API_URL + "/auth/login", {
        correo: user.trim(),
        password: pass.trim(),
      });

      const token = res.data?.access_token;
      const usuario = res.data?.usuario;

      if (!token) {
        setError("No se recibió el token de acceso.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      navigate("/dashboard", {
        replace: true,
        state: {
          username: usuario?.nombre || user,
        },
      });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      const mensaje = err?.response?.data?.message;

      if (Array.isArray(mensaje)) {
        setError(mensaje.join(" "));
      } else {
        setError(mensaje || "Correo o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="mv-root">
      <div className="mv-bg">
        <div className="gear gear-1" />
        <div className="gear gear-2" />
        <div className="gear gear-3" />
      </div>

      <div className="mv-left">
        <div className="mv-logo-area">
          <img src={logo} alt="Muelles Vince Logo" className="mv-logo-img" />
          <div className="mv-logo-text">
            <span className="mv-brand-welcome">Bienvenido</span>
            <span className="mv-brand-sub">Muelles Vince</span>
          </div>
        </div>

        <div className="mv-divider" />
      </div>

      <div className="mv-right">
        <div className="mv-form-wrap">
          <div className="mv-welcome">Bienvenido de vuelta</div>
          <div className="mv-form-title">Iniciar Sesión</div>
          <div className="mv-form-desc">
            Ingresa tus credenciales para continuar
          </div>

          <div className="mv-field">
            <label className="mv-label">Usuario</label>
            <input
              className="mv-input"
              type="email"
              placeholder="tu@correo.com"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="mv-field">
            <label className="mv-label">Contraseña</label>
            <input
              className="mv-input"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {error && <div className="mv-error">{error}</div>}

          <span className="mv-forgot">¿Olvidaste tu contraseña?</span>

          <button
            className={`mv-btn${loading ? " loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            <span className="mv-btn-shine" />
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>

          <div className="mv-footer">
            © {new Date().getFullYear()} Muelles Vince — Sistema Interno
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;