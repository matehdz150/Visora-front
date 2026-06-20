import React from "react";

/**
 * Empty-state illustrations — faithful ports of the "Visora - Empty States"
 * Claude Design source. Each is a small floating 3D scene built from the same
 * lit-cube primitive as the brand mark. Pure/presentational; the animations
 * (`esFloat`, `esPulse`, `esSweep`) live in `globals.css`.
 */

const rgba = (a: number) => `rgba(126,155,255,${a})`;

interface CubeOpts {
  lit?: boolean;
  transform?: string;
  key?: string;
}

function litCube(size: number, opts: CubeOpts = {}): React.ReactElement {
  const s = size;
  const h = s / 2;
  const lit = opts.lit;
  const topBg = lit
    ? `radial-gradient(circle at 50% 38%, ${rgba(0.5)}, rgba(40,43,52,0) 72%), linear-gradient(150deg,#2b2e37,#16171c)`
    : "linear-gradient(150deg,#23252c 0%,#131419 78%)";
  const frontBg = lit
    ? `radial-gradient(circle at 50% 46%, ${rgba(0.32)}, rgba(18,19,24,0) 72%), linear-gradient(165deg,#191b21,#0c0d11)`
    : "linear-gradient(165deg,#15161b,#0b0c10)";
  const rightBg = lit ? "linear-gradient(165deg,#111218,#08090c)" : "linear-gradient(165deg,#0f1015,#070809)";
  const topB = lit ? rgba(0.4) : "rgba(255,255,255,0.08)";
  const sideB = lit ? rgba(0.18) : "rgba(255,255,255,0.05)";
  const faceBase: React.CSSProperties = { position: "absolute", top: 0, left: 0, width: s + "px", height: s + "px", backfaceVisibility: "hidden" };
  const face = (k: string, tf: string, bg: string, bd: string) =>
    React.createElement("div", { key: k, style: { ...faceBase, transform: tf, background: bg, border: "1px solid " + bd } });

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
          transform: "translateZ(" + (h + 3) + "px)", boxShadow: `0 0 14px 3px ${rgba(0.7)}`,
          animation: "esPulse 3s ease-in-out infinite",
        } as React.CSSProperties,
      }),
    );
  }
  const cs: React.CSSProperties = { position: "relative", width: s + "px", height: s + "px", transformStyle: "preserve-3d", transform: opts.transform || "none" };
  if (lit) cs.filter = `drop-shadow(0 0 18px ${rgba(0.3)})`;
  return React.createElement("div", { key: opts.key || "c", style: cs }, kids);
}

function scene(children: React.ReactNode, extra: React.CSSProperties = {}): React.ReactElement {
  return React.createElement(
    "div",
    {
      style: {
        position: "relative", width: "180px", height: "180px",
        perspective: "900px", perspectiveOrigin: "54% 42%",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "esFloat 8s ease-in-out infinite", ...extra,
      } as React.CSSProperties,
    },
    children,
  );
}

/** Overview — a monolith cluster (three stacked cubes) like the brand mark. */
export function OverviewIllustration(): React.ReactElement {
  const wrap = React.createElement(
    "div",
    { style: { position: "relative", transformStyle: "preserve-3d", transform: "rotateX(-26deg) rotateY(-38deg)" } as React.CSSProperties },
    [
      React.createElement("div", { key: "a", style: { position: "absolute", transform: "translate3d(-36px,-10px,0)" } }, litCube(64, { lit: false })),
      React.createElement("div", { key: "b", style: { position: "absolute", transform: "translate3d(28px,-40px,30px)" } }, litCube(64, { lit: true })),
      React.createElement("div", { key: "c", style: { position: "absolute", transform: "translate3d(20px,34px,-10px)" } }, litCube(64, { lit: false })),
    ],
  );
  return scene(wrap);
}

/** Moderations — a card being scanned by a sweeping light beam. */
export function ModerationsIllustration(): React.ReactElement {
  const card = React.createElement(
    "div",
    {
      key: "card",
      style: {
        position: "relative", width: "128px", height: "150px", borderRadius: "16px", overflow: "hidden",
        background: "linear-gradient(165deg,#16171d,#0b0c10)", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${rgba(0.12)}`, transform: "rotateX(6deg) rotateY(-10deg)",
      } as React.CSSProperties,
    },
    [
      React.createElement("div", { key: "img", style: { height: "92px", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 9px, rgba(255,255,255,0.02) 9px 18px)" } }),
      React.createElement("div", { key: "l1", style: { margin: "14px 14px 0", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.16)" } }),
      React.createElement("div", { key: "l2", style: { margin: "8px 14px 0", width: "60%", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.09)" } }),
      React.createElement("div", { key: "beam", style: { position: "absolute", top: 0, bottom: 0, width: "36px", background: `linear-gradient(90deg, rgba(126,155,255,0) 0%, ${rgba(0.55)} 50%, rgba(126,155,255,0) 100%)`, filter: "blur(3px)", animation: "esSweep 2.6s ease-in-out infinite" } as React.CSSProperties }),
      React.createElement("div", { key: "scan", style: { position: "absolute", left: 0, right: 0, top: "46px", height: "2px", background: rgba(0.8), boxShadow: `0 0 12px 2px ${rgba(0.6)}` } }),
    ],
  );
  return scene(card, { perspective: "700px" });
}

/** Projects — an empty dashed container with a glowing cube and a + badge. */
export function ProjectsIllustration(): React.ReactElement {
  const box = React.createElement(
    "div",
    {
      key: "box",
      style: {
        position: "relative", width: "150px", height: "128px", borderRadius: "18px",
        border: "1.5px dashed rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.015)",
        display: "flex", alignItems: "center", justifyContent: "center",
      } as React.CSSProperties,
    },
    React.createElement("div", { style: { transformStyle: "preserve-3d", transform: "rotateX(-24deg) rotateY(-36deg)" } as React.CSSProperties }, litCube(58, { lit: true })),
  );
  const plus = React.createElement(
    "div",
    {
      key: "plus",
      style: {
        position: "absolute", right: "20px", bottom: "14px", width: "36px", height: "36px", borderRadius: "50%",
        background: "#aebfff", color: "#050505", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", fontWeight: 600, boxShadow: `0 8px 22px ${rgba(0.4)}`,
      } as React.CSSProperties,
    },
    "+",
  );
  return scene([box, plus]);
}

/** API Keys — a stylized key: glowing ring + toothed shaft. */
export function ApiKeysIllustration(): React.ReactElement {
  const ring = React.createElement("div", {
    key: "ring",
    style: {
      width: "70px", height: "70px", borderRadius: "50%", border: "11px solid", borderColor: "#aebfff",
      boxShadow: `0 0 22px ${rgba(0.45)}, inset 0 0 10px ${rgba(0.3)}`, position: "relative",
    } as React.CSSProperties,
  });
  const shaft = React.createElement("div", { key: "shaft", style: { display: "flex", alignItems: "center" } }, [
    React.createElement("div", { key: "s", style: { width: "52px", height: "13px", borderRadius: "4px", background: "linear-gradient(180deg,#aebfff,#6f86d6)", boxShadow: `0 0 16px ${rgba(0.4)}` } }),
    React.createElement("div", { key: "t1", style: { width: "11px", height: "20px", marginLeft: "-2px", borderRadius: "0 3px 3px 0", background: "#8fa0d8" } }),
    React.createElement("div", { key: "t2", style: { width: "11px", height: "26px", marginLeft: "5px", borderRadius: "0 3px 3px 0", background: "#8fa0d8" } }),
  ]);
  const key = React.createElement("div", { style: { display: "flex", alignItems: "center", transform: "rotate(-32deg)" } }, [ring, shaft]);
  return scene(key, { perspective: "none" });
}

/** Policies — a decision panel: three vertical sliders with glowing thumbs. */
export function PoliciesIllustration(): React.ReactElement {
  const bar = (height: number, fill: number, lit: boolean) =>
    React.createElement(
      "div",
      {
        key: height + "" + fill,
        style: { position: "relative", width: "14px", height: height + "px", borderRadius: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column-reverse" } as React.CSSProperties,
      },
      [
        React.createElement("div", { key: "f", style: { width: "100%", height: fill + "%", borderRadius: "8px", background: `linear-gradient(180deg, ${rgba(0.8)}, ${rgba(0.35)})` } }),
        React.createElement("div", { key: "thumb", style: { position: "absolute", left: "50%", bottom: fill + "%", width: "22px", height: "22px", marginLeft: "-11px", marginBottom: "-11px", borderRadius: "50%", background: "#fff", boxShadow: lit ? `0 0 0 5px ${rgba(0.2)}, 0 4px 10px rgba(0,0,0,0.5)` : "0 4px 10px rgba(0,0,0,0.5)" } as React.CSSProperties }),
      ],
    );
  const panel = React.createElement(
    "div",
    {
      style: { display: "flex", gap: "22px", alignItems: "flex-end", padding: "22px 26px", borderRadius: "18px", background: "linear-gradient(165deg,#14151b,#0b0c10)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${rgba(0.1)}` } as React.CSSProperties,
    },
    [bar(110, 40, false), bar(110, 68, true), bar(110, 86, false)],
  );
  return scene(panel, { perspective: "none" });
}

/** Settings — a lit cube ringed by small orbiting cubes (gear-like). */
export function SettingsIllustration(): React.ReactElement {
  const center = React.createElement(
    "div",
    { key: "c", style: { transformStyle: "preserve-3d", transform: "rotateX(-26deg) rotateY(-38deg)" } as React.CSSProperties },
    litCube(70, { lit: true }),
  );
  const dot = (x: number, y: number) =>
    React.createElement("div", {
      key: x + "," + y,
      style: { position: "absolute", left: "50%", top: "50%", width: "16px", height: "16px", marginLeft: "-8px", marginTop: "-8px", transform: `translate(${x}px,${y}px)`, borderRadius: "4px", background: "linear-gradient(150deg,#23252c,#101116)", border: "1px solid rgba(255,255,255,0.12)" } as React.CSSProperties,
    });
  return scene([
    React.createElement("div", { key: "dots", style: { position: "absolute", inset: 0 } }, [dot(0, -78), dot(70, -30), dot(60, 50), dot(-66, 44), dot(-74, -26)]),
    center,
  ]);
}
