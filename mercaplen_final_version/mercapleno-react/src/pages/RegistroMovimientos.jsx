// mercapleno-react/src/pages/RegistroMovimientos.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react"; 
import { useAuthContext } from "../context/AuthContext";
import { formatPrice } from "../services/productData"; // Para mostrar precios
import { useNavigate } from "react-router-dom"; 
import "../styles/Lista_productos.css"; // Reutilizar estilos de tabla/CRUD para la UI

// ===========================================
// COMPONENTE MODAL DE REGISTRO DE MOVIMIENTO
// ===========================================
const ModalMovimiento = ({ producto, onCerrar, onGuardar }) => {
    const [cantidad, setCantidad] = useState("");
    const [tipo, setTipo] = useState("ENTRADA");
    const [documento, setDocumento] = useState("");
    const [comentario, setComentario] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        
        const numCantidad = parseInt(cantidad, 10);

        if (isNaN(numCantidad) || numCantidad <= 0) {
            setError("La cantidad debe ser un número positivo.");
            return;
        }

        // Lógica de validación de stock para SALIDA
        if (tipo === 'SALIDA' && numCantidad > producto.stock) {
            setError(`Stock insuficiente. Disponible: ${producto.stock}.`);
            return;
        }

        if (!documento.trim()) {
            setError("Debe especificar un número/código de documento.");
            return;
        }

        onGuardar({
            id_producto: producto.id,
            tipo_movimiento: tipo,
            cantidad: numCantidad,
            id_documento: documento.trim(),
            comentario: comentario.trim()
        });
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{maxWidth: '600px'}}>
                <header className="modal-header">
                    <h2>Registrar {tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} - {producto.nombre}</h2>
                    <button onClick={onCerrar} className="close-modal-btn">X</button>
                </header>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Tipo de Movimiento</label>
                            <select value={tipo} onChange={(e) => {setTipo(e.target.value); setError(null);}} className="input" required>
                                <option value="ENTRADA">Entrada / Recepción de Mercancía</option>
                                <option value="SALIDA">Salida / Ajuste Negativo (Daños, Desperdicio)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Cantidad</label>
                            <input 
                                type="number" 
                                value={cantidad} 
                                onChange={(e) => {setCantidad(e.target.value); setError(null);}} 
                                className="input"
                                min="1"
                                required 
                            />
                            <small className="help-text" style={{ fontWeight: 'bold' }}>
                                Stock Actual: <span style={{ color: producto.stock > 10 ? 'green' : producto.stock > 0 ? 'orange' : 'red' }}>{producto.stock}</span>
                            </small>
                        </div>
                        
                        <div className="form-group">
                            <label>Doc. de Referencia (Ej: Factura #, Acta #)</label>
                            <input 
                                type="text" 
                                value={documento} 
                                onChange={(e) => setDocumento(e.target.value)} 
                                className="input"
                                required 
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Comentario (Motivo del Movimiento)</label>
                            <textarea 
                                value={comentario} 
                                onChange={(e) => setComentario(e.target.value)} 
                                className="input"
                                rows="2"
                            />
                        </div>

                    </div>
                    {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    <footer className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                        <button type="submit" className={`btn ${tipo === 'ENTRADA' ? 'btn-primary' : 'btn-danger'}`}>
                            Registrar {tipo}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};


// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================
export default function RegistroMovimientos() {
    const { token, logout } = useAuthContext();
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [toast, setToast] = useState(null);
    
    // Función para manejar peticiones autenticadas al módulo de movimientos
    const authorizedFetch = useCallback(async (endpoint, method = 'GET', body = null) => {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        const options = {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        };
        
        try {
            // RUTA BASE: http://localhost:4000/api/movimientos + endpoint
            const response = await fetch(`http://localhost:4000/api/movimientos${endpoint}`, options); 

            if (response.status === 401 || response.status === 403) {
                console.error("Error de autorización. Forzando logout.");
                logout(); 
                navigate('/login');
                throw new Error("No autorizado");
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || "Error en la operación de API.");
            }
            return data;

        } catch (err) {
            console.error("Error en authorizedFetch:", err);
            throw err;
        }
    }, [token, logout, navigate]);


    // Cargar lista de productos con stock al iniciar
    const fetchProductos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Endpoint del nuevo router: /api/movimientos/productos
            const data = await authorizedFetch("/productos", 'GET');
            setProductos(data); 
        } catch (err) {
            setError('Error al cargar la lista de productos: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [authorizedFetch]);

    useEffect(() => {
        if (token) {
            fetchProductos();
        }
    }, [token, fetchProductos]);
    
    // Función para mostrar toast de notificaciones
    const mostrarToast = (mensaje, tipo = "success") => {
        setToast({ mensaje, tipo });
        setTimeout(() => setToast(null), 3000);
    };

    // Manejar el envío del formulario de movimiento
    const handleGuardarMovimiento = async (movimientoData) => {
        setProductoSeleccionado(null); 
        setLoading(true); 

        try {
            // Endpoint para registrar: /api/movimientos/registrar
            const result = await authorizedFetch("/registrar", 'POST', movimientoData);
            
            mostrarToast(result.message || "Movimiento registrado correctamente.", "success");
            fetchProductos(); // Recargar la lista para reflejar el nuevo stock

        } catch (err) {
            const errorMessage = err.message.includes("No autorizado") ? "Sesión expirada. Inicie sesión de nuevo." : err.message;
            setError('Fallo al registrar el movimiento: ' + errorMessage);
            mostrarToast('Error: ' + errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar productos en el frontend
    const productosFiltrados = useMemo(() => {
        const lowerCaseFiltro = filtroNombre.toLowerCase();
        if (!lowerCaseFiltro) {
            return productos;
        }
        return productos.filter(p => 
            p.nombre.toLowerCase().includes(lowerCaseFiltro) ||
            p.categoria.toLowerCase().includes(lowerCaseFiltro) ||
            p.id.toString().includes(lowerCaseFiltro)
        );
    }, [productos, filtroNombre]);


    // RENDERIZADO
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Registro de Inventario (Entradas y Salidas)</h1>
                <p>Módulo para que los empleados registren ajustes de inventario, recepciones o pérdidas.</p>
                <button className="btn green" onClick={() => navigate('/usuarioC')}>
                    Volver al Dashboard
                </button>
            </header>

            <main className="dashboard-content">
                <section className="card full-width">
                    <header className="card-header">
                        <h2>Lista de Productos y Stock</h2>
                        {/* Barra de búsqueda */}
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Buscar producto, ID o categoría..."
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                className="input"
                            />
                        </div>
                    </header>
                    
                    <div className="card-body table-responsive">
                        {loading ? (
                            <p style={{ textAlign: 'center' }}>Cargando productos...</p>
                        ) : error ? (
                             <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Imagen</th>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Precio Venta</th>
                                        <th>Stock Actual</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosFiltrados.length > 0 ? ( 
                                        productosFiltrados.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>
                                                    <img 
                                                        src={p.imagen || "https://via.placeholder.com/50"} 
                                                        alt={p.nombre} 
                                                        onError={(e) => {e.target.src="https://via.placeholder.com/50"}}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                </td>
                                                <td>{p.nombre}</td>
                                                <td>{p.categoria}</td>
                                                <td>{formatPrice(p.precio)}</td>
                                                <td style={{ fontWeight: 'bold', color: p.stock > 10 ? 'green' : p.stock > 0 ? 'orange' : 'red' }}>
                                                    {p.stock}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => setProductoSeleccionado(p)}
                                                    >
                                                        Registrar Movimiento
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center' }}>No se encontraron productos.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </main>

            {/* MODAL DE REGISTRO */}
            {productoSeleccionado && (
                <ModalMovimiento 
                    producto={productoSeleccionado}
                    onCerrar={() => setProductoSeleccionado(null)}
                    onGuardar={handleGuardarMovimiento}
                />
            )}
            
            {/* Toast de notificaciones (Se mantiene el estilo para compatibilidad) */}
            {toast && (
                <div className={`toast-notification ${toast.tipo}`} style={{
                    position: 'fixed', bottom: '20px', right: '20px', padding: '10px 20px', 
                    borderRadius: '8px', backgroundColor: toast.tipo === 'success' ? '#198754' : '#dc3545', 
                    color: 'white', zIndex: 1000
                }}>
                    {toast.mensaje}
                </div>
            )}
        </div>
    );
}