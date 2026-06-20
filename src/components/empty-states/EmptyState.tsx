"use client";

import React from "react";

/**
 * Shared presentational shell for a dashboard empty state — centered
 * illustration, title, body, primary/secondary actions and an optional hint
 * pill. The page header (title + subtitle) is intentionally left out so this
 * drops straight into an existing dashboard page's content area.
 *
 * Wiring (`onCta` / `onSecondary`) is left to the caller.
 */
export interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onCta?: () => void;
  secondary?: string;
  onSecondary?: () => void;
  hint?: string;
}

export function EmptyState({ illustration, title, body, cta, onCta, secondary, onSecondary, hint }: EmptyStateProps) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 44px 80px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: "460px" }}>
        {/* illustration */}
        <div style={{ position: "relative", width: "220px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "34px" }}>
          <div style={{ position: "absolute", width: "320px", height: "280px", background: "radial-gradient(ellipse at center, rgba(126,155,255,0.12), rgba(126,155,255,0) 64%)", pointerEvents: "none" }} />
          {illustration}
        </div>

        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h2>
        <p style={{ margin: "12px 0 0", fontSize: "15px", lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{body}</p>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "30px" }}>
          <button onClick={onCta} className="es-cta-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "11px 20px", borderRadius: "11px", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "transform .2s, box-shadow .2s" }}>{cta}</button>
          {secondary && (
            <button onClick={onSecondary} className="es-cta-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", padding: "11px 20px", borderRadius: "11px", cursor: "pointer", fontFamily: "inherit", transition: "background .2s" }}>{secondary}</button>
          )}
        </div>

        {hint && (
          <div style={{ marginTop: "30px", display: "flex", alignItems: "center", gap: "9px", padding: "9px 16px", borderRadius: "30px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#aebfff", boxShadow: "0 0 8px 1px rgba(126,155,255,0.8)", animation: "esPulse 3s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{hint}</span>
          </div>
        )}
      </div>
    </div>
  );
}
