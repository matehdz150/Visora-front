"use client";

import type { CSSProperties, ReactNode } from "react";
import { FlaskConical, ChevronDown, Play, ScanEye, Webhook } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const MONO = "'JetBrains Mono', monospace";

const reveal: CSSProperties = { opacity: 1, transform: "none" };

type ModAction = "allow" | "reject" | "review";

const ACTION_STYLE: Record<ModAction, { color: string; bg: string; bd: string }> = {
  allow: { color: "#7ee0a8", bg: "rgba(126,224,168,0.12)", bd: "rgba(126,224,168,0.26)" },
  reject: { color: "#ff9b9b", bg: "rgba(255,90,90,0.1)", bd: "rgba(255,90,90,0.24)" },
  review: { color: "#e8c98a", bg: "rgba(232,201,138,0.12)", bd: "rgba(232,201,138,0.26)" },
};

function riskColor(risk: number) {
  return risk >= 70 ? "#ff9b9b" : risk >= 40 ? "#e8c98a" : "#7ee0a8";
}

const MODERATION_LOGS: { action: ModAction; category: string; risk: number }[] = [
  { action: "reject", category: "explicit_nudity", risk: 94 },
  { action: "allow", category: "safe", risk: 4 },
  { action: "review", category: "violence", risk: 61 },
  { action: "allow", category: "safe", risk: 11 },
  { action: "reject", category: "weapons", risk: 88 },
  { action: "allow", category: "safe", risk: 7 },
];

const WEBHOOK_EVENTS = [
  { type: "redaction.completed", id: "evt_01KVMZ7P2YQ9" },
  { type: "moderation.completed", id: "evt_0f859ac9ac70" },
  { type: "review.approved", id: "evt_13359f77466e" },
  { type: "redaction.completed", id: "evt_c3be1838b80e" },
  { type: "moderation.review_required", id: "evt_8a21d4f0e9b3" },
  { type: "moderation.completed", id: "evt_5b6ee0a1c244" },
];

const cardStyle: CSSProperties = {
  position: "relative",
  borderRadius: 24,
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.008))",
  display: "flex",
  flexDirection: "column",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
};

const topBorderStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 18,
  right: 18,
  height: 1,
  zIndex: 8,
  pointerEvents: "none",
  background:
    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 12%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0.16) 88%, transparent 100%)",
};

const leftBorderStyle: CSSProperties = {
  position: "absolute",
  top: 18,
  left: 0,
  width: 1,
  height: "62%",
  zIndex: 8,
  pointerEvents: "none",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.055) 42%, rgba(255,255,255,0) 100%)",
};

const rightBorderStyle: CSSProperties = {
  ...leftBorderStyle,
  left: "auto",
  right: 0,
};

const cornerGlowStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: 24,
  zIndex: 7,
  pointerEvents: "none",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.13), transparent 18%), radial-gradient(circle at top right, rgba(255,255,255,0.13), transparent 18%)",
};

const topGlowStyle: CSSProperties = {
  position: "absolute",
  top: -70,
  left: "10%",
  right: "10%",
  height: 170,
  zIndex: 1,
  pointerEvents: "none",
  background:
    "radial-gradient(ellipse at center, rgba(255,255,255,0.09), rgba(255,255,255,0.035) 34%, transparent 72%)",
  filter: "blur(38px)",
};

const innerShadeStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 2,
  pointerEvents: "none",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 20%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.22) 100%)",
};

const bottomCoverStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 2,
  zIndex: 9,
  pointerEvents: "none",
  background: "#000",
};

const iconTile: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 11,
  border: "1px solid rgba(174,191,255,0.28)",
  background:
    "radial-gradient(circle at 35% 25%, rgba(126,155,255,0.22), rgba(255,255,255,0.02) 70%)",
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
      <div style={topGlowStyle} />
      <div style={innerShadeStyle} />
      <div style={cornerGlowStyle} />
      <div style={topBorderStyle} />
      <div style={leftBorderStyle} />
      <div style={rightBorderStyle} />
      <div style={bottomCoverStyle} />
    </>
  );
}

function AnimationSlot({ children }: { children: ReactNode }) {
  return (
    <div
      className="developer-experience-animation"
      style={{
        position: "relative",
        height: 288,
        overflow: "hidden",
        zIndex: 3,
      }}
    >
      {children}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 110,
          background: "linear-gradient(180deg, rgba(10,11,14,0), #0a0b0e 88%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function ModerationRow({ action, category, risk }: { action: ModAction; category: string; risk: number }) {
  const s = ACTION_STYLE[action];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 36, fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>
      <span
        style={{
          flexShrink: 0,
          width: 58,
          textAlign: "center",
          padding: "3px 0",
          borderRadius: 7,
          background: s.bg,
          border: "1px solid " + s.bd,
          color: s.color,
          fontWeight: 500,
          fontSize: 11.5,
        }}
      >
        {action}
      </span>
      <span style={{ color: "rgba(255,255,255,0.6)" }}>{category}</span>
      <span style={{ marginLeft: "auto", color: riskColor(risk) }}>risk {risk}</span>
    </div>
  );
}

function AnimationLeft() {
  const stream = [...MODERATION_LOGS, ...MODERATION_LOGS];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", padding: "24px 26px 0" }}>
      {/* current verdict */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "9px 11px 9px 13px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.035)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span
            style={{
              flexShrink: 0,
              padding: "4px 10px",
              borderRadius: 8,
              background: ACTION_STYLE.reject.bg,
              border: "1px solid " + ACTION_STYLE.reject.bd,
              color: ACTION_STYLE.reject.color,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Reject
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis" }}>
            explicit_nudity
          </span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
        </div>
        <button
          type="button"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 13px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.03)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 500,
            cursor: "default",
          }}
        >
          <Play size={12} />
          Run
        </button>
      </div>

      {/* infinite moderation log */}
      <div style={{ position: "relative", marginTop: 18, overflow: "hidden", height: 220 }}>
        <motion.div
          animate={{ y: ["0%", "-50%"] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          style={{ willChange: "transform" }}
        >
          {stream.map((log, i) => (
            <ModerationRow key={i} action={log.action} category={log.category} risk={log.risk} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function WebhookRow({ type, id }: { type: string; id: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 36, fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>
      <span style={{ color: "#7ee0a8", fontWeight: 500 }}>200</span>
      <span style={{ color: "rgba(255,255,255,0.66)" }}>{type}</span>
      <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.28)" }}>{id}</span>
    </div>
  );
}

function AnimationRight() {
  const stream = [...WEBHOOK_EVENTS, ...WEBHOOK_EVENTS];

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", padding: "24px 26px 0" }}>
      {/* delivery bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "9px 11px 9px 13px",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.035)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span
            style={{
              flexShrink: 0,
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(126,224,168,0.12)",
              border: "1px solid rgba(126,224,168,0.26)",
              color: "#7ee0a8",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Delivered
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis" }}>
            redaction.completed
          </span>
          <ChevronDown size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
        </div>
        <button
          type="button"
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 13px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.03)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 500,
            cursor: "default",
          }}
        >
          <FlaskConical size={13} />
          Send
        </button>
      </div>

      {/* infinite event stream */}
      <div style={{ position: "relative", marginTop: 18, overflow: "hidden", height: 220 }}>
        <motion.div
          animate={{ y: ["0%", "-50%"] }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity }}
          style={{ willChange: "transform" }}
        >
          {stream.map((event, i) => (
            <WebhookRow key={i} type={event.type} id={event.id} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function DeveloperExperienceSection() {
  const router = useRouter();
  return (
    <section
      className="developer-experience-section"
      style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 1180,
        margin: "0 auto",
        padding: "90px 40px",
        fontFamily: "'Sora', sans-serif",
        color: "#fff",
      }}
    >
      <div style={reveal}>
        <h2
          style={{
            margin: 0,
            fontSize: "clamp(38px,5.4vw,76px)",
            fontWeight: 600,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
          }}
        >
          First-class
          <br />
          developer experience
        </h2>

        <p
          style={{
            margin: "28px 0 0",
            maxWidth: 600,
            fontSize: 18,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.6)",
            fontWeight: 300,
          }}
        >
          We build the moderation tooling we always wished we had — one that just
          works. Inspect, simulate, and ship with confidence.
        </p>
      </div>

      <div
        className="developer-experience-grid r-cols-2"
        style={{
          marginTop: 60,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        <div className="developer-experience-card" style={{ ...reveal, ...cardStyle }}>
          <CardChrome />

          <AnimationSlot>
            <AnimationLeft />
          </AnimationSlot>

          <div className="developer-experience-card-copy" style={{ position: "relative", zIndex: 4, padding: "6px 36px 40px" }}>
            <div style={iconTile}>
              <ScanEye size={19} strokeWidth={1.6} />
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em" }}>
              Interactive playground
            </h3>

            <p style={{ margin: 0, maxWidth: 440, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>
              Drop in an image and watch Visora flag, score, and redact it in
              real time. Tune your policy and preview the verdict before writing
              a single line of code.
            </p>
            <span className="pt-10 text-sm underline cursor-pointer" onClick={()=> router.push('/docs/#policies')}>Learn more</span>
          </div>
        </div>

        <div className="developer-experience-card" style={{ ...reveal, ...cardStyle }}>
          <CardChrome />

          <AnimationSlot>
            <AnimationRight />
          </AnimationSlot>

          <div className="developer-experience-card-copy" style={{ position: "relative", zIndex: 4, padding: "6px 36px 40px" }}>
            <div style={iconTile}>
              <Webhook size={19} strokeWidth={1.6} />
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.025em" }}>
              Modular webhooks
            </h3>

            <p style={{ margin: 0, maxWidth: 440, fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>
              Receive real-time events the moment an image is moderated, flagged,
              or redacted. Wire moderation decisions straight into your pipeline,
              no polling required.
            </p>
            <span className="pt-10 text-sm underline cursor-pointer" onClick={()=> router.push('/features/webhooks')}>Learn more</span>
          </div>
        </div>
      </div>
    </section>
  );
}
