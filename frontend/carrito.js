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

        if (carrito.length === 0) {
            carritoVacioMsg.classList.remove('hidden');
            totalesContainer.classList.add('hidden');
            return;
        }

        carritoVacioMsg.classList.add('hidden');
        totalesContainer.classList.remove('hidden');

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
                            <p class="producto-carrito-precio-unitario">${formatearPrecio(producto.precio)} c/u</p>
                        </div>
                    </div>
                    
                    <div class="producto-carrito-cantidad">
                        <button class="cantidad-btn btn-restar" data-id="${producto.id}">-</button>
                        <span>${producto.cantidad}</span>
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
                incrementarCantidad(productoId); 
                renderizarCarrito();
            });
        });

        document.querySelectorAll('.btn-restar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productoId = e.target.dataset.id;
                restarDelCarrito(productoId);
                renderizarCarrito();
            });
        });
    }
    
    btnVaciar.addEventListener('click', () => {
        if (confirm('¿Estás seguro que deseas vaciar todo el carrito?')) {
            vaciarCarrito();
            renderizarCarrito();
        }
    });

    renderizarCarrito();
});