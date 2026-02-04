// 🟢 src/utils/authorizedFetch.js

import { useAuthContext } from '../context/AuthContext';

/**
 * Función que envuelve a fetch() y añade automáticamente el header de Autorización
 * usando el token del AuthContext.
 * * @param {string} url - La URL del endpoint de la API.
 * @param {object} options - Opciones estándar de fetch (method, body, headers, etc.).
 * @returns {Promise<Response>} La respuesta del fetch.
 */
export const useAuthorizedFetch = () => {
    const { token, logout } = useAuthContext();

    const authorizedFetch = async (url, options = {}) => {
        if (!token) {
            // Si no hay token, no podemos hacer peticiones protegidas.
            // Esto podría indicar que el usuario intentó acceder a una página protegida directamente.
            console.error("No token available for authorized fetch.");
            // Opcional: podrías forzar un logout/redirección aquí si lo consideras crítico.
            // logout(); 
            // throw new Error("Acceso no autorizado. Token faltante.");
        }

        const headers = {
            ...options.headers,
            // 🔑 CLAVE: Añadir el token al encabezado de la solicitud
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(url, { ...options, headers });

        // Opcional: Manejo de errores 401/403 (Token inválido o expirado)
        if (response.status === 401 || response.status === 403) {
            console.error("Error de autorización (401/403). Forzando cierre de sesión.");
            // Esto asegura que el usuario sea desconectado si el token ha expirado.
            logout(); 
        }

        return response;
    };

    return authorizedFetch;
};