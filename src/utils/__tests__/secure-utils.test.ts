import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock localStorage before any imports
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};
vi.stubGlobal("localStorage", localStorageMock);

// Mock document with createElement for sanitizeInput DOM-based sanitization
vi.stubGlobal("document", {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    body: { style: {}, classList: { add: vi.fn(), remove: vi.fn() } },
    documentElement: { style: {} },
    createElement: vi.fn(() => {
        let textContent = "";
        return {
            get textContent() {
                return textContent;
            },
            set textContent(val: string) {
                textContent = val;
            },
            get innerHTML() {
                // Simulate browser textContent → innerHTML encoding
                return textContent
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
            },
        };
    }),
    querySelectorAll: vi.fn(() => []),
    getElementById: vi.fn(() => null),
});

// Mock supabase client to avoid real DB connections
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
            }),
        }),
        rpc: vi.fn(),
    },
}));

// Mock window for browser detection tests
vi.stubGlobal("window", {
    ...globalThis,
    outerWidth: 1920,
    outerHeight: 1080,
    innerWidth: 1840,
    innerHeight: 1000,
    Firebug: undefined,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
});

// Import after all mocks
import { detectDevTools, sanitizeInput } from "../secure-utils";

describe("detectDevTools", () => {
    beforeEach(() => {
        // Width diff = 80, Height diff = 80 — both below 129 threshold
        (window as any).outerWidth = 1920;
        (window as any).outerHeight = 1080;
        (window as any).innerWidth = 1840;
        (window as any).innerHeight = 1000;
        (window as any).Firebug = undefined;
    });

    it("should not detect DevTools when difference is below threshold", () => {
        expect(detectDevTools()).toBe(false);
    });

    it("should detect DevTools when width difference exceeds threshold", () => {
        (window as any).innerWidth = 1620; // diff = 300
        expect(detectDevTools()).toBe(true);
    });

    it("should detect DevTools when height difference exceeds threshold", () => {
        (window as any).innerHeight = 680; // diff = 400
        expect(detectDevTools()).toBe(true);
    });

    it("should not trigger false positive with bookmarks bar", () => {
        (window as any).innerWidth = 1800; // diff = 120
        expect(detectDevTools()).toBe(false);
    });

    it("should detect Firebug (legacy browsers)", () => {
        (window as any).Firebug = { chrome: { isInitialized: true } };
        expect(detectDevTools()).toBe(true);
    });

    it("should not detect Firebug when not initialized", () => {
        (window as any).Firebug = { chrome: { isInitialized: false } };
        expect(detectDevTools()).toBe(false);
    });

    it("should detect at threshold + 1", () => {
        (window as any).innerWidth = 1790; // diff = 130 > 129
        expect(detectDevTools()).toBe(true);
    });

    it("should not detect at exactly threshold value", () => {
        (window as any).innerWidth = 1791; // diff = 129 is NOT > 129
        expect(detectDevTools()).toBe(false);
    });
});

describe("sanitizeInput", () => {
    it("should encode HTML entities from script tags", () => {
        const input = '<script>alert("xss")</script>Hello';
        const result = sanitizeInput(input);
        expect(result).not.toContain("<script>");
        expect(result).toContain("&lt;script&gt;");
    });

    it("should encode event handlers", () => {
        const input = '<img onerror="alert(1)">';
        const result = sanitizeInput(input);
        expect(result).not.toContain("<img");
        expect(result).toContain("&lt;img");
    });

    it("should preserve normal text", () => {
        const input = "Hello World! This is a test.";
        const result = sanitizeInput(input);
        expect(result).toBe("Hello World! This is a test.");
    });

    it("should handle empty string", () => {
        expect(sanitizeInput("")).toBe("");
    });

    it("should encode angle brackets", () => {
        const input = "2 < 3 > 1";
        const result = sanitizeInput(input);
        expect(result).toContain("&lt;");
        expect(result).toContain("&gt;");
    });
});
