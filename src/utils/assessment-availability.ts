/**
 * Verifica se uma avaliação está disponível baseado na data de disponibilização
 * @param availableFrom Data/hora de disponibilização (ISO string) ou null
 * @returns True se a avaliação está disponível
 */
export function isAssessmentAvailable(availableFrom: string | null): boolean {
  if (!availableFrom) {
    // Se não tem data definida, está disponível imediatamente
    return true;
  }

  const now = new Date();
  const availableDate = new Date(availableFrom);

  // Verifica se a data atual é maior ou igual à data de disponibilização
  return now >= availableDate;
}

/**
 * Formata a data de disponibilização para exibição amigável
 * @param date Data em formato ISO string
 * @returns String formatada
 */
export function formatAvailabilityDate(date: string): string {
  try {
    const d = new Date(date);

    // Formatar data: DD/MM/YYYY às HH:MM
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
}

/**
 * Calcula o tempo restante até a disponibilização
 * @param availableFrom Data de disponibilização (ISO string)
 * @returns Objeto com informações de tempo restante
 */
export function getTimeUntilAvailable(availableFrom: string): {
  isAvailable: boolean;
  daysRemaining?: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  formattedTime?: string;
} {
  const now = new Date();
  const availableDate = new Date(availableFrom);

  if (now >= availableDate) {
    return { isAvailable: true };
  }

  const diffMs = availableDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let formattedTime = "";
  if (diffDays > 0) {
    formattedTime = `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  } else if (diffHours > 0) {
    formattedTime = `${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  } else {
    formattedTime = `${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  }

  return {
    isAvailable: false,
    daysRemaining: diffDays,
    hoursRemaining: diffHours % 24,
    minutesRemaining: diffMinutes % 60,
    formattedTime,
  };
}
