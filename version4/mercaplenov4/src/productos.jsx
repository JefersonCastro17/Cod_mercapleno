import { useEffect, useState } from "react";
import axios from "axios";
import "./productos.css";

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });

  const fetchProductos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/productos");
      setProductos(res.data.productos);
    } catch (error) {
      console.error(error.response?.data || error);
      setMensaje({ text: "Error al cargar productos ❌", type: "error" });
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const actualizarStock = async (id, stock) => {
    if (stock < 0) return;
    try {
      await axios.put(`http://localhost:3000/productos/stock/${id}`, { stock });
      setMensaje({ text: "Stock actualizado ✅", type: "success" });
      fetchProductos();
      setTimeout(() => setMensaje({ text: "", type: "" }), 2500);
    } catch (error) {
      console.error(error.response?.data || error);
      setMensaje({ text: "Error al actualizar stock ❌", type: "error" });
    }
  };

  const guardarEdicion = async () => {
    if (!productoEditar) return;
    try {
      await axios.put(`http://localhost:3000/productos/editar/${productoEditar.id_productos}`, productoEditar);
      setMensaje({ text: "Producto editado ✅", type: "success" });
      setModalVisible(false);
      fetchProductos();
      setTimeout(() => setMensaje({ text: "", type: "" }), 2500);
    } catch (error) {
      console.error(error.response?.data || error);
      setMensaje({ text: "Error al editar producto ❌", type: "error" });
    }
  };

  const eliminarProducto = async (producto) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${producto.nombre}"?`)) return;
    try {
      await axios.delete(`http://localhost:3000/productos/eliminar/${producto.id_productos}`);
      setMensaje({ text: `Producto "${producto.nombre}" eliminado ✅`, type: "success" });
      fetchProductos();
      setTimeout(() => setMensaje({ text: "", type: "" }), 2500);
    } catch (error) {
      console.error(error.response?.data || error);
      setMensaje({ text: "Error al eliminar producto ❌", type: "error" });
    }
  };

  const abrirModalEditar = (producto) => { setProductoEditar({ ...producto }); setModalVisible(true); };
  const cerrarModal = () => { setModalVisible(false); setProductoEditar(null); };
  const cambiarStock = (p, cantidad) => actualizarStock(p.id_productos, Math.max(p.stock + cantidad, 0));

  return (
    <div className="app-container">
      <main className="main-content">
        <h2>Catálogo de Productos</h2>
        {mensaje.text && <div className={mensaje.type === "success" ? "alert-success" : "alert-error"}>{mensaje.text}</div>}
        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>Categoría</th><th>Stock</th><th>Editar Stock</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id_productos}>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{p.stock || 0}</td>
                <td>
                  <button onClick={() => cambiarStock(p, -1)}>-</button>
                  <input type="number" value={p.stock || 0} onChange={(e) => {
                    setProductos(productos.map(pr => pr.id_productos === p.id_productos ? {...pr, stock: parseInt(e.target.value)} : pr));
                  }} onBlur={(e) => actualizarStock(p.id_productos, parseInt(e.target.value))} />
                  <button onClick={() => cambiarStock(p, 1)}>+</button>
                </td>
                <td>{p.estado}</td>
                <td>
                  <button onClick={() => abrirModalEditar(p)}>Editar</button>
                  <button onClick={() => eliminarProducto(p)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {modalVisible && productoEditar && (
          <div className="modal">
            <h3>Editar Producto</h3>
            <input value={productoEditar.nombre} onChange={e => setProductoEditar({...productoEditar, nombre: e.target.value})} />
            <input value={productoEditar.categoria} onChange={e => setProductoEditar({...productoEditar, categoria: e.target.value})} />
            <input type="number" value={productoEditar.stock} onChange={e => setProductoEditar({...productoEditar, stock: parseInt(e.target.value)})} />
            <select value={productoEditar.estado} onChange={e => setProductoEditar({...productoEditar, estado: e.target.value})}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            <button onClick={cerrarModal}>Cancelar</button>
            <button onClick={guardarEdicion}>Guardar</button>
          </div>
        )}
      </main>
    </div>
  );
}
