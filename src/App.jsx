import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CuentasPorPagar from "./pages/CuentasPorPagar";
import CuentasPorCobrar from "./pages/CuentasPorCobrar";
import Ingresos from "./pages/Ingresos";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import Gastos from "./pages/Gastos";
import Facturas from "./pages/Facturas";
import Cotizaciones from "./pages/Cotizaciones";
import RutaProtegida from "./components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<RutaProtegida />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cuentas-por-pagar" element={<CuentasPorPagar />} />
          <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/cotizacion" element={<Cotizaciones />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;