import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Estadisticas() {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesCount, setRolesCount] = useState({});

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3000/estadisticas");
      const data = await res.json();

      if (data.success) {
        setUsuarios(data.usuarios);

        // Contar usuarios por rol
        const count = data.usuarios.reduce((acc, u) => {
          const rol = u.nombre_rol || "Desconocido";
          acc[rol] = (acc[rol] || 0) + 1;
          return acc;
        }, {});
        setRolesCount(count);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  // Datos para gráfico de barras
  const barData = {
    labels: Object.keys(rolesCount),
    datasets: [
      {
        label: "Cantidad de usuarios por rol",
        data: Object.values(rolesCount),
        backgroundColor: ["#007bff", "#28a745", "#ffc107"],
      },
    ],
  };

  // Datos para gráfico de torta
  const pieData = {
    labels: Object.keys(rolesCount),
    datasets: [
      {
        label: "Usuarios por rol",
        data: Object.values(rolesCount),
        backgroundColor: ["#007bff", "#28a745", "#ffc107"],
      },
    ],
  };

  return (
    <div className="estadisticas-container">
      <h1>Estadísticas de Usuarios</h1>

      <div className="graficos">
        <div className="grafico">
          <h3>Usuarios por Rol (Barras)</h3>
          <Bar key={JSON.stringify(rolesCount)} data={barData} />
        </div>

        <div className="grafico">
          <h3>Usuarios por Rol (Torta)</h3>
          <Pie key={JSON.stringify(rolesCount)} data={pieData} />
        </div>

        <div className="grafico">
          <h3>Listado de Usuarios</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.apellido}</td>
                  <td>{u.email}</td>
                  <td>{u.nombre_rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
