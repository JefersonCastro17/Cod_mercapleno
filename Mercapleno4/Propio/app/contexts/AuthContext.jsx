// src/context/AuthContext.jsx (VERSION FINAL Y SIN ADVERTENCIA ESLINT)

// NOTA: Se eliminó 'useEffect' de la importación ya que no se usa en esta versión robusta.
import React, { createContext, useState, useContext } from 'react'; 

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
    const storedToken = localStorage.getItem('token');
    const storedUserJson = localStorage.getItem('user');
    let storedUser = null;

    try {
        if (storedUserJson) {
            storedUser = JSON.parse(storedUserJson);
        }
    } catch (e) {
        console.error("Error al parsear usuario de localStorage:", e);
        // El usuario está corrupto, lo trataremos como no autenticado
    }

    //CLAVE: La autenticación solo es válida si AMBOS están presentes y son válidos.
    if (storedUser && storedToken) {
        return { user: storedUser, token: storedToken };
    }

    // Si falta alguno o el usuario estaba corrupto, limpiamos el localStorage
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

    // Función de LOGIN: Guarda los datos de la sesión y en localStorage
    const login = (userData, authToken) => {
        // Guardar en el estado React
        setAuthState({ user: userData, token: authToken });
        
        // Persistir en localStorage inmediatamente
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
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