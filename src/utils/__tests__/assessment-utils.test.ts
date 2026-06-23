import { describe, it, expect } from "vitest";
import { parseMaxAttempts, resolveMaxAttempts } from "../assessment-utils";

describe("parseMaxAttempts", () => {
  it("preserva 0 (tentativas ilimitadas)", () => {
    expect(parseMaxAttempts("0")).toBe(0);
  });

  it("converte número válido", () => {
    expect(parseMaxAttempts("3")).toBe(3);
    expect(parseMaxAttempts("10")).toBe(10);
  });

  it("retorna 1 para string vazia", () => {
    expect(parseMaxAttempts("")).toBe(1);
  });

  it("retorna 1 para valor não numérico (NaN)", () => {
    expect(parseMaxAttempts("abc")).toBe(1);
  });

  it("preserva valor negativo (validado em outra camada)", () => {
    expect(parseMaxAttempts("-1")).toBe(-1);
  });

  it("ignora parte decimal usando parseInt", () => {
    expect(parseMaxAttempts("2.9")).toBe(2);
  });
});

describe("resolveMaxAttempts", () => {
  it("preserva 0 (ilimitado)", () => {
    expect(resolveMaxAttempts(0)).toBe(0);
  });

  it("mantém número positivo", () => {
    expect(resolveMaxAttempts(5)).toBe(5);
  });

  it("retorna 1 para null", () => {
    expect(resolveMaxAttempts(null)).toBe(1);
  });

  it("retorna 1 para undefined", () => {
    expect(resolveMaxAttempts(undefined)).toBe(1);
  });
});
