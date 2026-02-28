import { describe, it, expect, vi } from "vitest";

// Mock do supabase antes de importar o módulo
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        from: vi.fn(),
    },
}));

import {
    isSessionTimeExpired,
    calculateTimeRemaining,
} from "../session-progress";

describe("isSessionTimeExpired", () => {
    it("deve retornar false quando tempo decorrido é menor que duração", () => {
        expect(isSessionTimeExpired(300, 10)).toBe(false); // 5min de 10min
    });

    it("deve retornar true quando tempo decorrido é igual à duração", () => {
        expect(isSessionTimeExpired(600, 10)).toBe(true); // 10min de 10min
    });

    it("deve retornar true quando tempo decorrido excede duração", () => {
        expect(isSessionTimeExpired(700, 10)).toBe(true); // 11.67min de 10min
    });

    it("deve retornar false quando tempo é 0", () => {
        expect(isSessionTimeExpired(0, 10)).toBe(false);
    });

    it("deve lidar com duração de 1 minuto", () => {
        expect(isSessionTimeExpired(60, 1)).toBe(true);
        expect(isSessionTimeExpired(59, 1)).toBe(false);
    });
});

describe("calculateTimeRemaining", () => {
    it("deve calcular tempo restante corretamente", () => {
        expect(calculateTimeRemaining(300, 10)).toBe(300); // 5min restantes de 10min
    });

    it("deve retornar 0 quando tempo esgotou", () => {
        expect(calculateTimeRemaining(600, 10)).toBe(0);
    });

    it("deve retornar 0 quando tempo excedeu", () => {
        expect(calculateTimeRemaining(700, 10)).toBe(0);
    });

    it("deve retornar tempo total quando decorrido é 0", () => {
        expect(calculateTimeRemaining(0, 10)).toBe(600);
    });

    it("deve lidar com duração de 1 minuto", () => {
        expect(calculateTimeRemaining(30, 1)).toBe(30);
    });
});
