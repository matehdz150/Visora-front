"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, ShieldCheck } from "lucide-react";

/* Visora — Moderation showcase. Two cards with the same chrome + animation
   style as the "First-class developer experience" section. */

const reveal: CSSProperties = { opacity: 1, transform: "none" };
const MONO = "var(--font-jetbrains), monospace";

const cardStyle: CSSProperties = {
  position: "relative",
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008))",
  display: "flex",
  flexDirection: "column",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
};

const iconTile: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 11,
  border: "1px solid rgba(174,191,255,0.28)",
  background: "radial-gradient(circle at 35% 25%, rgba(126,155,255,0.22), rgba(255,255,255,0.02) 70%)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
  color: "#cdd8ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
};

function CardChrome() {
  return (
    <>
      <div style={{ position: "absolute", top: -70, left: "10%", right: "10%", height: 170, zIndex: 1, pointerEvents: "none", background: "radial-gradient(ellipse at center, rgba(255,255,255,0.09), rgba(255,255,255,0.035) 34%, transparent 72%)", filter: "blur(38px)" }} />
      <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 20%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.22) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, zIndex: 7, pointerEvents: "none", background: "radial-gradient(circle at top left, rgba(255,255,255,0.13), transparent 18%), radial-gradient(circle at top right, rgba(255,255,255,0.13), transparent 18%)" }} />
      <div style={{ position: "absolute", top: 0, left: 18, right: 18, height: 1, zIndex: 8, pointerEvents: "none", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 12%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.16) 88%, transparent 100%)" }} />
      <div style={{ position: "absolute", top: 18, left: 0, width: 1, height: "62%", zIndex: 8, pointerEvents: "none", background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.055) 42%, rgba(255,255,255,0) 100%)" }} />
      <div style={{ position: "absolute", top: 18, right: 0, width: 1, height: "62%", zIndex: 8, pointerEvents: "none", background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.055) 42%, rgba(255,255,255,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, zIndex: 9, pointerEvents: "none", background: "#000" }} />
    </>
  );
}

function AnimationSlot({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", height: 288, overflow: "hidden", zIndex: 3 }}>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "linear-gradient(180deg, rgba(10,11,14,0), #0a0b0e 88%)", pointerEvents: "none" }} />
    </div>
  );
}

/* ---------- Card 1: risk scoring ---------- */

type Action = "allow" | "review" | "reject";

const ACTION: Record<Action, { label: string; color: string; bg: string; bd: string }> = {
  allow: { label: "Allow", color: "#7ee0a8", bg: "rgba(126,224,168,0.12)", bd: "rgba(126,224,168,0.26)" },
  review: { label: "Review", color: "#e8c98a", bg: "rgba(232,201,138,0.12)", bd: "rgba(232,201,138,0.26)" },
  reject: { label: "Reject", color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" },
};

const SCENARIOS: { action: Action; bars: [string, number][] }[] = [
  { action: "reject", bars: [["Explicit nudity", 94], ["Violence", 18], ["Weapons", 6]] },
  { action: "review", bars: [["Violence", 63], ["Graphic", 38], ["Drugs", 12]] },
  { action: "allow", bars: [["Safe content", 98], ["Nudity", 3], ["Hate", 1]] },
];

function barColor(v: number) {
  return v >= 70 ? "#ff9b9b" : v >= 40 ? "#e8c98a" : "#7ee0a8";
}

function RiskScoringAnim() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((p) => (p + 1) % SCENARIOS.length), 3600);
    return () => window.clearInterval(id);
  }, []);
  const s = SCENARIOS[i];
  const a = ACTION[s.action];

  return (
    <div style={{ padding: "26px 30px 0" }}>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Verdict</span>
            <span style={{ padding: "5px 12px", borderRadius: 999, background: a.bg, border: "1px solid " + a.bd, color: a.color, fontSize: 13, fontWeight: 500 }}>{a.label}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {s.bars.map(([label, value]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 7 }}>
                  <span style={{ color: "rgba(255,255,255,0.74)" }}>{label}</span>
                  <span style={{ fontFamily: MONO, color: barColor(value) }}>{value}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.15 }}
                    style={{ height: "100%", borderRadius: 999, background: barColor(value) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- Card 2: brand safety ---------- */

const SAFE_VALUES = ["97.2", "95.8", "98.4"];

function BrandSafetyAnim() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((p) => (p + 1) % SAFE_VALUES.length), 3600);
    return () => window.clearInterval(id);
  }, []);

  const rows: [string, string, string][] = [
    ["Allowed", "3,204", "#7ee0a8"],
    ["Flagged", "142", "#e8c98a"],
    ["Rejected", "88", "#ff9b9b"],
  ];

  return (
    <div style={{ position: "relative", padding: "26px 30px 0", height: "100%" }}>
      {/* glow */}
      <motion.div
        animate={{ opacity: [0.45, 0.8, 0.45], scale: [1, 1.08, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: 6, right: 24, width: 220, height: 180, borderRadius: "50%", background: "radial-gradient(circle at center, rgba(126,224,168,0.5), rgba(126,224,168,0) 68%)", filter: "blur(20px)", pointerEvents: "none" }}
      />
      <div style={{ position: "relative" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: 10 }}>Brand safe</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <AnimatePresence mode="wait">
            <motion.span key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45 }} style={{ fontSize: 52, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff" }}>
              {SAFE_VALUES[i]}
            </motion.span>
          </AnimatePresence>
          <span style={{ fontSize: 26, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>%</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
          {rows.map(([label, count, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 11, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "rgba(255,255,255,0.78)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                {label}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ Icon, title, desc, children }: { Icon: typeof Gauge; title: string; desc: string; children: ReactNode }) {
  return (
    <div style={{ ...reveal, ...cardStyle }}>
      <CardChrome />
      <AnimationSlot>{children}</AnimationSlot>
      <div style={{ position: "relative", zIndex: 4, padding: "6px 36px 40px" }}>
        <div style={iconTile}>
          <Icon size={19} strokeWidth={1.6} />
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em" }}>{title}</h3>
        <p style={{ margin: 0, maxWidth: 440, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>{desc}</p>
      </div>
    </div>
  );
}

export function ModerationShowcaseSection() {
  return (
    <section style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "90px 40px", fontFamily: "'Sora', sans-serif", color: "#fff" }}>
      <div style={reveal}>
        <h2 style={{ margin: 0, fontSize: "clamp(38px,5.4vw,76px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.0 }}>
          A single request,
          <br />
          a clear verdict.
        </h2>
        <p style={{ margin: "28px 0 0", maxWidth: 600, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>
          Visora scores every image across brand-safety categories and returns one decision your app can act on —
          allow, flag, or reject.
        </p>
      </div>

      <div className="r-cols-2" style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card
          Icon={Gauge}
          title="Risk scoring"
          desc="Every image is scored across nudity, violence, weapons, drugs, hate, and more — with a confidence you can threshold."
        >
          <RiskScoringAnim />
        </Card>
        <Card
          Icon={ShieldCheck}
          title="Brand safety"
          desc="Turn raw scores into one verdict per policy. Keep unsafe content out and track exactly what was allowed, flagged, or rejected."
        >
          <BrandSafetyAnim />
        </Card>
      </div>
    </section>
  );
}
