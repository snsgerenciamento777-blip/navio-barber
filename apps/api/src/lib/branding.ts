/**
 * Runtime theming: merge as cores salvas de uma loja sobre a paleta padrão.
 * Port de @/lib/branding.ts do Barber App. Puro e unit-testable.
 */

export type Scheme = "light" | "dark";

export type Palette = Record<string, string>;

export type BrandColors = Record<Scheme, { accent?: string; background?: string; surface?: string; text?: string; tint?: string }>;

export const OVERRIDABLE_TOKENS = ["accent", "background", "surface", "text", "tint"] as const;

export const DEFAULT_PALETTE: Record<Scheme, Palette> = {
  light: {
    accent: "#0f172a",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    tint: "#0ea5e9",
  },
  dark: {
    accent: "#f8fafc",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f8fafc",
    tint: "#38bdf8",
  },
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Merge `overrides[scheme]` sobre a paleta padrão para `scheme`. */
export function mergeBranding(overrides: BrandColors | null | undefined, scheme: Scheme): Palette {
  const base = { ...DEFAULT_PALETTE[scheme] };
  const ov = overrides?.[scheme];
  if (!ov) return base;

  const merged: Palette = { ...base };
  for (const token of OVERRIDABLE_TOKENS) {
    const value = ov[token];
    if (typeof value === "string" && HEX_COLOR.test(value)) {
      merged[token] = value;
    }
  }
  return merged;
}
