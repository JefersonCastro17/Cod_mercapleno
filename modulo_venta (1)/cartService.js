const STORAGE_KEY = 'productosCarrito';

function obtenerCarrito() {
  const carritoJSON = localStorage.getItem(STORAGE_KEY);
  return carritoJSON ? JSON.parse(carritoJSON) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  actualizarCuentaCarrito();
}

function actualizarCuentaCarrito() {
  const carrito = obtenerCarrito();
  const cuentaElement = document.getElementById('cuenta-carrito');
  
  if (cuentaElement) {
    const totalItems = carrito.reduce((acumulado, producto) => acumulado + producto.cantidad, 0);
    cuentaElement.textContent = totalItems;
  }
}

function agregarAlCarrito(producto) {
  let carrito = obtenerCarrito();
  const productoId = String(producto.id); 
  const productoExistenteIndex = carrito.findIndex(p => p.id === productoId);

  if (productoExistenteIndex !== -1) {
    carrito[productoExistenteIndex].cantidad++;
  } else {
    carrito.push({
      ...producto,
      id: productoId,
      cantidad: 1
    });
  }

  guardarCarrito(carrito);
}

function incrementarCantidad(productoId) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(p => p.id === productoId);

    if (index !== -1) {
        carrito[index].cantidad++;
        guardarCarrito(carrito);
        return true;
    }
    return false;
}

function restarDelCarrito(productoId) {
  let carrito = obtenerCarrito();
  const index = carrito.findIndex(p => p.id === productoId);

  if (index !== -1) {
    if (carrito[index].cantidad > 1) {
      carrito[index].cantidad--;
    } else {
      carrito.splice(index, 1);
    }
    guardarCarrito(carrito);
    return true; 
  }
  return false; 
}

function vaciarCarrito() {
  localStorage.removeItem(STORAGE_KEY);
  actualizarCuentaCarrito();
}

actualizarCuentaCarrito();