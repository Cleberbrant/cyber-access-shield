// =============================================================================
// UTILITÁRIOS DE AVALIAÇÃO
// =============================================================================

/**
 * Normaliza o valor do formulário de "tentativas máximas".
 * Regra: 0 = ilimitado (preservado); vazio ou inválido (NaN) = 1.
 *
 * Importante: NÃO usar `parseInt(value) || 1`, pois 0 é falsy e seria
 * convertido em 1, impedindo o cadastro de tentativas ilimitadas.
 */
export function parseMaxAttempts(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 1 : parsed;
}

/**
 * Resolve o `max_attempts` vindo do banco para exibição/lógica.
 * Regra: preserva 0 (ilimitado); null/undefined viram 1.
 *
 * Usar `?? 1` (e não `|| 1`) para não transformar 0 em 1.
 */
export function resolveMaxAttempts(value: number | null | undefined): number {
  return value ?? 1;
}
