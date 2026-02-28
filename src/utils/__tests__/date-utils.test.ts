import { describe, it, expect } from "vitest";
import { formatDate } from "../date-utils";

describe("formatDate", () => {
    it("deve formatar data no padrão PT-BR (DD/MM/YYYY)", () => {
        const result = formatDate("2025-06-15T10:30:00Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("deve formatar data com timezone diferente", () => {
        const result = formatDate("2025-01-01T00:00:00Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it("deve lidar com datas ISO válidas", () => {
        const result = formatDate("2024-12-25T15:00:00.000Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});
