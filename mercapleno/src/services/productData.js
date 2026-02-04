export const getProducts = () => [
    { id: '1', nombre: 'Café Juan Valdez 250g', price: 18000, category: 'bebidas', image: 'cafe_juan_valdez.jpg' },
    { id: '2', nombre: 'Arroz Diana 500g', price: 4000, category: 'abarrotes', image: 'arroz_diana.jpg' },
    { id: '3', nombre: 'Leche Entera Colanta 1L', price: 4500, category: 'lacteos', image: 'leche_colanta.jpg' },
    { id: '4', nombre: 'Lentejas Bolsa 500g', price: 3200, category: 'abarrotes', image: 'lentejas.jpg' },
    { id: '5', nombre: 'Cerveza Aguila 6-pack', price: 15000, category: 'bebidas', image: 'cerveza_aguila.jpg' },
    { id: '6', nombre: 'Yogurt Alpina Melocotón 1L', price: 7800, category: 'lacteos', image: 'yogurt_alpina.jpg' },
    { id: '7', nombre: 'Pan Bimbo Integral', price: 8500, category: 'panaderia', image: 'pan_integral.jpg' },
    { id: '8', nombre: 'Filete de Pollo 500g', price: 12500, category: 'carnicos', image: 'filete_pollo.jpg' },
    { id: '9', nombre: 'Huevo AA Cubeta 30u', price: 16000, category: 'lacteos', image: 'huevos.jpg' },
    { id: '10', nombre: 'Atún en Aceite Van Camp\'s', price: 5500, category: 'abarrotes', image: 'atun_vancamps.jpg' },
    { id: '11', nombre: 'Queso Doble Crema 250g', price: 6900, category: 'lacteos', image: 'queso_doble_crema.jpg' },
    { id: '12', nombre: 'Gaseosa Postobon Cola', price: 2800, category: 'bebidas', image: 'postobon_cola.jpg' },
    { id: '13', nombre: 'Salchichón Zenu', price: 3800, category: 'carnicos', image: 'salchichon_zenu.jpg' },
    { id: '14', nombre: 'Avena Quaker Instantánea', price: 9500, category: 'abarrotes', image: 'avena_quaker.jpg' },
    { id: '15', nombre: 'Torta Ramo', price: 7200, category: 'panaderia', image: 'torta_ramo.jpg' },
    { id: '16', nombre: 'Banano Unidad', price: 500, category: 'frutas', image: 'banano.jpg' },
];

export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'N/A';
  }
  const precioFormateado = price.toLocaleString('es-CO');
  return `${precioFormateado}$`;
};