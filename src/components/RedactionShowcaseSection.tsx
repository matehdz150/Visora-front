"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Visora — Redaction & blur showcase. Glossy orb + glow, then a simple
   before/after wipe animation cycling through 3 examples.
   Drop your images into /public/images with the names below. */

type Frame = { src: string; kind: "before" | "after"; pair: number };

// Shown one at a time, in order: before 1, after 1, before 2, after 2, ...
const FRAMES: Frame[] = [
  { src: "/images/redaction-before-1.jpeg", kind: "before", pair: 0 },
  { src: "/images/redaction-after-1.jpg", kind: "after", pair: 0 },
  { src: "/images/redaction-before-2.jpeg", kind: "before", pair: 1 },
  { src: "/images/redaction-after-2.jpg", kind: "after", pair: 1 },
  { src: "/images/redaction-before-3.jpg", kind: "before", pair: 2 },
  { src: "/images/redaction-after-3.jpg", kind: "after", pair: 2 },
];

const reveal: CSSProperties = { opacity: 1, transform: "none" };

function GlassOrb() {
  return (
    <div style={{ position: "relative", width: 116, height: 116, margin: "0 auto" }}>
      <div
        style={{
          position: "absolute",
          inset: -54,
          background: "radial-gradient(circle at 50% 60%, rgba(126,155,255,0.4), rgba(126,155,255,0) 66%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 116,
          height: 116,
          borderRadius: 28,
          background: "linear-gradient(150deg, #1c1d24, #0b0c10)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 34px 70px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.14)",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 66,
            height: 66,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 30%, #f4f5ff 0%, #cfd3ec 13%, #555873 46%, #181922 78%, #0c0d12 100%)",
            boxShadow:
              "0 12px 26px rgba(0,0,0,0.6), inset 0 -7px 15px rgba(0,0,0,0.55), inset 0 4px 10px rgba(255,255,255,0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "repeating-linear-gradient(176deg, rgba(255,255,255,0.11) 0 1px, transparent 1px 8px)",
              mixBlendMode: "overlay",
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "20%",
              right: "20%",
              bottom: -3,
              height: "42%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(150,120,255,0.9), rgba(126,155,255,0) 70%)",
              filter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "16%",
              left: "24%",
              width: "26%",
              height: "18%",
              borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.95), rgba(255,255,255,0) 72%)",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const imgFull: CSSProperties = { width: "100%", height: "100%", objectFit: "contain", display: "block" };

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.opacity = "0";
}

/* Card chrome — bright top border that fades down the sides and vanishes at the
   bottom (matching the "First-class developer experience" cards). */
const cardStyle: CSSProperties = {
  position: "relative",
  borderRadius: 24,
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008))",
  boxShadow: "0 60px 130px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12)",
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

function BeforeAfterShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % FRAMES.length), 4000);
    return () => window.clearInterval(id);
  }, []);

  const frame = FRAMES[step];
  const isAfter = frame.kind === "after";

  return (
    <div style={{ padding: 14 }}>
      <div
        style={{
          position: "relative",
          height: 380,
          borderRadius: 14,
          overflow: "hidden",
          background: "#000",
        }}
      >

        <AnimatePresence>
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={frame.src} alt={isAfter ? "Redacted" : "Original"} onError={hideOnError} style={imgFull} />
            <span
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                padding: "5px 11px",
                borderRadius: 999,
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 12,
                fontWeight: 500,
                background: isAfter ? "rgba(126,224,168,0.14)" : "rgba(255,255,255,0.06)",
                border: "1px solid " + (isAfter ? "rgba(126,224,168,0.3)" : "rgba(255,255,255,0.14)"),
                color: isAfter ? "#7ee0a8" : "rgba(255,255,255,0.7)",
              }}
            >
              {isAfter ? "After" : "Before"}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* example dots (one per pair) */}
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginTop: 14 }}>
        {[0, 1, 2].map((p) => (
          <span
            key={p}
            style={{
              width: p === frame.pair ? 18 : 6,
              height: 6,
              borderRadius: 999,
              background: p === frame.pair ? "rgba(174,191,255,0.85)" : "rgba(255,255,255,0.18)",
              transition: "all .3s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function RedactionShowcaseSection() {
  return (
    <section
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 1180,
        margin: "0 auto",
        padding: "110px 40px 80px",
        textAlign: "center",
        fontFamily: "'Sora', sans-serif",
        color: "#fff",
      }}
    >
      <div style={reveal}>
        <div style={{ marginBottom: 40 }}>
          <GlassOrb />
        </div>

        <h2 style={{ margin: 0, fontSize: "clamp(36px,5vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
          Blur the sensitive,
          <br />
          ship the rest.
        </h2>
        <p style={{ margin: "26px auto 0", maxWidth: 600, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>
          Visora detects faces, text, license plates, and PII — then blurs or black-boxes them automatically, before the
          image ever leaves your stack.
        </p>
      </div>

      <div style={{ ...reveal, position: "relative", marginTop: 64 }}>
        <div
          style={{
            position: "absolute",
            top: -90,
            left: "12%",
            right: "12%",
            height: 200,
            background: "radial-gradient(ellipse at center, rgba(126,155,255,0.18), rgba(126,155,255,0) 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ ...cardStyle, maxWidth: 900, margin: "0 auto" }}>
          <CardChrome />
          <div style={{ position: "relative", zIndex: 3 }}>
            <BeforeAfterShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}
