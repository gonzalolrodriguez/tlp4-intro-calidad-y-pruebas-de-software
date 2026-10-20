/** Calcula el precio luego de aplicar un porcentaje de descuento. */
export function calcularPrecioFinal(precio: number, descuento: number): number {
  // El precio debe ser un número finito y no puede ser negativo
  if (!Number.isFinite(precio) || precio < 0) {
    throw new RangeError('El precio debe ser un número mayor o igual a 0');
  }

  // El descuento debe ser un número finito entre 0 y 100
  if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    throw new RangeError('El descuento debe estar entre 0 y 100');
  }

  return precio - (precio * descuento) / 100;
}
