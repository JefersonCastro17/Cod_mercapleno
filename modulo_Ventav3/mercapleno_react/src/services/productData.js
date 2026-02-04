// src/services/productData.js

const API_BASE_URL = 'http://localhost:4000/api';

// Función ASÍNCRONA para obtener los productos desde el API
export const getProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            console.error(`Error al cargar productos: Status ${response.status}`);
            return []; // Devolver un array vacío en caso de error
        }

        const data = await response.json();
        return data; // Esto devuelve el array de productos de tu BD
    } catch (error) {
        console.error("Error de red o servidor no disponible:", error);
        return []; // Devolver un array vacío si falla la conexión
    }
};

// Función ASÍNCRONA para enviar la orden de compra al API
export const sendOrder = async (orderData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData), // orderData contiene items y total
        });

        if (!response.ok) {
            // Intenta leer el detalle del error del servidor
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

// Formato de moneda
export const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0 
    }).format(price);
};