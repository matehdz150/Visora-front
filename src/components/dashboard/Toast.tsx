"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastKind = "success" | "error" | "info";

export interface DashboardToast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

export type DashboardNotify = (toast: Omit<DashboardToast, "id">) => void;

const tone: Record<ToastKind, { color: string; bg: string; border: string }> = {
  success: { color: "#7ee0a8", bg: "rgba(120,224,168,0.1)", border: "rgba(120,224,168,0.24)" },
  error: { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", border: "rgba(255,90,90,0.25)" },
  info: { color: "#aebfff", bg: "rgba(126,155,255,0.1)", border: "rgba(126,155,255,0.25)" },
};

export function ToastViewport({ toasts, onDismiss }: { toasts: DashboardToast[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", top: "18px", right: "18px", zIndex: 80, display: "flex", flexDirection: "column", gap: "10px", width: "360px", maxWidth: "calc(100vw - 36px)", pointerEvents: "none" }}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const t = tone[toast.kind];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 28, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 28, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ pointerEvents: "auto", display: "flex", gap: "12px", padding: "14px 15px", borderRadius: "13px", background: "rgba(15,15,15,0.94)", border: `1px solid ${t.border}`, boxShadow: "0 18px 46px rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
            >
              <span style={{ width: "9px", height: "9px", marginTop: "5px", borderRadius: "50%", background: t.color, boxShadow: `0 0 14px ${t.color}66`, flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#fff", lineHeight: 1.35 }}>{toast.title}</div>
                {toast.message && <div style={{ marginTop: "3px", fontSize: "12.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{toast.message}</div>}
              </div>
              <button onClick={() => onDismiss(toast.id)} style={{ alignSelf: "flex-start", background: "transparent", border: "none", color: "rgba(255,255,255,0.38)", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "2px" }}>x</button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
