// 🟢 src/services/reportesService.js (SIN CAMBIOS, YA ES CORRECTO)

// 💡 IMPORTANTE: Asegúrate de que authorizedFetch está exportado en productData.js
import { authorizedFetch } from './productData'; 

// La URL base para reportes (se complementa con /api/sales en productData.js)
const BASE_REPORTS_URL = "/reports"; 

/**
 * Función auxiliar para formatear dinero (puedes importarla si ya existe)
 */
const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// 1. Obtiene las ventas por mes (con filtros opcionales)
export const getVentasMes = async (inicio, fin) => {
    let endpoint = `${BASE_REPORTS_URL}/ventas-mes`;
    const params = new URLSearchParams();
    if (inicio) params.append('inicio', inicio);
    if (fin) params.append('fin', fin);
    
    if (params.toString()) {
        endpoint += `?${params.toString()}`;
    }

    const response = await authorizedFetch(endpoint, 'GET');
    return response.data || response;
};

// 2. Obtiene el top de productos
export const getTopProductos = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/top-productos`, 'GET');
    return response.data || response;
};

// 3. Obtiene el resumen general (KPIs)
export const getResumen = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/resumen`, 'GET');
    return response.data || response;
};

// 4. Obtiene el resumen por mes (tabla)
export const getResumenMes = async () => {
    const response = await authorizedFetch(`${BASE_REPORTS_URL}/resumen-mes`, 'GET');
    return response.data || response;
};

// 5. Función para obtener la URL de descarga del PDF
export const getPDFUrl = () => {
    // 💡 Debe coincidir con el puerto y la ruta base del backend
    // Nota: Esto asume que el backend tiene la ruta /api/sales/reports/pdf-resumen
    return `http://localhost:4000/api/sales${BASE_REPORTS_URL}/pdf-resumen`;
};

// Exportamos la función de formato si se necesita fuera del servicio
export { formatPrice };