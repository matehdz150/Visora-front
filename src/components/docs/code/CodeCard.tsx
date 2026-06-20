import React from "react";
import { codeCardStyle, codeHeaderStyle } from "../theme";

/** Bordered container for any code block. */
export function CodeCard({ shadow, children }: { shadow?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ ...codeCardStyle, marginTop: "20px", ...(shadow ? { boxShadow: "0 30px 70px rgba(0,0,0,0.4)" } : null) }}>
      {children}
    </div>
  );
}

/** The header bar of a code block (holds tabs, a filename, or a status badge). */
export function CodeCardHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 0", ...codeHeaderStyle, ...style }}>
      {children}
    </div>
  );
}

/** Padded, horizontally-scrollable body of a code block. */
export function CodeBody({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ padding: "20px 22px", overflowX: "auto", ...style }}>{children}</div>;
}
