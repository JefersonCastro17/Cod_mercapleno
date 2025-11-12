const inputNombre = document.getElementById('buscarNombre');
const selectCategoria = document.getElementById('filtroCategoria');
const precioMin = document.getElementById('precioMin');
const precioMax = document.getElementById('precioMax');
const btnLimpiar = document.getElementById('limpiar');
const productos = document.querySelectorAll('.producto');

function filtrar() {
  const nombre = inputNombre.value.toLowerCase();
  const categoria = selectCategoria.value;
  const min = Number(precioMin.value) || 0;
  const max = Number(precioMax.value) || Infinity;

  productos.forEach(p => {
    const n = p.dataset.name.toLowerCase();
    const c = p.dataset.category;
    const price = Number(p.dataset.price);

    const coincideNombre = n.includes(nombre);
    const coincideCat = categoria === 'todas' || c === categoria;
    const coincidePrecio = price >= min && price <= max;

    if (coincideNombre && coincideCat && coincidePrecio) {
      p.classList.remove('hidden');
    } else {
      p.classList.add('hidden');
    }
  });
}

inputNombre.addEventListener('input', filtrar);
selectCategoria.addEventListener('change', filtrar);
precioMin.addEventListener('input', filtrar);
precioMax.addEventListener('input', filtrar);

btnLimpiar.addEventListener('click', () => {
  inputNombre.value = '';
  selectCategoria.value = 'todas';
  precioMin.value = '';
  precioMax.value = '';
  filtrar();
});

filtrar();