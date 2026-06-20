import React from "react";
import { MONO } from "../theme";
import type { CodeLine } from "../code-samples";

/** Renders tokenized code lines into a styled `<pre>`. */
export function CodeLines({ lines, fontSize = "13.5px" }: { lines: CodeLine[]; fontSize?: string }) {
  return (
    <pre style={{ margin: 0, fontFamily: MONO, fontSize, lineHeight: 1.75 }}>
      {lines.map((line, i) => {
        const isBlank = line.tokens.every((t) => t[0] === "");
        return (
          <div key={i} style={line.indent ? { paddingLeft: line.indent + "px" } : undefined}>
            {isBlank
              ? " "
              : line.tokens.map((t, j) => (
                  <span key={j} style={{ color: t[1] }}>
                    {t[0]}
                  </span>
                ))}
          </div>
        );
      })}
    </pre>
  );
}
