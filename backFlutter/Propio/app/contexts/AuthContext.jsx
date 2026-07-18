// src/context/AuthContext.jsx (VERSION FINAL Y SIN ADVERTENCIA ESLINT)

// NOTA: Se eliminó 'useEffect' de la importación ya que no se usa en esta versión robusta.
import React, { createContext, useState, useContext } from 'react';
import { encryptToken, decryptToken, encryptData, decryptData } from '../lib/encryption'; 

const AuthContext = createContext(null);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    // BUENA PRÁCTICA: Verificar si se usa fuera del Provider
    if (!context) {
        throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
    }
    return context;
};

// Función de limpieza para asegurar un estado inicial válido
// Se mantiene fuera del componente para que React solo la ejecute una vez.
const getInitialAuthState = () => {
    const storedEncryptedToken = localStorage.getItem('token');
    const storedEncryptedUser = localStorage.getItem('user');
    let storedToken = null;
    let storedUser = null;

    // Descifrar token si existe
    if (storedEncryptedToken) {
        try {
            storedToken = decryptToken(storedEncryptedToken);
        } catch (e) {
            console.error("Error al descifrar token de localStorage:", e);
        }
    }

    // Descifrar usuario si existe
    if (storedEncryptedUser) {
        try {
            storedUser = decryptData(storedEncryptedUser);
        } catch (e) {
            console.error("Error al descifrar usuario de localStorage:", e);
        }
    }

    // Si el usuario se almacenó en texto plano JSON, intentar parsearlo también.
    if (!storedUser && storedEncryptedUser) {
        try {
            storedUser = JSON.parse(storedEncryptedUser);
        } catch (_error) {
            // No es JSON válido en texto plano.
        }
    }

    //CLAVE: La autenticación solo es válida si AMBOS están presentes y son válidos.
    if (storedUser && storedToken) {
        return { user: storedUser, token: storedToken };
    }

    // Si falta alguno o los datos están corruptos, limpiamos el localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return { user: null, token: null };
};


export const AuthProvider = ({ children }) => {
    
    // 1. Inicialización ÚNICA y segura usando la función
    const [authState, setAuthState] = useState(getInitialAuthState);

    // 2. Estado Derivado para claridad
    const user = authState.user;
    const token = authState.token;
    const isAuthenticated = !!user && !!token;

    const normalizeUser = (userData) => {
        if (!userData || typeof userData !== 'object') return userData;
        return {
            ...userData,
            id_rol: userData.id_rol !== undefined ? Number(userData.id_rol) : userData.id_rol,
        };
    };

    // Función de LOGIN: Guarda los datos de la sesión y en localStorage (cifrados)
    const login = (userData, authToken) => {
        const normalizedUser = normalizeUser(userData);
        const normalizedToken = typeof authToken === 'string' ? authToken.trim() : authToken;

        // Guardar en el estado React
        setAuthState({ user: normalizedUser, token: normalizedToken });
        
        // Persistir en localStorage cifrados
        const encryptedToken = encryptToken(normalizedToken);
        const encryptedUser = encryptData(normalizedUser);
        
        if (encryptedToken && encryptedUser) {
            localStorage.setItem('token', encryptedToken);
            localStorage.setItem('user', encryptedUser);
            console.log('✓ Token y usuario cifrados en localStorage');
        } else {
            console.warn('⚠ No se pudieron cifrar los datos, guardando sin cifrar');
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('token', normalizedToken);
        }
    };

    // Función de LOGOUT: Limpia los datos de la sesión y en localStorage
    const logout = () => {
        // Limpiar el estado React
        setAuthState({ user: null, token: null });
        
        // Limpiar localStorage inmediatamente
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Funciones de utilidad (mejoradas para acceder a IDs correctos)
    const getUserId = () => user ? user.id_usuario || user.id || null : null; 
    const getUserEmail = () => user ? user.email : 'Anónimo';
    const getUserName = () => {
        if (!user) return 'Anónimo';
        const name = user.nombre || '';
        const lastName = user.apellido || '';
        return name.trim() + (lastName.trim() ? ' ' + lastName.trim() : '');
    };
    

    const value = {
        user,
        token,
        isAuthenticated, // Propiedad derivada
        login,
        logout,
        getUserId,
        getUserEmail,
        getUserName,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};