import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    isAssessmentAvailable,
    formatAvailabilityDate,
    getTimeUntilAvailable,
} from "../assessment-availability";

describe("isAssessmentAvailable", () => {
    it("deve retornar true quando availableFrom é null", () => {
        expect(isAssessmentAvailable(null)).toBe(true);
    });

    it("deve retornar true quando data já passou", () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        expect(isAssessmentAvailable(pastDate)).toBe(true);
    });

    it("deve retornar false quando data está no futuro", () => {
        const futureDate = new Date(Date.now() + 86400000).toISOString();
        expect(isAssessmentAvailable(futureDate)).toBe(false);
    });

    it("deve retornar true quando data é exatamente agora", () => {
        const now = new Date().toISOString();
        expect(isAssessmentAvailable(now)).toBe(true);
    });
});

describe("formatAvailabilityDate", () => {
    it("deve formatar data no padrão DD/MM/YYYY às HH:MM", () => {
        const result = formatAvailabilityDate("2025-06-15T10:30:00Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}/);
    });

    it("deve lidar com string de data inválida", () => {
        const result = formatAvailabilityDate("not-a-date");
        // new Date("not-a-date") não lança erro, retorna Invalid Date
        expect(result).toContain("NaN");
    });
});

describe("getTimeUntilAvailable", () => {
    it("deve retornar isAvailable true para data no passado", () => {
        const pastDate = new Date(Date.now() - 86400000).toISOString();
        const result = getTimeUntilAvailable(pastDate);
        expect(result.isAvailable).toBe(true);
    });

    it("deve retornar isAvailable false para data no futuro", () => {
        const futureDate = new Date(Date.now() + 2 * 86400000).toISOString();
        const result = getTimeUntilAvailable(futureDate);
        expect(result.isAvailable).toBe(false);
        expect(result.daysRemaining).toBeGreaterThanOrEqual(1);
    });

    it("deve formatar tempo restante em dias", () => {
        const futureDate = new Date(Date.now() + 3 * 86400000).toISOString();
        const result = getTimeUntilAvailable(futureDate);
        expect(result.formattedTime).toMatch(/\d+ dias?/);
    });

    it("deve formatar tempo restante em horas", () => {
        const futureDate = new Date(Date.now() + 5 * 3600000).toISOString();
        const result = getTimeUntilAvailable(futureDate);
        expect(result.formattedTime).toMatch(/\d+ horas?/);
    });

    it("deve formatar tempo restante em minutos", () => {
        const futureDate = new Date(Date.now() + 15 * 60000).toISOString();
        const result = getTimeUntilAvailable(futureDate);
        expect(result.formattedTime).toMatch(/\d+ minutos?/);
    });

    it("deve incluir hoursRemaining e minutesRemaining", () => {
        const futureDate = new Date(Date.now() + 2 * 86400000 + 3 * 3600000 + 15 * 60000).toISOString();
        const result = getTimeUntilAvailable(futureDate);
        expect(result.hoursRemaining).toBeDefined();
        expect(result.minutesRemaining).toBeDefined();
    });
});
