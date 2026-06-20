import React from "react";

/** Hand-drawn sidebar nav glyphs, ported 1:1 from the Claude Design source. */
export function NavIcon({ name, on }: { name: string; on: boolean }) {
  const col = on ? "#fff" : "rgba(255,255,255,0.42)";
  const acc = on ? "#aebfff" : "rgba(255,255,255,0.42)";
  const wrap = (kids: React.ReactNode) => (
    <span style={{ width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{kids}</span>
  );

  if (name === "overview")
    return wrap(
      <span style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "14px" }}>
        <span style={{ width: "3px", height: "7px", borderRadius: "1px", background: col }} />
        <span style={{ width: "3px", height: "13px", borderRadius: "1px", background: acc }} />
        <span style={{ width: "3px", height: "10px", borderRadius: "1px", background: col }} />
      </span>,
    );
  if (name === "moderations")
    return wrap(
      <span style={{ display: "flex", flexDirection: "column", gap: "3px", width: "15px" }}>
        <span style={{ height: "2.5px", borderRadius: "2px", background: acc }} />
        <span style={{ height: "2.5px", borderRadius: "2px", background: col }} />
        <span style={{ height: "2.5px", borderRadius: "2px", background: col, width: "10px" }} />
      </span>,
    );
  if (name === "webhooks")
    return wrap(
      <span style={{ position: "relative", width: "15px", height: "14px" }}>
        <span style={{ position: "absolute", left: 0, top: "5px", width: "5px", height: "5px", borderRadius: "50%", border: "1.5px solid " + acc }} />
        <span style={{ position: "absolute", right: 0, top: "1px", width: "5px", height: "5px", borderRadius: "50%", border: "1.5px solid " + col }} />
        <span style={{ position: "absolute", right: "1px", bottom: 0, width: "5px", height: "5px", borderRadius: "50%", border: "1.5px solid " + col }} />
        <span style={{ position: "absolute", left: "5px", top: "7px", width: "5px", height: "1.5px", borderRadius: "2px", background: col, transform: "rotate(-26deg)", transformOrigin: "left center" }} />
        <span style={{ position: "absolute", left: "5px", top: "9px", width: "6px", height: "1.5px", borderRadius: "2px", background: col, transform: "rotate(24deg)", transformOrigin: "left center" }} />
      </span>,
    );
  if (name === "playground")
    return wrap(
      <span style={{ position: "relative", width: "14px", height: "14px", borderRadius: "50%", border: "2px solid " + col, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "5px solid " + acc, marginLeft: "1px" }} />
      </span>,
    );
  if (name === "projects")
    return wrap(
      <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ width: "6px", height: "6px", borderRadius: "2px", background: i === 1 ? acc : col }} />
        ))}
      </span>,
    );
  if (name === "keys")
    return wrap(
      <span style={{ display: "flex", alignItems: "center" }}>
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", border: "2px solid " + acc }} />
        <span style={{ width: "7px", height: "2px", background: col, marginLeft: "1px" }} />
      </span>,
    );
  if (name === "policies")
    return wrap(
      <span style={{ position: "relative", width: "15px", height: "12px" }}>
        <span style={{ position: "absolute", top: "2px", left: 0, right: 0, height: "2px", borderRadius: "2px", background: col }} />
        <span style={{ position: "absolute", top: "0px", left: "4px", width: "6px", height: "6px", borderRadius: "50%", background: acc }} />
        <span style={{ position: "absolute", bottom: "2px", left: 0, right: 0, height: "2px", borderRadius: "2px", background: col }} />
        <span style={{ position: "absolute", bottom: "0px", right: "3px", width: "6px", height: "6px", borderRadius: "50%", background: col }} />
      </span>,
    );
  return wrap(
    <span style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid " + col, position: "relative" }}>
      <span style={{ position: "absolute", top: "50%", left: "50%", width: "4px", height: "4px", marginTop: "-2px", marginLeft: "-2px", borderRadius: "50%", background: acc }} />
    </span>,
  );
}
