import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./estadisticas.css";

const API = "http://localhost:3000/reportes";

export default function Estadisticas() {
  const [ventasMes, setVentasMes] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [resumen, setResumen] = useState({
    dinero_total: 0,
    total_ventas: 0,
    promedio: 0,
  });
  const [resumenMes, setResumenMes] = useState([]);

  // Filtros
  const [mesInicio, setMesInicio] = useState("");
  const [mesFin, setMesFin] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    axios.get(`${API}/ventas-mes`).then(r => setVentasMes(r.data));
    axios.get(`${API}/top-productos`).then(r => setTopProductos(r.data));
    axios.get(`${API}/resumen`).then(r => setResumen(r.data));
    axios.get(`${API}/resumen-mes`).then(r => setResumenMes(r.data));
  };

  const filtrarPorMes = () => {
    axios
      .get(`${API}/ventas-mes?inicio=${mesInicio}&fin=${mesFin}`)
      .then(r => setVentasMes(r.data));
  };

  return (
    <div className="dashboard">
      {/* MENÚ */}
      <div className="menu">
        <h1>Supermercado • Reportes</h1>
      </div>

      {/* FILTROS */}
      <div className="filtros">
        <div>
          <label>Mes inicio</label>
          <input type="month" value={mesInicio} onChange={e => setMesInicio(e.target.value)} />
        </div>

        <div>
          <label>Mes fin</label>
          <input type="month" value={mesFin} onChange={e => setMesFin(e.target.value)} />
        </div>

        <button onClick={filtrarPorMes}>Filtrar</button>
        <button onClick={cargarDatos}>Limpiar</button>
      </div>

      {/* KPIs */}
      <div className="kpis">
        <div className="kpi">
          <h3>Ingresos Totales</h3>
          <span>${resumen.dinero_total}</span>
        </div>
        <div className="kpi">
          <h3>Total Ventas</h3>
          <span>{resumen.total_ventas}</span>
        </div>
        <div className="kpi">
          <h3>Promedio</h3>
          <span>${Math.round(resumen.promedio)}</span>
        </div>
      </div>

      {/* BOTÓN PDF */}
      <a className="btn-pdf" href="http://localhost:3000/reportes/pdf-resumen">
        Descargar PDF
      </a>

      {/* GRÁFICAS */}
      <div className="graficos">
        <div className="card">
          <h2>Ventas por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasMes}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Line dataKey="total" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2>Productos más vendidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProductos}>
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#facc15" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA */}
      <div className="card">
        <h2>Resumen Mensual</h2>
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ventas</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {resumenMes.map((m, i) => (
              <tr key={i}>
                <td>{m.mes}</td>
                <td>{m.cantidad_ventas}</td>
                <td>${m.total_mes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
