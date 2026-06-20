"use client";

import React, { useState } from "react";
import { surface, text } from "../theme";

/** Copy-to-clipboard button with a transient "Copied" state. */
export function CopyButton({ text: value, style }: { text: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button
      onClick={copy}
      className="docs-copy"
      style={{ fontSize: "12px", fontWeight: 500, color: text.body, background: "rgba(255,255,255,0.05)", border: `1px solid ${surface.border}`, padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit", ...style }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
