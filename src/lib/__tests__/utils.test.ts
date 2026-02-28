import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
    it("deve combinar classes simples", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("deve lidar com classes condicionais", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("deve fazer merge de classes Tailwind conflitantes", () => {
        expect(cn("px-4", "px-6")).toBe("px-6");
    });

    it("deve retornar string vazia sem argumentos", () => {
        expect(cn()).toBe("");
    });

    it("deve lidar com undefined e null", () => {
        expect(cn("base", undefined, null, "end")).toBe("base end");
    });
});
