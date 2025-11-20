// carrito.js

// Incluimos la función utilitaria para que esté disponible en esta vista también
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
    const container = document.getElementById('productos-carrito-container');
    const totalesContainer = document.getElementById('totales-container');
    const carritoVacioMsg = document.getElementById('carrito-vacio-msg');
    const btnVaciar = document.getElementById('btn-vaciar');

    function formatearPrecio(precio) {
      const precioFormateado = precio.toLocaleString('es-CO');
      return `${precioFormateado}$`;
    }

    function renderizarCarrito() {
        const carrito = obtenerCarrito();
        container.innerHTML = '';
        let totalUnidades = 0;
        let totalPrecio = 0;

        // Mostrar/Ocultar el mensaje de carrito vacío y el total
        const contenedorSugerencias = document.getElementById('productos-sugeridos-container');
        
        if (carrito.length === 0) {
            carritoVacioMsg.classList.remove('hidden');
            totalesContainer.classList.add('hidden');
            // Muestra sugerencias si el carrito está vacío
            if (contenedorSugerencias) contenedorSugerencias.classList.remove('hidden');
            return;
        }

        carritoVacioMsg.classList.add('hidden');
        totalesContainer.classList.remove('hidden');
        // Opcional: Oculta sugerencias si el carrito tiene ítems (o déjalas visibles, según el diseño)
        // if (contenedorSugerencias) contenedorSugerencias.classList.add('hidden'); 

        carrito.forEach(producto => {
            const subtotal = producto.cantidad * producto.precio;
            totalUnidades += producto.cantidad;
            totalPrecio += subtotal;

            const itemHTML = `
                <div class="producto-carrito-item" data-id="${producto.id}">
                    <div class="producto-carrito-info">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        <div>
                            <p class="producto-carrito-nombre">${producto.nombre}</p>
                            <p class="producto-carrito-precio-unitario">Precio unitario: ${formatearPrecio(producto.precio)}</p>
                        </div>
                    </div>
                    
                    <div class="producto-carrito-controles">
                        <button class="cantidad-btn btn-restar" data-id="${producto.id}">-</button>
                        <span class="cantidad-actual">${producto.cantidad}</span>
                        <button class="cantidad-btn btn-sumar" data-id="${producto.id}">+</button>
                    </div>

                    <div class="producto-carrito-subtotal">
                        ${formatearPrecio(subtotal)}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHTML);
        });

        document.getElementById('total-unidades').textContent = totalUnidades;
        document.getElementById('total-precio').textContent = formatearPrecio(totalPrecio);

        adjuntarListenersCantidad();
    }

    function adjuntarListenersCantidad() {
        document.querySelectorAll('.btn-sumar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.dataset.id;
                // La función 'incrementarCantidad' está en cartService.js
                incrementarCantidad(productoId); 
                renderizarCarrito();
            });
        });

        document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.dataset.id;
                 // La función 'restarDelCarrito' está en cartService.js
                restarDelCarrito(productoId);
                renderizarCarrito();
            });
        });
    }
    
    btnVaciar.addEventListener('click', () => {
        if (confirm('¿Estás seguro que deseas vaciar todo el carrito?')) {
            // La función 'vaciarCarrito' está en cartService.js
            vaciarCarrito();
            renderizarCarrito();
        }
    });


    // ======================================================================
    // ⬇️ LÓGICA AGREGADA para productos sugeridos en la página del carrito ⬇️
    // ======================================================================

    document.body.addEventListener('click', (e) => {
        const boton = e.target.closest('.agregar-carrito');
        
        if (boton) {
            e.preventDefault();
            const productoElement = boton.closest('.producto');
            
            if (productoElement) {
                const producto = obtenerInfoProducto(productoElement);
                
                // La función 'agregarAlCarrito' está definida en cartService.js
                agregarAlCarrito(producto); 
                
                // Forzamos la actualización de la vista del carrito principal
                renderizarCarrito();
                console.log(`Producto sugerido ${producto.nombre} agregado al carrito.`);
            }
        }
    });

    // ======================================================================
    
    renderizarCarrito();
});