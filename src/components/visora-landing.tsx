"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VisoraLogo } from "@/components/VisoraLogo";
import { IntegrationSection } from "@/components/IntegrationSection";
import { DeveloperExperienceSection } from "@/components/DeveloperExperienceSection";
import { RedactionShowcaseSection } from "@/components/RedactionShowcaseSection";
import { ModerationShowcaseSection } from "@/components/ModerationShowcaseSection";
import { HeroTilt } from "@/components/HeroTilt";
import {
  clearSession,
  getCurrentUser,
  getStoredSession,
  type CurrentUser,
} from "@/lib/visora-api";

/**
 * Visora — Image moderation landing page.
 *
 * Faithful port of the "Visora.dc.html" Claude Design source. The original
 * built the hero 3D cube cluster, policy-mode cards and security list
 * imperatively with React.createElement and revealed sections on scroll;
 * that logic is reproduced here. Styling stays inline (as in the source) to
 * preserve pixel fidelity.
 */

const MONO = "var(--font-jetbrains), monospace";

type Props = {
  accent?: string;
  motion?: boolean;
};

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* -------------------------------------------------------------------------- */
/* Hero — floating 3D cube cluster                                            */
/* -------------------------------------------------------------------------- */
function buildHero(accent: string, motion: boolean): React.ReactNode {
  const [ar, ag, ab] = hexToRgb(accent);
  const rgba = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const s = 78,
    h = s / 2,
    step = 80;

  const faceBase: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: s + "px",
    height: s + "px",
    backfaceVisibility: "hidden",
  };
  const face = (key: string, tf: string, bg: string, border: string) =>
    React.createElement("div", {
      key,
      style: {
        ...faceBase,
        transform: tf,
        background: bg,
        border: "1px solid " + border,
      },
    });

  const cube = (
    i: number,
    j: number,
    k: number,
    opts: {
      lit?: boolean;
      detach?: { x?: number; y?: number; z?: number };
      tag?: string;
    } = {},
  ) => {
    const lit = opts.lit;
    const d = opts.detach || {};
    const tx = i * step + (d.x || 0),
      ty = j * step + (d.y || 0),
      tz = k * step + (d.z || 0);
    const topBg = lit
      ? `radial-gradient(circle at 50% 38%, ${rgba(0.5)}, rgba(40,43,52,0) 72%), linear-gradient(150deg,#2b2e37,#16171c)`
      : "linear-gradient(150deg,#24262d 0%,#131419 78%)";
    const frontBg = lit
      ? `radial-gradient(circle at 50% 46%, ${rgba(0.34)}, rgba(18,19,24,0) 72%), linear-gradient(165deg,#191b21,#0c0d11)`
      : "linear-gradient(165deg,#15161b,#0b0c10)";
    const rightBg = lit
      ? "linear-gradient(165deg,#121319,#08090c)"
      : "linear-gradient(165deg,#0f1015,#070809)";
    const topB = lit ? rgba(0.42) : "rgba(255,255,255,0.07)";
    const sideB = lit ? rgba(0.2) : "rgba(255,255,255,0.045)";
    // shadowed faces — close the cube so it stays solid when rotated
    const bottomBg = "linear-gradient(150deg,#0d0e12,#060708)";
    const backBg = "linear-gradient(165deg,#121318,#08090c)";
    const leftBg = "linear-gradient(165deg,#0e0f14,#060708)";
    const kids: React.ReactNode[] = [
      face("top", "rotateX(90deg) translateZ(" + h + "px)", topBg, topB),
      face("front", "translateZ(" + h + "px)", frontBg, sideB),
      face("right", "rotateY(90deg) translateZ(" + h + "px)", rightBg, sideB),
      face("bottom", "rotateX(-90deg) translateZ(" + h + "px)", bottomBg, topB),
      face("back", "rotateY(180deg) translateZ(" + h + "px)", backBg, sideB),
      face("left", "rotateY(-90deg) translateZ(" + h + "px)", leftBg, sideB),
    ];
    if (lit) {
      kids.push(
        React.createElement("div", {
          key: "core",
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "13px",
            height: "13px",
            marginTop: "-6.5px",
            marginLeft: "-6.5px",
            borderRadius: "50%",
            background: `radial-gradient(circle, #eef2ff, ${accent} 58%, ${rgba(0)} 100%)`,
            transform: "translateZ(" + (h + 3) + "px)",
            boxShadow: `0 0 16px 4px ${rgba(0.75)}`,
            animation: motion
              ? `visoraPulse ${3 + (Math.abs(i + j + k) % 3) * 0.7}s ease-in-out infinite`
              : "none",
          } as React.CSSProperties,
        }),
      );
    }
    const cs: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: s + "px",
      height: s + "px",
      marginLeft: -h + "px",
      marginTop: -h + "px",
      transformStyle: "preserve-3d",
      transform: `translate3d(${tx}px,${ty}px,${tz}px)`,
    };
    if (lit) cs.filter = `drop-shadow(0 0 22px ${rgba(0.34)})`;
    return React.createElement(
      "div",
      { key: i + "," + j + "," + k + (opts.tag || ""), style: cs },
      kids,
    );
  };

  const remove = new Set([
    "1,-1,-1",
    "-1,-1,1",
    "-1,-1,-1",
    "-1,1,-1",
    "0,1,1",
  ]);
  const litSet = new Set(["0,-1,1", "1,0,1", "1,-1,1", "-1,0,1"]);
  const cubes: React.ReactNode[] = [];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const key = i + "," + j + "," + k;
        if (remove.has(key)) continue;
        cubes.push(cube(i, j, k, { lit: litSet.has(key) }));
      }
  // detached floating module below-front
  cubes.push(
    cube(0, 1, 1, { detach: { x: -8, y: 70, z: 34 }, lit: true, tag: "-d" }),
  );

  const cluster = React.createElement(
    "div",
    {
      key: "cl",
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transformStyle: "preserve-3d",
        transform: "rotateX(-26deg) rotateY(-40deg)",
        animation: motion ? "visoraSpin 26s ease-in-out infinite" : "none",
      } as React.CSSProperties,
    },
    cubes,
  );

  const glow = React.createElement("div", {
    key: "gl",
    style: {
      position: "absolute",
      top: "46%",
      left: "52%",
      width: "760px",
      height: "620px",
      transform: "translate(-50%,-50%)",
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, ${rgba(0.16)}, ${rgba(0)} 60%)`,
      filter: "blur(20px)",
      pointerEvents: "none",
    } as React.CSSProperties,
  });

  const streak = React.createElement("div", {
    key: "st",
    style: {
      position: "absolute",
      bottom: "78px",
      left: "-12%",
      width: "124%",
      height: "2px",
      background:
        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 48%, rgba(255,255,255,0) 100%)",
      transform: "rotate(-7deg)",
      filter: "blur(1px)",
      opacity: 0.55,
      pointerEvents: "none",
    } as React.CSSProperties,
  });

  return React.createElement(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "560px",
        perspective: "1500px",
        perspectiveOrigin: "54% 42%",
        transformStyle: "preserve-3d",
        animation: motion ? "visoraFloat 9s ease-in-out infinite" : "none",
      } as React.CSSProperties,
    },
    [glow, cluster, streak],
  );
}

/* -------------------------------------------------------------------------- */
/* Policy engine — three mode cards                                           */
/* -------------------------------------------------------------------------- */
function buildModes(accent: string): React.ReactNode {
  const [ar, ag, ab] = hexToRgb(accent);
  const rgba = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const modes = [
    {
      name: "Strict",
      desc: "Maximum caution. Flags anything borderline. Best for childrenfacing and brand-safe surfaces.",
      active: 14,
      threshold: "30%",
    },
    {
      name: "Balanced",
      desc: "The default. Catches clear violations while letting safe content through untouched.",
      active: 8,
      threshold: "60%",
    },
    {
      name: "Relaxed",
      desc: "Permissive. Blocks only high-confidence violations. Best for mature, opt-in communities.",
      active: 3,
      threshold: "85%",
    },
  ];
  return modes.map((m, idx) => {
    const cells: React.ReactNode[] = [];
    for (let c = 0; c < 16; c++) {
      const on = c < m.active;
      cells.push(
        React.createElement("span", {
          key: c,
          style: {
            aspectRatio: "1",
            borderRadius: "3px",
            background: on ? rgba(0.85) : "rgba(255,255,255,0.05)",
            boxShadow: on ? `0 0 8px ${rgba(0.5)}` : "none",
            transition: "all .3s",
          } as React.CSSProperties,
        }),
      );
    }
    const grid = React.createElement(
      "div",
      {
        key: "g",
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "6px",
          marginBottom: "24px",
        } as React.CSSProperties,
      },
      cells,
    );
    const header = React.createElement(
      "div",
      {
        key: "h",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        } as React.CSSProperties,
      },
      [
        React.createElement(
          "span",
          {
            key: "n",
            style: {
              fontSize: "20px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            },
          },
          m.name,
        ),
        React.createElement(
          "span",
          {
            key: "t",
            style: {
              fontFamily: MONO,
              fontSize: "11px",
              color: rgba(0.85),
              border: "1px solid " + rgba(0.3),
              padding: "3px 9px",
              borderRadius: "20px",
            } as React.CSSProperties,
          },
          "thr " + m.threshold,
        ),
      ],
    );
    const desc = React.createElement(
      "p",
      {
        key: "d",
        style: {
          margin: 0,
          fontSize: "14px",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.5)",
          fontWeight: 300,
        } as React.CSSProperties,
      },
      m.desc,
    );
    return React.createElement(
      "div",
      {
        key: m.name,
        "data-reveal": "",
        "data-reveal-delay": String(idx * 100),
        style: {
          opacity: 0,
          transform: "translateY(26px)",
          transition:
            "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)",
          padding: "30px",
          borderRadius: "18px",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          border: "1px solid rgba(255,255,255,0.08)",
        } as React.CSSProperties,
      },
      [header, grid, desc],
    );
  });
}

/* -------------------------------------------------------------------------- */
/* Security — isolated feature list                                           */
/* -------------------------------------------------------------------------- */
function buildSecurity(accent: string): React.ReactNode {
  const [ar, ag, ab] = hexToRgb(accent);
  const rgba = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const items = [
    {
      t: "Project-scoped uploads",
      d: "Images are bound to the project that created them — never visible across tenants.",
      icon: "scope",
    },
    {
      t: "API key authentication",
      d: "Scoped, rotatable keys with per-project permissions.",
      icon: "key",
    },
    {
      t: "Isolated customer data",
      d: "No shared moderation context between accounts.",
      icon: "iso",
    },
    {
      t: "Private object storage",
      d: "Uploaded images stay isolated, encrypted, and access-controlled.",
      icon: "store",
    },
    {
      t: "Usage controls",
      d: "Plans, monthly limits, and project settings keep moderation predictable.",
      icon: "scale",
    },
  ];
  const iconFor = (name: string) => {
    const base: React.CSSProperties = {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: `radial-gradient(circle at 38% 28%, ${rgba(0.16)}, rgba(255,255,255,0.02))`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    };
    let inner: React.ReactNode;
    if (name === "scope")
      inner = React.createElement("span", {
        style: {
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "2px solid " + rgba(0.9),
          boxShadow: `0 0 8px ${rgba(0.4)}`,
        } as React.CSSProperties,
      });
    else if (name === "key")
      inner = React.createElement("span", {
        style: {
          width: "14px",
          height: "14px",
          transform: "rotate(45deg)",
          background: rgba(0.9),
          borderRadius: "3px",
          boxShadow: `0 0 8px ${rgba(0.4)}`,
        } as React.CSSProperties,
      });
    else if (name === "iso")
      inner = React.createElement(
        "span",
        { style: { display: "flex", gap: "4px" } },
        [
          React.createElement("span", {
            key: 1,
            style: {
              width: "6px",
              height: "16px",
              borderRadius: "2px",
              background: rgba(0.9),
            },
          }),
          React.createElement("span", {
            key: 2,
            style: {
              width: "6px",
              height: "16px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.25)",
            },
          }),
        ],
      );
    else if (name === "store")
      inner = React.createElement(
        "span",
        { style: { display: "flex", flexDirection: "column", gap: "3px" } },
        [
          React.createElement("span", {
            key: 1,
            style: {
              width: "18px",
              height: "5px",
              borderRadius: "2px",
              background: rgba(0.9),
            },
          }),
          React.createElement("span", {
            key: 2,
            style: {
              width: "18px",
              height: "5px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.25)",
            },
          }),
          React.createElement("span", {
            key: 3,
            style: {
              width: "18px",
              height: "5px",
              borderRadius: "2px",
              background: "rgba(255,255,255,0.25)",
            },
          }),
        ],
      );
    else
      inner = React.createElement(
        "span",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3px",
          },
        },
        [
          React.createElement("span", {
            key: 1,
            style: {
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: rgba(0.9),
            },
          }),
          React.createElement("span", {
            key: 2,
            style: {
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
            },
          }),
          React.createElement("span", {
            key: 3,
            style: {
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
            },
          }),
          React.createElement("span", {
            key: 4,
            style: {
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: rgba(0.9),
            },
          }),
        ],
      );
    return React.createElement("div", { key: "ic", style: base }, inner);
  };
  return items.map((it, idx) =>
    React.createElement(
      "div",
      {
        key: it.t,
        "data-reveal": "",
        "data-reveal-delay": String(idx * 70),
        style: {
          opacity: 0,
          transform: "translateY(22px)",
          transition:
            "opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1)",
          display: "flex",
          gap: "18px",
          alignItems: "flex-start",
          padding: "22px 24px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
        } as React.CSSProperties,
      },
      [
        iconFor(it.icon),
        React.createElement("div", { key: "tx" }, [
          React.createElement(
            "h3",
            {
              key: "t",
              style: {
                margin: "2px 0 6px",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              } as React.CSSProperties,
            },
            it.t,
          ),
          React.createElement(
            "p",
            {
              key: "d",
              style: {
                margin: 0,
                fontSize: "14px",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.5)",
                fontWeight: 300,
              } as React.CSSProperties,
            },
            it.d,
          ),
        ]),
      ],
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* Scroll behaviour: reveal-on-view + nav background on scroll                */
/* -------------------------------------------------------------------------- */
function useScrollEffects() {
  useEffect(() => {
    const reveal = () => {
      const h = window.innerHeight;
      document
        .querySelectorAll<HTMLElement & { __shown?: boolean }>("[data-reveal]")
        .forEach((el) => {
          if (el.__shown) return;
          const r = el.getBoundingClientRect();
          if (r.top < h - 50 && r.bottom > -10) {
            el.__shown = true;
            const delay = parseFloat(
              el.getAttribute("data-reveal-delay") || "0",
            );
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "none";
            }, delay);
          }
        });
    };

    const nav = document.querySelector<HTMLElement>("[data-nav]");
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (nav) {
        if (y > 16) {
          nav.style.background = "rgba(5,5,5,0.72)";
          nav.style.borderBottomColor = "rgba(255,255,255,0.08)";
          nav.style.backdropFilter = "blur(14px)";
          nav.style.setProperty("-webkit-backdrop-filter", "blur(14px)");
        } else {
          nav.style.background = "transparent";
          nav.style.borderBottomColor = "rgba(255,255,255,0)";
          nav.style.backdropFilter = "none";
          nav.style.setProperty("-webkit-backdrop-filter", "none");
        }
      }
      reveal();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", reveal, { passive: true });
    onScroll();
    requestAnimationFrame(reveal);
    const t1 = setTimeout(reveal, 220);
    const t2 = setTimeout(reveal, 650);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", reveal);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function VisoraLanding({
  accent = "#7e9bff",
  motion = true,
}: Props) {
  useScrollEffects();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileNavSections: { title: string; links: [string, string, string][] }[] = [
    { title: "Features", links: [["Moderation", "/docs#moderate", "Scan uploads and image keys."], ["Redaction", "/features/redaction", "Blur faces, text, and plates."], ["Verify", "/features/verify", "Match an ID to a selfie."], ["Webhooks", "/features/webhooks", "Deliver signed events."], ["Review Queue", "/docs#review-queue", "Resolve manual decisions."], ["Policies", "/docs#policies", "Set project rules."]] },
    { title: "Documentation", links: [["Moderation", "/docs", "API reference"], ["Redaction", "/docs/redaction", "Blur workflows"], ["Verify", "/docs/verify", "Identity verification"], ["Webhooks", "/docs/webhooks", "Signed event delivery"]] },
    { title: "Help", links: [["Contact", "/contact", "Send us a message"], ["Support", "mailto:support@visoracloud.com", "support@visoracloud.com"], ["Docs", "/docs", "Integration guides"]] },
  ];
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const docsRef = useRef<HTMLDivElement | null>(null);
  const helpRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeMenusOnOutsideClick(event: PointerEvent) {
      const target = event.target as Node;
      if (!featuresRef.current?.contains(target)) setFeaturesOpen(false);
      if (!docsRef.current?.contains(target)) setDocsOpen(false);
      if (!helpRef.current?.contains(target)) setHelpOpen(false);
    }

    if (featuresOpen || docsOpen || helpOpen)
      document.addEventListener("pointerdown", closeMenusOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeMenusOnOutsideClick);
  }, [featuresOpen, docsOpen, helpOpen]);

  useEffect(() => {
    let cancelled = false;
    const session = getStoredSession();

    if (!session?.idToken) return;

    getCurrentUser(session.idToken)
      .then((user) => {
        if (!cancelled) setCurrentUser(user);
      })
      .catch(() => {
        clearSession();
        if (!cancelled) setCurrentUser(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="lp-root"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#050505",
        overflow: "hidden",
      }}
    >
      {/* ambient top glow */}
      <div
        style={{
          position: "absolute",
          top: "-340px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1100px",
          height: "760px",
          background:
            "radial-gradient(ellipse at center, rgba(126,155,255,0.10), rgba(126,155,255,0) 62%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* NAV */}
      <nav
        data-nav=""
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 40px",
          background: "transparent",
          borderBottom: "1px solid rgba(255,255,255,0)",
          transition:
            "background .4s ease, border-color .4s ease, backdrop-filter .4s ease",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <VisoraLogo markSize={26} fontSize={18} tone="light" />
        </Link>
        <div
          className="lp-nav-mid"
          style={{ display: "flex", alignItems: "center", gap: "34px" }}
        >
          <div
            ref={featuresRef}
            onMouseEnter={() => {
              setFeaturesOpen(true);
              setDocsOpen(false);
              setHelpOpen(false);
            }}
            onMouseLeave={() => setFeaturesOpen(false)}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="v-navlink"
              onMouseEnter={() => {
                setFeaturesOpen(true);
                setDocsOpen(false);
                setHelpOpen(false);
              }}
              onFocus={() => {
                setFeaturesOpen(true);
                setDocsOpen(false);
                setHelpOpen(false);
              }}
              onClick={() => {
                setFeaturesOpen(true);
                setDocsOpen(false);
                setHelpOpen(false);
              }}
              aria-expanded={featuresOpen}
              aria-haspopup="menu"
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                transition: "color .2s",
              }}
            >
              Features
              <span
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRight: "1.5px solid currentColor",
                  borderBottom: "1.5px solid currentColor",
                  transform: featuresOpen
                    ? "rotate(225deg) translateY(-1px)"
                    : "rotate(45deg) translateY(-2px)",
                  transition: "transform .18s ease",
                  opacity: 0.75,
                }}
              />
            </button>
            {featuresOpen ? (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-28px",
                    right: "-28px",
                    height: "14px",
                  }}
                />
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 14px)",
                    left: "-18px",
                    width: "430px",
                    display: "grid",
                    gridTemplateColumns: "142px 1fr",
                    gap: "14px",
                    padding: "16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(18,18,20,0.94))",
                    boxShadow: "0 34px 90px rgba(0,0,0,0.64)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "9px 6px",
                    }}
                  >
                    {[
                      [
                        "Moderation",
                        "/docs#moderate",
                        "Scan uploads and image keys.",
                      ],
                      [
                        "Redaction",
                        "/features/redaction",
                        "Blur faces, text, and plates.",
                      ],
                      [
                        "Verify",
                        "/features/verify",
                        "Match an ID to a selfie.",
                      ],
                      [
                        "Webhooks",
                        "/features/webhooks",
                        "Deliver signed events.",
                      ],
                      [
                        "Review Queue",
                        "/docs#review-queue",
                        "Resolve manual decisions.",
                      ],
                      ["Policies", "/docs#policies", "Set project rules."],
                    ].map(([label, href, hint]) => (
                      <a
                        key={label}
                        href={href}
                        role="menuitem"
                        className="nav-dropdown-link"
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className="nav-dropdown-title"
                          style={{
                            fontSize:
                              label === "Review Queue" || label === "Moderation"
                                ? "20px"
                                : "21px",
                            lineHeight: 1.1,
                            letterSpacing: "-0.035em",
                            color:
                              label === "Moderation"
                                ? "#fff"
                                : "rgba(255,255,255,0.58)",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          className="nav-dropdown-hint"
                          style={{
                            marginTop: "5px",
                            fontSize: "11.5px",
                            color: "rgba(255,255,255,0.34)",
                          }}
                        >
                          {hint}
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href="/features/redaction"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "168px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background:
                        "radial-gradient(circle at 70% 10%, rgba(126,155,255,0.18), rgba(255,255,255,0.035) 42%, rgba(255,255,255,0.02))",
                      padding: "18px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.28,
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          fontSize: "22px",
                          lineHeight: 1.15,
                          letterSpacing: "-0.035em",
                          color: "#fff",
                          marginBottom: "8px",
                        }}
                      >
                        Redaction
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12.5px",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.52)",
                        }}
                      >
                        Create paid-plan projects that return processed images
                        with sensitive regions hidden.
                      </p>
                    </div>
                    <span
                      style={{
                        position: "relative",
                        fontSize: "12.5px",
                        color: "#aebfff",
                        fontWeight: 500,
                      }}
                    >
                      Explore redaction →
                    </span>
                  </a>
                </div>
              </>
            ) : null}
          </div>
          <div
            ref={docsRef}
            onMouseEnter={() => {
              setDocsOpen(true);
              setFeaturesOpen(false);
              setHelpOpen(false);
            }}
            onMouseLeave={() => setDocsOpen(false)}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="v-navlink"
              onMouseEnter={() => {
                setDocsOpen(true);
                setFeaturesOpen(false);
                setHelpOpen(false);
              }}
              onFocus={() => {
                setDocsOpen(true);
                setFeaturesOpen(false);
                setHelpOpen(false);
              }}
              onClick={() => {
                setDocsOpen(true);
                setFeaturesOpen(false);
                setHelpOpen(false);
              }}
              aria-expanded={docsOpen}
              aria-haspopup="menu"
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                transition: "color .2s",
              }}
            >
              Documentation
              <span
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRight: "1.5px solid currentColor",
                  borderBottom: "1.5px solid currentColor",
                  transform: docsOpen
                    ? "rotate(225deg) translateY(-1px)"
                    : "rotate(45deg) translateY(-2px)",
                  transition: "transform .18s ease",
                  opacity: 0.75,
                }}
              />
            </button>
            {docsOpen ? (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-28px",
                    right: "-28px",
                    height: "14px",
                  }}
                />
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 14px)",
                    left: "-18px",
                    width: "430px",
                    display: "grid",
                    gridTemplateColumns: "142px 1fr",
                    gap: "14px",
                    padding: "16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(18,18,20,0.94))",
                    boxShadow: "0 28px 76px rgba(0,0,0,0.58)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "9px 6px",
                    }}
                  >
                    {[
                      ["Moderation", "/docs", "API reference"],
                      ["Redaction", "/docs/redaction", "Blur workflows"],
                      ["Verify", "/docs/verify", "Identity verification"],
                      ["Webhooks", "/docs/webhooks", "Signed event delivery"],
                    ].map(([label, href, hint]) => (
                      <a
                        key={label}
                        href={href}
                        role="menuitem"
                        className="nav-dropdown-link"
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className="nav-dropdown-title"
                          style={{
                            fontSize: "21px",
                            lineHeight: 1.1,
                            letterSpacing: "-0.035em",
                            color:
                              label === "Moderation"
                                ? "#fff"
                                : "rgba(255,255,255,0.58)",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          className="nav-dropdown-hint"
                          style={{
                            marginTop: "5px",
                            fontSize: "11.5px",
                            color: "rgba(255,255,255,0.34)",
                          }}
                        >
                          {hint}
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href="/docs/redaction"
                    className="nav-dropdown-card"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "168px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background:
                        "radial-gradient(circle at 70% 10%, rgba(126,155,255,0.18), rgba(255,255,255,0.035) 42%, rgba(255,255,255,0.02))",
                      padding: "18px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.28,
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          fontSize: "22px",
                          lineHeight: 1.15,
                          letterSpacing: "-0.035em",
                          color: "#fff",
                          marginBottom: "8px",
                        }}
                      >
                        Developer docs
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12.5px",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.52)",
                        }}
                      >
                        Choose the moderation or redaction guide for your
                        integration.
                      </p>
                    </div>
                    <span
                      style={{
                        position: "relative",
                        fontSize: "12.5px",
                        color: "#aebfff",
                        fontWeight: 500,
                      }}
                    >
                      Open redaction docs →
                    </span>
                  </a>
                </div>
              </>
            ) : null}
          </div>
          <a
            href="/pricing"
            className="v-navlink"
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              transition: "color .2s",
            }}
          >
            Pricing
          </a>
          <div
            ref={helpRef}
            onMouseEnter={() => {
              setHelpOpen(true);
              setFeaturesOpen(false);
              setDocsOpen(false);
            }}
            onMouseLeave={() => setHelpOpen(false)}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="v-navlink"
              onMouseEnter={() => {
                setHelpOpen(true);
                setFeaturesOpen(false);
                setDocsOpen(false);
              }}
              onFocus={() => {
                setHelpOpen(true);
                setFeaturesOpen(false);
                setDocsOpen(false);
              }}
              onClick={() => {
                setHelpOpen(true);
                setFeaturesOpen(false);
                setDocsOpen(false);
              }}
              aria-expanded={helpOpen}
              aria-haspopup="menu"
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "inherit",
                fontSize: "14px",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                transition: "color .2s",
              }}
            >
              Help
              <span
                aria-hidden="true"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRight: "1.5px solid currentColor",
                  borderBottom: "1.5px solid currentColor",
                  transform: helpOpen
                    ? "rotate(225deg) translateY(-1px)"
                    : "rotate(45deg) translateY(-2px)",
                  transition: "transform .18s ease",
                  opacity: 0.75,
                }}
              />
            </button>
            {helpOpen ? (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "-28px",
                    right: "-190px",
                    height: "14px",
                  }}
                />
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 14px)",
                    right: "-160px",
                    width: "430px",
                    display: "grid",
                    gridTemplateColumns: "142px 1fr",
                    gap: "14px",
                    padding: "16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background:
                      "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(18,18,20,0.94))",
                    boxShadow: "0 34px 90px rgba(0,0,0,0.64)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "9px 6px",
                    }}
                  >
                    {[
                      ["Contact", "/contact", "Send us a message"],
                      [
                        "Support",
                        "mailto:support@visoracloud.com",
                        "support@visoracloud.com",
                      ],
                      ["Docs", "/docs", "Integration guides"],
                    ].map(([label, href, hint]) => (
                      <a
                        key={label}
                        href={href}
                        className="nav-dropdown-link"
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          className="nav-dropdown-title"
                          style={{
                            fontSize: "21px",
                            lineHeight: 1.1,
                            letterSpacing: "-0.035em",
                            color:
                              label === "Contact"
                                ? "#fff"
                                : "rgba(255,255,255,0.58)",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          className="nav-dropdown-hint"
                          style={{
                            marginTop: "5px",
                            fontSize: "11.5px",
                            color: "rgba(255,255,255,0.34)",
                          }}
                        >
                          {hint}
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href="/contact"
                    className="nav-dropdown-card"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "168px",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background:
                        "radial-gradient(circle at 70% 10%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.02))",
                      padding: "18px",
                      textDecoration: "none",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.28,
                      }}
                    />
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          fontSize: "22px",
                          lineHeight: 1.15,
                          letterSpacing: "-0.035em",
                          color: "#fff",
                          marginBottom: "8px",
                        }}
                      >
                        Need help integrating?
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12.5px",
                          lineHeight: 1.55,
                          color: "rgba(255,255,255,0.52)",
                        }}
                      >
                        Tell us what you are building and we will point you in
                        the right direction.
                      </p>
                    </div>
                    <span
                      style={{
                        position: "relative",
                        fontSize: "12.5px",
                        color: "#aebfff",
                        fontWeight: 500,
                      }}
                    >
                      Open contact →
                    </span>
                  </a>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {currentUser ? (
            <>
              <span
                className="lp-nav-mid"
                title={currentUser.email}
                style={{
                  display: "inline-block",
                  maxWidth: "220px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {currentUser.email}
              </span>
              <Link
                href="/dashboard"
                className="v-btn-primary-sm"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#050505",
                  background: "#fff",
                  padding: "9px 18px",
                  borderRadius: "9px",
                  textDecoration: "none",
                  transition: "transform .2s, box-shadow .2s",
                }}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="lp-nav-mid v-navlink"
                style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  transition: "color .2s",
                }}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="v-btn-primary-sm"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#050505",
                  background: "#fff",
                  padding: "9px 18px",
                  borderRadius: "9px",
                  textDecoration: "none",
                  transition: "transform .2s, box-shadow .2s",
                }}
              >
                Start Free
              </Link>
            </>
          )}
          <button
            type="button"
            className="lp-nav-burger"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => { setMobileOpen((value) => !value); setFeaturesOpen(false); setDocsOpen(false); setHelpOpen(false); }}
            style={{ alignItems: "center", justifyContent: "center", width: "38px", height: "38px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", padding: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (<><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>) : (<><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>)}
            </svg>
          </button>
        </div>

        {mobileOpen ? (
          <div className="lp-nav-mobile" style={{ position: "absolute", top: "100%", left: 0, right: 0, maxHeight: "calc(100vh - 68px)", overflowY: "auto", padding: "6px 20px 24px", background: "rgba(5,5,5,0.99)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
            {mobileNavSections.map((section) => (
              <div key={section.title} style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.36)", marginBottom: "8px" }}>{section.title}</div>
                <div style={{ display: "grid", gap: "2px" }}>
                  {section.links.map(([label, href, hint]) => (
                    <a key={label} href={href} onClick={() => setMobileOpen(false)} style={{ display: "flex", flexDirection: "column", padding: "9px 8px", borderRadius: "10px", textDecoration: "none" }}>
                      <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{hint}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 0 0", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <a href="/pricing" onClick={() => setMobileOpen(false)} style={{ padding: "9px 8px", borderRadius: "10px", fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: 500, textDecoration: "none" }}>Pricing</a>
              {!currentUser ? (
                <a href="/login" onClick={() => setMobileOpen(false)} style={{ padding: "9px 8px", borderRadius: "10px", fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: 500, textDecoration: "none" }}>Log In</a>
              ) : null}
            </div>
          </div>
        ) : null}
      </nav>

      {/* HERO */}
      <section
        className="lp-hero r-stack"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "188px 40px 110px",
          display: "grid",
          gridTemplateColumns: "1.02fr 1fr",
          gap: "40px",
          alignItems: "center",
        }}
      >
        {/* left */}
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: "translateY(26px)",
            transition:
              "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(40px, 5vw, 70px)",
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              color: "#fff",
            }}
          >
            <span className="lp-hero-title-desktop">
              The image trust layer for modern applications.
            </span>
            <span className="lp-hero-title-mobile">
              <span>The image</span>
              <span>trust layer</span>
              <span>for modern</span>
              <span>applications.</span>
            </span>
          </h1>
          <p
            style={{
              margin: "28px 0 0",
              maxWidth: "490px",
              fontSize: "18px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.62)",
              fontWeight: 300,
            }}
          >
            Moderate unsafe content, anonymize faces and PII, and verify real identities — all from a single API, built to drop into modern applications.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginTop: "38px",
            }}
          >
            <Link
              href={currentUser ? "/dashboard" : "/register"}
              className="v-btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 500,
                color: "#050505",
                background: "#fff",
                padding: "13px 24px",
                borderRadius: "11px",
                textDecoration: "none",
                transition: "transform .2s, box-shadow .2s",
              }}
            >
              {currentUser ? "Go to Dashboard" : "Start Free"}
            </Link>
            <Link
              href="/docs"
              className="v-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "13px 24px",
                borderRadius: "11px",
                textDecoration: "none",
                transition: "background .2s, border-color .2s",
              }}
            >
              Documentation
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px 26px",
              marginTop: "40px",
            }}
          >
            {[
              "Content moderation",
              "Face & PII redaction",
              "Identity verification",
            ].map((label) => (
              <div
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "9px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: "1px solid rgba(126,155,255,0.4)",
                    color: "#aebfff",
                    fontSize: "10px",
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* right: 3D object */}
        <div
          className="lp-hero-visual"
          style={{ position: "relative", minHeight: "560px" }}
        >
          <HeroTilt>{buildHero(accent, motion)}</HeroTilt>
        </div>
      </section>

      {/* PRODUCT READINESS */}
      <section
        data-reveal=""
        style={{
          opacity: 0,
          transform: "translateY(26px)",
          transition:
            "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)",
          position: "relative",
          zIndex: 1,
          maxWidth: "2180px",
          margin: "0 auto",
          padding: "22px 40px 82px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "relative",
            height: "74px",
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            borderRight: "1px solid rgba(255,255,255,0.1)",
            borderTopLeftRadius: "34px",
            borderTopRightRadius: "34px",
            background:
              "black",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-78px",
              left: "50%",
              width: "460px",
              height: "170px",
              transform: "translateX(-50%)",
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.16), rgba(255,255,255,0.045) 42%, rgba(255,255,255,0) 72%)",
              filter: "blur(18px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: "620px",
              height: "1px",
              transform: "translateX(-50%)",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.22), rgba(255,255,255,0))",
            }}
          />
        </div>
      </section>

      {/* DEVELOPERS — INTEGRATION */}
      <IntegrationSection />

      {/* DEVELOPER EXPERIENCE */}
      <DeveloperExperienceSection />

      {/* REDACTION SHOWCASE */}
      <RedactionShowcaseSection />

      {/* MODERATION SHOWCASE */}
      <ModerationShowcaseSection />

      {/* FAQ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "70px 40px",
        }}
      >
        <div
          data-reveal=""
          className="r-stack"
          style={{
            opacity: 0,
            transform: "translateY(26px)",
            transition:
              "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)",
            display: "grid",
            gridTemplateColumns: "0.82fr 1fr",
            gap: "56px",
            alignItems: "start",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "12px",
                letterSpacing: "0.2em",
                color: "#8fa0d8",
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                margin: "16px 0 0",
                fontSize: "clamp(30px,3.4vw,44px)",
                fontWeight: 600,
                letterSpacing: "-0.035em",
                lineHeight: 1.05,
              }}
            >
              Clear before you integrate.
            </h2>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[
              {
                q: "What is Visora?",
                a: "Visora is the image moderation product: the API, dashboard, policies, logs, and review workflow.",
              },
              {
                q: "What is Visora Cloud?",
                a: "Visora Cloud is the hosted account and dashboard experience where you manage projects, plans, API keys, and policies.",
              },
              {
                q: "What is @visoracloud/client?",
                a: "@visoracloud/client is the official Node and TypeScript SDK for calling the Visora API from server-side code.",
              },
              {
                q: "Should I call Visora from the browser?",
                a: "No. Keep API keys on your backend and send user uploads through your server, API route, worker, or server action.",
              },
            ].map((item) => (
              <div
                key={item.q}
                style={{
                  padding: "20px 22px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.022)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.9)",
                    marginBottom: "7px",
                  }}
                >
                  {item.q}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.52)",
                    fontWeight: 300,
                  }}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "110px 40px 130px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "420px",
            background:
              "radial-gradient(ellipse at center, rgba(126,155,255,0.12), rgba(126,155,255,0) 64%)",
            pointerEvents: "none",
          }}
        />
        <div
          data-reveal=""
          style={{
            opacity: 0,
            transform: "translateY(26px)",
            transition:
              "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)",
            position: "relative",
          }}
        >
          <h2
            style={{
              margin: "0 auto",
              maxWidth: "720px",
              fontSize: "clamp(34px,4.4vw,60px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
            }}
          >
            Add image moderation to your product.
          </h2>
          <p
            style={{
              margin: "24px auto 0",
              maxWidth: "480px",
              fontSize: "18px",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.58)",
              fontWeight: 300,
            }}
          >
            Use Visora from your backend with the @visoracloud/client SDK or the
            REST API.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginTop: "40px",
            }}
          >
            <Link
              href={currentUser ? "/dashboard" : "/register"}
              className="v-btn-primary-lg"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 500,
                color: "#050505",
                background: "#fff",
                padding: "14px 26px",
                borderRadius: "11px",
                textDecoration: "none",
                transition: "transform .2s, box-shadow .2s",
              }}
            >
              {currentUser ? "Go to Dashboard" : "Start Free"}
            </Link>
            <Link
              href="/docs"
              className="v-btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "14px 26px",
                borderRadius: "11px",
                textDecoration: "none",
                transition: "background .2s, border-color .2s",
              }}
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "38px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <VisoraLogo markSize={22} fontSize={14} tone="light" />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            — Moderation, redaction & identity verification.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "26px" }}>
          {[
            ["Features", "/features/webhooks"],
            ["Docs", "/docs"],
            ["Pricing", "/pricing"],
            ["Terms", "/terms"],
            ["Privacy", "/privacy"],
            ["Retention", "/data-retention"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="v-footlink"
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.45)",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
          <span
            style={{
              fontFamily: MONO,
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            © 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
