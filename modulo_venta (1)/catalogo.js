// catalogo.js

// Función utilitaria para extraer la información del producto de su contenedor HTML
function obtenerInfoProducto(productoElement) {
    return {
        id: productoElement.dataset.id,
        nombre: productoElement.querySelector('.nombre').textContent,
        // Convertimos el precio a número
        precio: Number(productoElement.dataset.price), 
        // Obtenemos la ruta de la imagen
        imagen: productoElement.querySelector('.imagen img').getAttribute('src'),
        descripcion: productoElement.querySelector('.descripcion').textContent
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // CAMBIO CLAVE: Escuchamos en document.body para capturar clics en CUALQUIER botón 
    // de 'agregar-carrito', tanto en el catálogo principal como en las sugerencias.
    document.body.addEventListener('click', (e) => {
        // Usamos closest para encontrar el botón que inició el evento
        const boton = e.target.closest('.agregar-carrito');
        
        if (boton) {
            // Prevenimos la acción por defecto si el botón estuviera dentro de un enlace
            e.preventDefault(); 
            
            // Buscamos el contenedor padre del producto (.producto)
            const productoElement = boton.closest('.producto');
            
            if (productoElement) {
                const producto = obtenerInfoProducto(productoElement);
                
                // La función 'agregarAlCarrito' se encuentra en cartService.js
                agregarAlCarrito(producto);

                console.log(`Producto ${producto.nombre} agregado. Cantidad total en carrito: ${document.getElementById('cuenta-carrito').textContent}`);
            }
        }
    });

    // NOTA: Si tienes lógica de filtros en otro archivo (filtros.js), 
    // asegúrate de que esté cargada después de cartService.js.
});