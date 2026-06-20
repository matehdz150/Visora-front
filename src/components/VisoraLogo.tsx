import React from "react";

type VisoraLogoTone = "dark" | "light";

export function VisoraMark({
  size = 26,
  tone = "dark",
}: {
  size?: number;
  tone?: VisoraLogoTone;
}) {
  const inverse = tone === "light";
  const padding = Math.max(5, Math.round(size * 0.24));
  const gap = Math.max(2, Math.round(size * 0.12));
  const radius = Math.round(size * 0.26);
  const cellRadius = Math.max(1.5, Math.round(size * 0.06));

  return (
    <span
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${radius}px`,
        background: inverse ? "#fff" : "#0a0b0e",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: `${gap}px`,
        padding: `${padding}px`,
        flexShrink: 0,
      }}
    >
      <span style={{ borderRadius: `${cellRadius}px`, background: inverse ? "#0a0b0e" : "#fff" }} />
      <span style={{ borderRadius: `${cellRadius}px`, background: inverse ? "#0a0b0e" : "#fff" }} />
      <span style={{ borderRadius: `${cellRadius}px`, background: inverse ? "rgba(10,11,14,0.4)" : "rgba(255,255,255,0.38)" }} />
      <span style={{ borderRadius: `${cellRadius}px`, background: inverse ? "#0a0b0e" : "#fff" }} />
    </span>
  );
}

export function VisoraLogo({
  markSize = 26,
  fontSize = 18,
  tone = "light",
  docsLabel = false,
}: {
  markSize?: number;
  fontSize?: number;
  tone?: VisoraLogoTone;
  docsLabel?: boolean;
}) {
  const textColor = tone === "light" ? "#fff" : "#0a0b0e";

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "11px", color: textColor }}>
      <VisoraMark size={markSize} tone={tone} />
      <span style={{ fontSize: `${fontSize}px`, fontWeight: 600, letterSpacing: "0", color: textColor }}>Visora</span>
      {docsLabel && (
        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: "12px" }}>Docs</span>
      )}
    </span>
  );
}
