import React, { useState, useEffect } from "react"; 
import '../styles/Lista_productos.css';


const ModalAgregar = ({ onCerrar, onGuardar }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        precio: "",
        id_categoria: "",
        id_proveedor: "",
        descripcion: "",
        estado: "",
        imagen: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevoProducto = {
            ...formData,
            precio: parseFloat(formData.precio) || 0
        };

        onGuardar(nuevoProducto);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Agregar Producto</h2>

                <form onSubmit={handleSubmit}>
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

                    <label>Precio:</label>
                    <input type="number" name="precio" step="0.01" value={formData.precio} onChange={handleChange} required />

                    <label>Categoría (ID):</label>
                    <input type="text" name="id_categoria" value={formData.id_categoria} onChange={handleChange} required />

                    <label>Proveedor (ID):</label>
                    <input type="text" name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} required />

                    <label>Descripción:</label>
                    <textarea name="descripcion" rows="3" value={formData.descripcion} onChange={handleChange}></textarea>

                    <label>Estado:</label>
                    <input type="text" name="estado" value={formData.estado} onChange={handleChange} required />

                    <label>URL de Imagen:</label>
                    <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} />

                    <div className="modal-actions">
                        <button type="submit" className="btn green">Agregar</button>
                        <button type="button" onClick={onCerrar} className="btn red outline">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ModalEdicion = ({ producto, onCerrar, onGuardar }) => {
    const [formData, setFormData] = useState(producto);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const productoActualizado = {
            ...formData,
            precio: parseFloat(formData.precio) || 0
        };

        onGuardar(productoActualizado);
    };

    if (!producto) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Editar Producto: {producto.nombre}</h2>
                <form onSubmit={handleSubmit}>
                    
                    <label>ID:</label>
                    <input type="text" name="id_productos" value={formData.id_productos} disabled className="disabled-input" />

                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    
                    <label>Precio:</label>
                    <input type="number" name="precio" value={formData.precio} onChange={handleChange} step="0.01" required />
                    
                    <label>Categoría (ID):</label>
                    <input type="text" name="id_categoria" value={formData.id_categoria} onChange={handleChange} required />
                    
                    <label>Proveedor (ID):</label>
                    <input type="text" name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} required />

                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" />

                    <label>Estado:</label>
                    <input type="text" name="estado" value={formData.estado} onChange={handleChange} required />

                    <label>URL de Imagen:</label>
                    <input type="text" name="imagen" value={formData.imagen} onChange={handleChange} />
                    
                    <div className="modal-actions">
                        <button type="submit" className="btn green">Guardar Cambios</button>
                        <button type="button" onClick={onCerrar} className="btn red outline">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default function Lista_productos() {

    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productoEditando, setProductoEditando] = useState(null);
    const [modalAgregarVisible, setModalAgregarVisible] = useState(false);

    const fetchProductos = async () => {
        setLoading(true);
        setError(null);
        try {
            // 🔑 CORRECCIÓN GET: Cambiado a puerto 4000
            const response = await fetch('http://localhost:4000/api/productos');
            
            if (response.ok) {
                const data = await response.json();
                setProductos(data); 
            } else {
                const errorData = await response.json();
                setError('Error al cargar la lista: ' + (errorData.error || response.statusText));
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos();
    }, []); 

    const handleDelete = async (id) => {
        if (!window.confirm(`¿Eliminar producto ID ${id}?`)) return; 

        const idNumerico = parseInt(String(id).replace(/[^\d]/g, ''), 10);
        
        if (isNaN(idNumerico)) {
             alert('Error: ID de producto no válido para la eliminación.');
             return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/productos/${idNumerico}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProductos(productos.filter(p => p.id_productos !== id));
                alert(`Producto ${id} eliminado.`);
            } else {
                const errorData = await response.json();
                alert(`Error al eliminar: ${errorData.error || response.statusText}`);
            }
        } catch (err) {
            alert('Error de conexión.');
        }
    };

    const handleEdit = (id) => {
        const idNumerico = parseInt(String(id).replace(/[^\d]/g, ''), 10); 
        
        const productoAEditar = productos.find(p => p.id_productos === idNumerico);
        setProductoEditando(productoAEditar);
    };

    const handleCloseModal = () => {
        setProductoEditando(null);
        setModalAgregarVisible(false); 
    };

    const handleUpdateSubmit = async (productoActualizado) => {
        const idNumerico = parseInt(String(productoActualizado.id_productos).replace(/[^\d]/g, ''), 10); 
        
        if (isNaN(idNumerico)) {
             alert('Error: ID de producto no válido para la actualización.');
             return;
        }

        try {
            
            const response = await fetch(`http://localhost:4000/api/productos/${idNumerico}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoActualizado), 
            });

            if (response.ok) {
                setProductos(productos.map(p => 
                    p.id_productos === productoActualizado.id_productos ? productoActualizado : p
                ));

                handleCloseModal();
                alert(`Producto ${productoActualizado.id_productos} actualizado.`);
            } else {
                const errorData = await response.json();
                alert(`Error al actualizar: ${errorData.error || response.statusText}`);
            }
        } catch (err) {
            alert('Error de conexión.');
        }
    };

    const handleAddSubmit = async (nuevoProducto) => {
        try {
            const response = await fetch("http://localhost:4000/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoProducto)
            });

            if (response.ok) {
                alert("Producto agregado correctamente.");
                setModalAgregarVisible(false);
                fetchProductos();
            } else {
                const errorData = await response.json();
                alert("Error al agregar: " + (errorData.error || errorData.message));
            }
        } catch (err) {
            alert("Error de conexión.");
        }
    };

    return (
        <div className="entrada-page">
            <header className="top-bar">
                <div className="top-left">
                    <div className="logo-wrap">
                        <div className="logo-circle">M</div>
                        <div className="brand">Mercapleno</div>
                    </div>
                </div>
                <div className="top-right"></div>
            </header>

            <h1 className="page-title">Lista de Productos</h1>

            <main className="card-area">
                <section className="card list-card">
                    <div className="table-container">

                        {/*  BOTÓN AGREGAR */}
                        <button 
                            className="btn green" 
                            style={{ marginBottom: "15px" }} 
                            onClick={() => setModalAgregarVisible(true)}
                        >
                        Agregar Producto
                        </button>

                        {loading && <p style={{ textAlign: 'center' }}>Cargando...</p>}
                        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                        {!loading && !error && (
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Categoría</th>
                                        <th>Proveedor</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Imagen</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.length > 0 ? (
                                        productos.map((p) => (
                                            <tr key={p.id_productos}>
                                                <td>{p.id_productos}</td>
                                                <td>{p.nombre}</td>
                                                <td>${p.precio}</td>
                                                <td>{p.id_categoria}</td>
                                                <td>{p.id_proveedor}</td>
                                                <td>{p.descripcion}</td>
                                                <td>{p.estado}</td>
                                                <td className="img-cell">
                                                    <img 
                                                        src={p.imagen} 
                                                        alt={p.nombre} 
                                                        onError={(e) => {e.target.src="https://via.placeholder.com/50"}}
                                                    />
                                                </td>
                                                <td className="action-cell">
                                                    {/* Usamos el ID como se recibe de la DB para la función */}
                                                    <button onClick={() => handleDelete(p.id_productos)} className="btn small red">
                                                        Eliminar
                                                    </button>
                                                    <button onClick={() => handleEdit(p.id_productos)} className="btn small yellow">
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center' }}>No se encontraron productos.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="card-footer">
                        <button className="btn green" onClick={() => window.history.back()}>Volver</button>
                    </div>
                </section>
            </main>

            {/* MODALES */}
            {productoEditando && (
                <ModalEdicion 
                    producto={productoEditando}
                    onCerrar={handleCloseModal}
                    onGuardar={handleUpdateSubmit}
                />
            )}

            {modalAgregarVisible && (
                <ModalAgregar
                    onCerrar={handleCloseModal}
                    onGuardar={handleAddSubmit}
                />
            )}

            <footer className="site-footer">
                <div className="footer-inner">
                    <div>© 2025 Portal 2 Todos los derechos reservados.</div>
                    <div className="socials">WhatsApp · Facebook · Instagram</div>
                </div>
            </footer>
        </div>
    );
}