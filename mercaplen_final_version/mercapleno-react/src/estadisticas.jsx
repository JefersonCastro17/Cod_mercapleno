// 🟢 src/estadisticas.jsx (CORREGIDO con AuthContext)

import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom"; // ⚠️ Importar useNavigate
import { useAuthContext } from "./context/AuthContext"; // ⚠️ IMPORTAR CONTEXTO

// Registrar componentes de Chart.js
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
  const { token, logout } = useAuthContext(); // ⚠️ Obtener token y logout
  const navigate = useNavigate();
  
  const [usuarios, setUsuarios] = useState([]);
  const [rolesCount, setRolesCount] = useState({});

  useEffect(() => {
    // ⚠️ Protección de autenticación
    if (!token) {
        alert("No autorizado, por favor inicia sesión.");
        navigate("/login");
    } else {
        obtenerUsuarios();
    }
  }, [token, navigate]); // Dependencias

  const obtenerUsuarios = async () => {
    // ⚠️ Si no hay token, salir
    if (!token) return; 

    try {
      // ⚠️ Incluir el token en la petición
      const res = await fetch("http://localhost:3000/estadisticas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Manejo de token expirado o no autorizado
      if (res.status === 401 || res.status === 403) {
        alert("Sesión expirada o no autorizado.");
        logout();
        navigate("/login");
        return;
      }

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
  
  // ... (El resto de la lógica de datos y el JSX se mantienen) ...
  // ...
  
  return (
    <div className="estadisticas-container">
      {/* ... (Contenido JSX) ... */}
    </div>
  );
}