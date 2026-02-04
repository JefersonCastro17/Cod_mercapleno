// src/services/productData.js

const API_BASE_URL = 'http://localhost:4000/api';

// NUEVA FUNCIÓN: Obtener categorías disponibles desde el API
export const getCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);

        if (!response.ok) {
            console.error(`Error al cargar categorías: Status ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error de red o servidor no disponible al obtener categorías:", error);
        return [];
    }
};

// FUNCIÓN MODIFICADA: Obtener los productos desde el API, ahora con filtros
export const getProducts = async (searchTerm = '', categoryFilter = 'todas', minPrice = '', maxPrice = '') => {
    try {
        // Construimos los parámetros de la URL de forma segura
        const params = new URLSearchParams();
        
        if (searchTerm) params.append('search', searchTerm);
        // Enviamos la categoría SOLO si no es 'todas'
        if (categoryFilter && categoryFilter !== 'todas') params.append('category', categoryFilter);
        if (minPrice) params.append('precioMin', minPrice);
        if (maxPrice) params.append('precioMax', maxPrice);

        const url = `${API_BASE_URL}/products?${params.toString()}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error al cargar productos: Status ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error de red o servidor no disponible:", error);
        return [];
    }
};

// Función ASÍNCRONA para enviar la orden de compra al API (Mantenida)
export const sendOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData), 
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error(`Error al enviar la orden: Status ${response.status}`, errorDetails);
            return { success: false, message: errorDetails.error || "Fallo en el servidor" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Error de red al enviar la orden:", error);
        return { success: false, message: "Error de conexión con el servidor." };
    }
};

// Formato de moneda (Mantenido)
export const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0 
    }).format(price);
};