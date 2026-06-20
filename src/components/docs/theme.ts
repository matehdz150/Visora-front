/**
 * Visora docs — shared design tokens.
 *
 * The docs page is a faithful inline-style port of the Claude Design source, so
 * colours, surfaces and the syntax-highlight palettes live here as plain values
 * that every docs component reuses.
 */
import type { CSSProperties } from "react";

export const ACCENT = "#aebfff";
export const MONO = "'JetBrains Mono', monospace";

export const text = {
  primary: "#fff",
  body: "rgba(255,255,255,0.6)",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.4)",
  ghost: "rgba(255,255,255,0.35)",
};

export const surface = {
  code: "#0b0b0b",
  card: "#0f0f0f",
  header: "rgba(255,255,255,0.018)",
  border: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.07)",
  borderFaint: "rgba(255,255,255,0.08)",
};

/** Syntax palette for source-code samples. */
export const SYNTAX = {
  kw: "#c4b5ff",
  str: "#c7d2ff",
  fn: "#aebfff",
  com: "rgba(255,255,255,0.35)",
  punct: "rgba(255,255,255,0.5)",
  txt: "rgba(255,255,255,0.88)",
  num: "#7ee0a8",
};

/** Syntax palette for the JSON response sample. */
export const JSON_SYNTAX = {
  key: "#8fa0d8",
  str: "#c7d2ff",
  num: "#aebfff",
  bool: "#ff9b9b",
  punct: "rgba(255,255,255,0.4)",
  txt: "rgba(255,255,255,0.5)",
};

/** Reusable bordered surface for code blocks. */
export const codeCardStyle: CSSProperties = {
  borderRadius: "14px",
  overflow: "hidden",
  border: `1px solid ${surface.border}`,
  background: surface.code,
};

export const codeHeaderStyle: CSSProperties = {
  borderBottom: `1px solid ${surface.borderSoft}`,
  background: surface.header,
};
