//  src/pages/AdminDashboard.jsx (MODIFICADO para navegación de Inventario por Rol)

import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Importa estilos base para la consistencia
import "../styles/base.css";

function AdminDashboard() {
    // Obtener datos del usuario logueado
    const { user, logout } = useAuthContext(); 
    const navigate = useNavigate();

    // Función auxiliar para mostrar el nombre del rol (Se mantiene)
    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1:
                return "Administrador";
            case 2:
                return "Empleado";
            default:
                return "Usuario Restringido";
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // 🔑 FUNCIÓN CLAVE: Navegación de Inventario basada en el Rol
    const handleNavigateInventory = () => {
        if (!user || !user.id_rol) {
            alert('Error: Datos de usuario no disponibles.');
            return;
        }

        if (user.id_rol === 1) {
            // Administrador -> CRUD Completo
            navigate('/products/admin'); 
        } else if (user.id_rol === 2) {
            // Empleado -> Solo Lectura
            navigate('/products/employee'); 
        } else {
            alert('Acceso no permitido para este rol.');
        }
    };

    // FUNCIÓN PARA NAVEGAR A GESTIÓN DE USUARIOS (Solo Rol 1)
    const handleNavigateUsers = () => {
        navigate('/admin/users');
    };

    // FUNCIÓN PARA NAVEGAR A REPORTES (Roles 1 y 2)
    const handleNavigateReports = () => {
        navigate('/estadisticas');
    };


    return (
        <div className="admin-dashboard-container">
            <div className="welcome-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h1>Bienvenido, {user.nombre}</h1>
                    <span className="role-tag role-admin">
                        Rol: {getRoleName(user.id_rol)}
                    </span>
                </div>
                <p>Este es el panel de control principal para los roles gerenciales y operativos.</p>

                <div className="dashboard-modules" style={{ 
                    marginTop: '30px', 
                    display: 'flex', 
                    gap: '20px', 
                    flexWrap: 'wrap' 
                }}>
                    {/* Botón de Inventario (usa la nueva lógica) */}
                    <button className="boton-nav" onClick={handleNavigateInventory}>
                        📈 Gestión de Inventario
                    </button>
                    
                    {/* Botón de Usuarios (Solo Admin) */}
                    {(user.id_rol === 1) && (
                        <button className="boton-nav" onClick={handleNavigateUsers}>
                            👥 Gestión de Usuarios
                        </button> 
                    )}
                    
                    {/* 🔑 BOTÓN DE REPORTES */}
                    <button className="boton-nav" onClick={handleNavigateReports}>
                        📊 Reportes de Ventas
                    </button>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="boton-nav"
                    style={{ 
                        marginTop: '40px', 
                        backgroundColor: '#dc3545', 
                        borderColor: '#dc3545' 
                    }}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;