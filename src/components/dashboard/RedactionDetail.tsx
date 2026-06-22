import React from "react";
import { motion } from "framer-motion";
import { card, drawerLabel } from "./styles";
import type { RedactionSettings } from "./types";
import type { RedactionLogEntry } from "@/lib/visora-api";
import { drawerBackdropVariants, drawerVariants } from "./animations";

const REGION_LABEL: Record<RedactionLogEntry["regions"][number]["type"], string> = {
  face: "Face",
  text: "Text",
  license_plate: "License plate",
};

function styleLabel(style: RedactionLogEntry["style"]) {
  return style === "black_box" ? "Black box" : "Blur";
}

function ImagePanel({ label, url }: { label: string; url?: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "7px" }}>{label}</div>
      <div style={{ height: "150px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(255,255,255,0.015) 12px 24px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>Not available</span>
        )}
      </div>
    </div>
  );
}

export function RedactionDetail({
  log,
  projectName,
  settings,
  onClose,
}: {
  log: RedactionLogEntry;
  projectName: string;
  settings?: RedactionSettings;
  onClose: () => void;
}) {
  const summary: { k: string; v: React.ReactNode }[] = [
    { k: "Project", v: projectName },
    { k: "Style", v: styleLabel(log.style) },
    { k: "Faces blurred", v: String(log.facesBlurred) },
    { k: "Text blurred", v: String(log.textBlurred) },
    { k: "License plates", v: String(log.licensePlatesBlurred) },
    { k: "Plan", v: log.planId },
    { k: "Date", v: new Date(log.createdAt).toLocaleString() },
  ];

  const targets = settings
    ? [settings.faceBlur ? "Faces" : null, settings.textBlur ? "Text" : null, settings.licensePlateBlur ? "License plates" : null].filter(Boolean).join(", ") || "None"
    : "—";

  const settingsRows = settings
    ? [
        { k: "Targets", v: targets },
        { k: "Style", v: styleLabel(settings.redactionStyle) },
        { k: "Min confidence", v: `${settings.minConfidence}%` },
        { k: "Text categories", v: settings.textCategories.length ? settings.textCategories.join(", ") : "None" },
        { k: "Custom words", v: settings.customWords.length ? settings.customWords.join(", ") : "None" },
        { k: "Ignored words", v: settings.ignoredWords.length ? settings.ignoredWords.join(", ") : "None" },
      ]
    : [];

  return (
    <>
      <motion.div variants={drawerBackdropVariants} initial="initial" animate="animate" exit="exit" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 40 }} />
      <motion.div variants={drawerVariants} initial="initial" animate="animate" exit="exit" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "560px", maxWidth: "92vw", background: "#000", borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 41, overflowY: "auto", boxShadow: "-30px 0 80px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 26px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "#000", zIndex: 2 }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-0.02em" }}>Redaction detail</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}>{log.redactionId}</div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#050505", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "15px" }}>✕</button>
        </div>

        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <ImagePanel label="Original" url={log.imageUrl} />
            <ImagePanel label="Redacted" url={log.redactedImageUrl} />
          </div>

          <div style={drawerLabel}>SUMMARY</div>
          <div style={{ ...card, padding: "6px 18px" }}>
            {summary.map((s) => (
              <div key={s.k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                <span style={{ color: "rgba(255,255,255,0.45)" }}>{s.k}</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={drawerLabel}>REGIONS REDACTED ({log.regions.length})</div>
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", padding: "11px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              <span>Type</span><span>Confidence</span><span>Text</span>
            </div>
            {log.regions.length === 0 ? (
              <div style={{ padding: "14px 18px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>No regions were detected.</div>
            ) : (
              log.regions.map((region, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{REGION_LABEL[region.type]}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "rgba(255,255,255,0.65)" }}>{region.confidence.toFixed(1)}%</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{region.text ?? "—"}</span>
                </div>
              ))
            )}
          </div>

          {settingsRows.length > 0 && (
            <>
              <div style={drawerLabel}>SETTINGS USED</div>
              <div style={{ ...card, padding: "6px 18px" }}>
                {settingsRows.map((s) => (
                  <div key={s.k} style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "13px" }}>
                    <span style={{ color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>{s.k}</span>
                    <span style={{ color: "rgba(255,255,255,0.85)", textAlign: "right" }}>{s.v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
