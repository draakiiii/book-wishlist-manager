// Generador de IDs únicos para evitar duplicados en escaneos masivos
let idCounter = 0;

export function generateUniqueId(): number {
  // Combinamos timestamp con un contador incremental para garantizar unicidad
  const timestamp = Date.now();
  const counter = ++idCounter;
  
  // Si el contador se vuelve demasiado grande, lo reiniciamos
  if (idCounter > 999999) {
    idCounter = 0;
  }
  
  // Retornamos timestamp * 1000000 + counter para garantizar unicidad
  // Esto asegura que incluso en el mismo milisegundo, cada ID sea diferente
  return timestamp * 1000000 + counter;
}

// Función para generar IDs únicos para lotes de elementos
export function generateBatchIds(count: number): number[] {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateUniqueId());
  }
  return ids;
}