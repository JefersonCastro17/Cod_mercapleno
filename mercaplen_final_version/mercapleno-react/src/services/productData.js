//  src/services/productData.js (CORRECCIÓN FINAL Y COMPLETA)

//  La URL incluye '/api/sales' para coincidir con el servidor Express (salesRouter).
const BASE_URL = "http://localhost:4000/api/sales"; 

// ---------------------- UTILS ----------------------

export const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};


//  FUNCIÓN CLAVE CORREGIDA: Exportada y propaga el estado HTTP del error
export const authorizedFetch = async (endpoint, method = 'GET', body = null) => { // ⬅ CORRECCIÓN: Se añadió 'export'
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    };
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            
            // 🛑 CORRECCIÓN DE AUTENTICACIÓN: Manejamos 401 y 403 y propagamos el status
            if (response.status === 401 || response.status === 403) {
                const authError = new Error("Token inválido o requerido. Redirigir a Login.");
                authError.status = response.status; // ⬅️ CLAVE: PROPAGAR EL STATUS
                throw authError; 
            }

            // Manejo de otros errores (400, 500, etc.)
            const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.status}` }));
            console.error(`Error en la API ${endpoint}:`, errorData.message || errorData.error);

            // Lanza el mensaje específico del error (incluyendo el status)
            const specificError = new Error(errorData.message || errorData.error || `Error en la solicitud: ${response.status}`);
            specificError.status = response.status;
            throw specificError;
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return {};
        }

        const data = await response.json();
        return data;

    } catch (error) {
        throw error; 
    }
};

// ---------------------- PRODUCTS / CATEGORIES ----------------------

export const getProducts = async (nombre, categoria, precioMin, precioMax) => {
    const params = new URLSearchParams();
    
    //  CORRECCIÓN CLAVE: Mapear las claves del Frontend (español) a las claves del Backend (inglés/camelCase)
    if (nombre) params.append('search', nombre);             // 'nombre' del Front -> 'search' del Back
    if (categoria && categoria !== 'todas') params.append('category', categoria); // 'categoria' del Front -> 'category' del Back
    
    // Estos nombres sí coinciden:
    if (precioMin) params.append('precioMin', precioMin);
    if (precioMax) params.append('precioMax', precioMax);

    const endpoint = `/products?${params.toString()}`;

    const result = await authorizedFetch(endpoint);
    return result.products || result.data || result;
};


export const getCategories = async () => {
    const result = await authorizedFetch('/categories');

    return result.categories || result.data || result;
};


// ---------------------- ORDERS ----------------------

/**
 * Envía la orden de compra al servidor.
 * @param {object} orderData - Debe contener { items: [{id, cantidad}], total, id_metodo }
 */
export const sendOrder = async (orderData) => {
    //  CORRECCIÓN DE ROBUSTEZ: Asegurar que el total tenga máxima precisión (2 decimales) para la DB.
    const sanitizedOrderData = {
        ...orderData,
        // Usamos toFixed(2) para asegurar 2 decimales y luego parseFloat para mantenerlo como número
        total: parseFloat(orderData.total.toFixed(2)) 
    };

    //  CORRECCIÓN FINAL: Se restablece '/orders' ya que el backend espera /api/sales/orders
    return authorizedFetch('/orders', 'POST', sanitizedOrderData);
};


// ---------------------- MÉTODO DE PAGO DINÁMICO (Opcional, si aplicaste la Opción 2) ----------------------

/**
 * Obtiene la lista dinámica de métodos de pago desde el backend.
 * Nota: Asume que el endpoint es /api/sales/payment-methods
 * Esto es un ejemplo, ajusta el endpoint si es necesario.
 */
// export async function fetchPaymentMethods() {
//     try {
//         // Asumiendo un endpoint como /api/sales/payment-methods
//         return authorizedFetch('/payment-methods'); 
//     } catch (error) {
//         console.error("Error al obtener métodos de pago:", error);
//         return [];
//     }
// }