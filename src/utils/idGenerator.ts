// Generador de IDs únicos para evitar duplicados en escaneos masivos
let globalIdCounter = 0;

export function generateUniqueId(): number {
  // Simplemente incrementamos un contador global basado en timestamp inicial
  // Esto garantiza unicidad absoluta sin problemas de precisión
  return Date.now() + (++globalIdCounter);
}

// Función para generar IDs únicos para lotes de elementos
export function generateBatchIds(count: number): number[] {
  const ids: number[] = [];
  for (let i = 0; i < count; i++) {
    ids.push(generateUniqueId());
  }
  return ids;
}