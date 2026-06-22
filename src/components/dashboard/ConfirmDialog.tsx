"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const danger = tone === "danger";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.62)", backdropFilter: "blur(4px)", zIndex: 70 }} />
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ position: "fixed", left: "50%", top: "50%", translate: "-50% -50%", zIndex: 71, width: "420px", maxWidth: "calc(100vw - 40px)", background: "#050505", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "24px", boxShadow: "0 34px 90px rgba(0,0,0,0.62)" }}
      >
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: danger ? "rgba(255,90,90,0.1)" : "rgba(126,155,255,0.1)", border: `1px solid ${danger ? "rgba(255,90,90,0.28)" : "rgba(126,155,255,0.25)"}`, marginBottom: "16px" }} />
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>{title}</h2>
        <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
          <button onClick={onCancel} style={{ padding: "9px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.12)", background: "#000", color: "rgba(255,255,255,0.72)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ padding: "9px 15px", borderRadius: "9px", border: "none", background: danger ? "#ff9b9b" : "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </motion.div>
    </>
  );
}
