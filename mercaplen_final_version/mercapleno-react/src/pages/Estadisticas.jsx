// 🟢 Estadisticas.jsx (VERSIÓN FINAL Y COMPLETA)

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import {
LineChart,Line,BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer
} from "recharts";
import "../styles/estadisticas.css";
import {
getVentasMes,
getTopProductos,
getResumen,
getResumenMes,
getPDFUrl,
formatPrice
} from "../services/reportesService";
// import { logout } from '../context/AuthContext'; // Ejemplo

export default function Estadisticas(){
const navigate = useNavigate(); 

const [ventasMes,setVentasMes]=useState([]);
const [topProductos,setTopProductos]=useState([]);
const [resumen,setResumen]=useState({dinero_total:0,total_ventas:0,promedio:0});
const [resumenMes,setResumenMes]=useState([]);
const [loading,setLoading]=useState(true);
const [mesInicio,setMesInicio]=useState("");
const [mesFin,setMesFin]=useState("");

const cargarDatos=useCallback(async()=>{
setLoading(true);
try{
    const [rVentasMes,rTopProductos,rResumen,rResumenMes]=await Promise.all([
    getVentasMes(mesInicio,mesFin),
    getTopProductos(),
    getResumen(),
    getResumenMes()
    ]);
    
    // 1. Limpieza de KPIs
    const resumenLimpio = {
        total_ventas: Number(rResumen.total_ventas) || 0,
        dinero_total: Number(rResumen.dinero_total) || 0,
        promedio: Number(rResumen.promedio) || 0
    };

    // 2. Limpieza de Resumen Mensual (Corrige el $0 en la tabla)
    const resumenMesLimpio = rResumenMes.map(item => ({
        ...item,
        total_mes: Number(item.total_mes) || 0
    }));

    // 3. Limpieza de Ventas por Mes (Necesaria para la gráfica)
    const ventasMesLimpio = rVentasMes.map(item => ({
        ...item,
        total: Number(item.total) || 0
    }));

    setVentasMes(ventasMesLimpio); // <-- Cambio aquí
    setTopProductos(rTopProductos);
    setResumen(resumenLimpio); 
    setResumenMes(resumenMesLimpio); 
    
}catch(error){
    console.error("Error al cargar reportes:",error);

    // LÓGICA DE MANEJO DE ERROR DE AUTENTICACIÓN
    if (error.status === 401 || error.status === 403) {
        alert("Sesión expirada o no autorizada. Redirigiendo al Login.");
        // logout(); 
        navigate('/login', { replace: true }); // Redirigir al login
    } else {
        alert("Error al cargar los datos de reportes. Verifique la conexión.");
    }
}finally{
    setLoading(false);
}
},[mesInicio,mesFin,navigate]); 

useEffect(()=>{cargarDatos();},[cargarDatos]);

return(
<div className="dashboard">
<header className="menu"><h1>Dashboard de Reportes y Estadísticas</h1></header>

<div className="filtros">
<div>
<label htmlFor="mesInicio">Desde (YYYY-MM):</label>
<input type="month" id="mesInicio" value={mesInicio} onChange={e=>setMesInicio(e.target.value)}/>
</div>
<div>
<label htmlFor="mesFin">Hasta (YYYY-MM):</label>
<input type="month" id="mesFin" value={mesFin} onChange={e=>setMesFin(e.target.value)}/>
</div>
<button onClick={()=>{setMesInicio("");setMesFin("");}} className="btn-limpiar">
Limpiar Filtros
</button>
</div>

{loading?(
<p style={{textAlign:"center",margin:"50px"}}>Cargando reportes...</p>
):(
<>
<div className="kpis">
<div className="kpi"><h3>Dinero Total Vendido</h3><span>{formatPrice(resumen.dinero_total)}</span></div>
<div className="kpi"><h3>Total de Ventas</h3><span>{resumen.total_ventas}</span></div>
<div className="kpi"><h3>Ticket Promedio</h3><span>{formatPrice(resumen.promedio)}</span></div>
</div>

<a href={getPDFUrl()} target="_blank" rel="noopener noreferrer" className="btn-pdf">
⬇️ Descargar Reporte PDF
</a>

<div className="graficos">
<div className="card">
<h2>Ventas por Mes</h2>
<ResponsiveContainer width="100%" height={300}>
<LineChart data={ventasMes}>
<XAxis dataKey="mes"/>
<YAxis tickFormatter={v=>formatPrice(v).replace("$","")}/>
{/* 🔑 CORRECCIÓN FINAL DEL TOOLTIP: Accede a 'total' usando props.payload */}
<Tooltip 
    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
    labelFormatter={(label) => `Mes: ${label}`}
    formatter={(value, name, props) => [formatPrice(props.payload.total), "Total"]} 
/>
<Line dataKey="total" stroke="#2563eb" strokeWidth={3}/>
</LineChart>
</ResponsiveContainer>
</div>

<div className="card">
<h2>Productos más vendidos</h2>
<ResponsiveContainer width="100%" height={300}>
<BarChart data={topProductos}>
<XAxis dataKey="nombre"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="total_vendido" fill="#facc15"/> 
</BarChart>
</ResponsiveContainer>
</div>
</div>

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
{resumenMes.map((m,i)=>(
<tr key={i}>
<td>{m.mes}</td>
<td>{m.cantidad_ventas}</td>
<td>{formatPrice(m.total_mes)}</td>
</tr>
))}
</tbody>
</table>
</div>
</>
)}
</div>
);
}