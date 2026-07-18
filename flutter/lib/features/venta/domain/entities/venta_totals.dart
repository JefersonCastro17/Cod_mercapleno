class VentaTotals {
  final double subTotal;
  final double tax; // IVA 19%
  final double finalTotal;
  final int totalItems;

  VentaTotals({
    required this.subTotal,
    required this.tax,
    required this.finalTotal,
    required this.totalItems,
  });

  // Constructor de fábrica para calcular todo desde la lista del carrito
  factory VentaTotals.calculate(List<dynamic> items) {
    double subtotal = 0;
    int count = 0;

    for (var item in items) {
      subtotal += item.precio * item.cantidad;
      count += item.cantidad as int;
    }

    double tax = subtotal * 0.19; // Replicando lógica de Vite
    double total = subtotal + tax;

    return VentaTotals(
      subTotal: subtotal,
      tax: tax,
      finalTotal: total,
      totalItems: count,
    );
  }
}