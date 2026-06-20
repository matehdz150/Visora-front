import React from "react";
import { motion } from "framer-motion";
import { loadingVariants } from "./animations";
import { VisoraLogo } from "@/components/VisoraLogo";

/**
 * Full-screen dashboard loading state — faithful port of the "Visora - Loading"
 * Claude Design source. Shown while the dashboard fetches its data. Pure /
 * CSS-driven; the `ld*` keyframes live in `globals.css`.
 */

const STEPS = [
  "Connecting to Visora",
  "Authenticating workspace",
  "Loading your projects",
  "Syncing moderation policies",
  "Preparing dashboard",
];

const rgba = (a: number) => `rgba(126,155,255,${a})`;

/** Floating, slowly spinning lit-cube cluster (the brand mark). */
function buildCube(): React.ReactElement {
  const s = 64;
  const h = s / 2;
  const step = 66;
  const faceBase: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: s + "px", height: s + "px", backfaceVisibility: "hidden" };
  const face = (k: string, tf: string, bg: string, bd: string) =>
    React.createElement("div", { key: k, style: { ...faceBase, transform: tf, background: bg, border: "1px solid " + bd } });

  const cube = (i: number, j: number, k: number, opts: { lit?: boolean } = {}) => {
    const lit = opts.lit;
    const tx = i * step, ty = j * step, tz = k * step;
    const topBg = lit
      ? `radial-gradient(circle at 50% 38%, ${rgba(0.5)}, rgba(40,43,52,0) 72%), linear-gradient(150deg,#2b2e37,#16171c)`
      : "linear-gradient(150deg,#23252c 0%,#131419 78%)";
    const frontBg = lit
      ? `radial-gradient(circle at 50% 46%, ${rgba(0.32)}, rgba(18,19,24,0) 72%), linear-gradient(165deg,#191b21,#0c0d11)`
      : "linear-gradient(165deg,#15161b,#0b0c10)";
    const rightBg = lit ? "linear-gradient(165deg,#111218,#08090c)" : "linear-gradient(165deg,#0f1015,#070809)";
    const topB = lit ? rgba(0.42) : "rgba(255,255,255,0.08)";
    const sideB = lit ? rgba(0.2) : "rgba(255,255,255,0.05)";
    const kids: React.ReactNode[] = [
      face("top", "rotateX(90deg) translateZ(" + h + "px)", topBg, topB),
      face("front", "translateZ(" + h + "px)", frontBg, sideB),
      face("right", "rotateY(90deg) translateZ(" + h + "px)", rightBg, sideB),
    ];
    if (lit) {
      kids.push(
        React.createElement("div", {
          key: "core",
          style: {
            position: "absolute", top: "50%", left: "50%", width: "11px", height: "11px", marginTop: "-5.5px", marginLeft: "-5.5px",
            borderRadius: "50%", background: `radial-gradient(circle, #eef2ff, #7e9bff 58%, ${rgba(0)} 100%)`,
            "--z": (h + 3) + "px", transform: "translateZ(" + (h + 3) + "px)", boxShadow: `0 0 16px 4px ${rgba(0.75)}`,
            animation: `ldCore ${2.4 + (Math.abs(i + j + k) % 3) * 0.5}s ease-in-out infinite`,
          } as React.CSSProperties,
        }),
      );
    }
    const cs: React.CSSProperties = { position: "absolute", top: "50%", left: "50%", width: s + "px", height: s + "px", marginLeft: -h + "px", marginTop: -h + "px", transformStyle: "preserve-3d", transform: `translate3d(${tx}px,${ty}px,${tz}px)` };
    if (lit) cs.filter = `drop-shadow(0 0 18px ${rgba(0.32)})`;
    return React.createElement("div", { key: i + "," + j + "," + k, style: cs }, kids);
  };

  const remove = new Set(["1,-1,-1", "-1,-1,1", "-1,-1,-1", "-1,1,-1"]);
  const litSet = new Set(["0,-1,1", "1,0,1", "1,-1,1", "-1,0,1", "0,0,0"]);
  const cubes: React.ReactNode[] = [];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const key = i + "," + j + "," + k;
        if (remove.has(key)) continue;
        cubes.push(cube(i, j, k, { lit: litSet.has(key) }));
      }

  return React.createElement(
    "div",
    { style: { position: "relative", width: "120px", height: "120px", perspective: "900px", perspectiveOrigin: "52% 42%", transformStyle: "preserve-3d" } as React.CSSProperties },
    React.createElement(
      "div",
      { style: { position: "absolute", top: "50%", left: "50%", transformStyle: "preserve-3d", transform: "rotateX(-26deg) rotateY(-40deg)", animation: "ldSpin 9s linear infinite" } as React.CSSProperties },
      cubes,
    ),
  );
}

const shimmerStyle: React.CSSProperties = {
  height: "22px", lineHeight: "22px", fontSize: "14px", fontWeight: 300, letterSpacing: "0.01em",
  background: "linear-gradient(90deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.32) 35%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.32) 65%, rgba(255,255,255,0.32) 100%)",
  backgroundSize: "200% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
  animation: "ldShimmer 2.6s linear infinite", whiteSpace: "nowrap",
};

export function DashboardLoading() {
  const carouselItems = [...STEPS, STEPS[0]];

  return (
    <motion.div variants={loadingVariants} initial="initial" animate="animate" exit="exit" style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 38%, #0c0e16 0%, #050505 60%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      {/* ambient glow */}
      <div style={{ position: "absolute", top: "38%", left: "50%", width: "620px", height: "540px", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(126,155,255,0.14), rgba(126,155,255,0) 62%)", filter: "blur(10px)", pointerEvents: "none", animation: "ldGlow 4s ease-in-out infinite" }} />

      {/* 3D object */}
      <div style={{ position: "relative", zIndex: 2, width: "200px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "56px" }}>
        <div style={{ position: "absolute", width: "188px", height: "188px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", borderTopColor: "rgba(126,155,255,0.55)", animation: "ldRingSpin 2.4s linear infinite" }} />
        <div style={{ position: "absolute", width: "150px", height: "150px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", borderBottomColor: "rgba(126,155,255,0.35)", animation: "ldRingSpin 3.4s linear infinite reverse" }} />
        <div style={{ animation: "ldFloat 4s ease-in-out infinite" }}>{buildCube()}</div>
      </div>

      {/* wordmark */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
        <VisoraLogo markSize={28} fontSize={22} tone="light" />
      </div>

      {/* status carousel with shimmer */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "4px", marginBottom: "30px" }}>
        <div style={{ height: "22px", overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", animation: "ldCarousel 9s steps(1) infinite" }}>
            {carouselItems.map((t, i) => (
              <span key={i} style={shimmerStyle}>{t}</span>
            ))}
          </div>
        </div>
        <span style={{ display: "inline-flex", gap: "2px", marginLeft: "2px", alignSelf: "flex-end", paddingBottom: "5px" }}>
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", animation: "ldDot 1.4s ease-in-out infinite" }} />
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", animation: "ldDot 1.4s ease-in-out .2s infinite" }} />
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", animation: "ldDot 1.4s ease-in-out .4s infinite" }} />
        </span>
      </div>

      {/* progress bar */}
      <div style={{ position: "relative", zIndex: 2, width: "240px", height: "3px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, #6f86d6, #aebfff)", boxShadow: "0 0 12px rgba(126,155,255,0.6)", animation: "ldProgress 9s cubic-bezier(.4,.7,.3,1) infinite" }} />
      </div>

      {/* footer hint */}
      <div style={{ position: "absolute", bottom: "36px", left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.14em", color: "rgba(255,255,255,0.28)" }}>SECURING WORKSPACE · us-east-1</span>
      </div>
    </motion.div>
  );
}
