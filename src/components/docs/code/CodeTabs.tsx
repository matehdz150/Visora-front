import React from "react";
import { ACCENT, MONO, text } from "../theme";

export interface CodeTab<Id extends string> {
  id: Id;
  label: string;
}

/** A row of underlined tab buttons for switching code variants. */
export function CodeTabs<Id extends string>({
  tabs,
  active,
  onChange,
  mono,
}: {
  tabs: CodeTab<Id>[];
  active: Id;
  onChange: (id: Id) => void;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {tabs.map((tab) => {
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              fontFamily: mono ? MONO : "inherit",
              fontSize: mono ? "12.5px" : "13px",
              fontWeight: 500,
              padding: "9px 15px",
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: on ? "#fff" : text.faint,
              borderBottom: "2px solid " + (on ? ACCENT : "transparent"),
              marginBottom: "-1px",
              transition: "color .15s",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
