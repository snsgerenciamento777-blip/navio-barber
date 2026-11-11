import { describe, it, expect } from "vitest";
import { mergeBranding, DEFAULT_PALETTE } from "./branding.ts";

describe("mergeBranding (port de @/lib/branding.ts do Barber App)", () => {
  it("sem overrides retorna a paleta padrão", () => {
    const light = mergeBranding(null, "light");
    expect(light).toEqual(DEFAULT_PALETTE.light);
    const dark = mergeBranding(undefined, "dark");
    expect(dark).toEqual(DEFAULT_PALETTE.dark);
  });

  it("apenas tokens válidos (HEX 6 dígitos) são aplicados", () => {
    const overrides = {
      light: { accent: "#ff0000", background: "inválido", surface: "#00ff00" },
      dark: {},
    } as any;
    const result = mergeBranding(overrides, "light");
    expect(result.accent).toBe("#ff0000");
    expect(result.background).toBe(DEFAULT_PALETTE.light.background); // inválido → fallback
    expect(result.surface).toBe("#00ff00");
  });

  it("não altera tokens não listados em OVERRIDABLE_TOKENS", () => {
    const overrides = { light: { accent: "#ff0000", border: "#cccccc" }, dark: {} } as any;
    const result = mergeBranding(overrides, "light");
    expect(result.accent).toBe("#ff0000");
    expect(result.border).toBeUndefined();
  });

  it("esquema dark funciona independente do light", () => {
    const overrides = { light: {}, dark: { tint: "#ff00ff" } } as any;
    const dark = mergeBranding(overrides, "dark");
    expect(dark.tint).toBe("#ff00ff");
    const light = mergeBranding(overrides, "light");
    expect(light.tint).toBe(DEFAULT_PALETTE.light.tint);
  });

  it("paleta retornada é uma cópia, não a referência interna", () => {
    const result = mergeBranding(null, "light");
    result.accent = "#mutado";
    const again = mergeBranding(null, "light");
    expect(again.accent).toBe(DEFAULT_PALETTE.light.accent);
  });
});
