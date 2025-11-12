function obtenerInfoProducto(productoElement) {
    return {
        id: productoElement.dataset.id,
        nombre: productoElement.querySelector('.nombre').textContent,
        precio: Number(productoElement.dataset.price), 
        imagen: productoElement.querySelector('.imagen img').getAttribute('src'),
        descripcion: productoElement.querySelector('.descripcion').textContent
    };
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('catalogo').addEventListener('click', (e) => {
        const boton = e.target.closest('.agregar-carrito');
        
        if (boton) {
            const productoElement = boton.closest('.producto');
            const producto = obtenerInfoProducto(productoElement);
            
            agregarAlCarrito(producto);

            console.log(`Producto ${producto.nombre} agregado. Cantidad total en carrito: ${document.getElementById('cuenta-carrito').textContent}`);
        }
    });
});