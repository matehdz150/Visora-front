"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VisoraLogo } from "@/components/VisoraLogo";
import {
  confirmRegistration,
  loginUser,
  type PlanId,
  registerUser,
  resendConfirmationCode,
  saveSession,
  startGitHubOAuth,
  startGoogleOAuth,
} from "@/lib/visora-api";

/**
 * Visora — authentication screen (sign in / sign up).
 *
 * Faithful port of the "Visora - Login.dc.html" Claude Design source. The
 * original was a single component that toggled between `signin` and `signup`
 * modes; here each mode is its own route (/login, /register) and the toggle is
 * a real navigation link. Styling stays inline to preserve pixel fidelity.
 */

type Mode = "signin" | "signup";

const PENDING_SIGNUP_STORAGE_KEY = "visora.pendingSignup";

interface PendingSignupState {
  email: string;
  planId: PlanId;
}

function readPendingSignup(): PendingSignupState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PENDING_SIGNUP_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingSignupState>;
    if (typeof parsed.email !== "string" || typeof parsed.planId !== "string") return null;

    return { email: parsed.email, planId: parsed.planId as PlanId };
  } catch {
    return null;
  }
}

function writePendingSignup(state: PendingSignupState) {
  window.localStorage.setItem(PENDING_SIGNUP_STORAGE_KEY, JSON.stringify(state));
}

function clearPendingSignup() {
  window.localStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
}

const planSummaries: Record<PlanId, { name: string; price: string; usage: string }> = {
  free: { name: "Free", price: "$0 / month", usage: "1,000 moderations" },
  starter: { name: "Starter", price: "$19 / month", usage: "8,000 moderations" },
  plus: { name: "Plus", price: "$39 / month", usage: "16,000 moderations" },
  growth: { name: "Growth", price: "$89 / month", usage: "38,000 moderations" },
  scale: { name: "Scale", price: "$249 / month", usage: "110,000 moderations" },
};

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.94.58.1.79-.25.79-.56v-2.18c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17A10.9 10.9 0 0 1 12 6.04c.97 0 1.94.13 2.85.39 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.19c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function passwordMeetsPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

/* -------------------------------------------------------------------------- */
/* Left brand panel — floating 3D cube cluster                                */
/* -------------------------------------------------------------------------- */
function buildHero(): React.ReactNode {
  const accent = "#7e9bff";
  const ar = 126,
    ag = 155,
    ab = 255;
  const rgba = (a: number) => `rgba(${ar},${ag},${ab},${a})`;
  const s = 70,
    h = s / 2,
    step = 72;

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
      style: { ...faceBase, transform: tf, background: bg, border: "1px solid " + border },
    });

  const cube = (
    i: number,
    j: number,
    k: number,
    opts: { lit?: boolean; detach?: { x?: number; y?: number; z?: number }; tag?: string } = {},
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
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "12px",
            height: "12px",
            marginTop: "-6px",
            marginLeft: "-6px",
            borderRadius: "50%",
            background: `radial-gradient(circle, #eef2ff, ${accent} 58%, ${rgba(0)} 100%)`,
            transform: "translateZ(" + (h + 3) + "px)",
            boxShadow: `0 0 16px 4px ${rgba(0.75)}`,
            animation: `loginPulse ${3 + (Math.abs(i + j + k) % 3) * 0.7}s ease-in-out infinite`,
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

  const remove = new Set(["1,-1,-1", "-1,-1,1", "-1,-1,-1", "-1,1,-1", "0,1,1"]);
  const litSet = new Set(["0,-1,1", "1,0,1", "1,-1,1", "-1,0,1"]);
  const cubes: React.ReactNode[] = [];
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++)
      for (let k = -1; k <= 1; k++) {
        const key = i + "," + j + "," + k;
        if (remove.has(key)) continue;
        cubes.push(cube(i, j, k, { lit: litSet.has(key) }));
      }
  cubes.push(cube(0, 1, 1, { detach: { x: -8, y: 64, z: 32 }, lit: true, tag: "-d" }));

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
        animation: "loginSpin 26s ease-in-out infinite",
      } as React.CSSProperties,
    },
    cubes,
  );

  const glow = React.createElement("div", {
    key: "gl",
    style: {
      position: "absolute",
      top: "48%",
      left: "50%",
      width: "520px",
      height: "460px",
      transform: "translate(-50%,-50%)",
      borderRadius: "50%",
      background: `radial-gradient(ellipse at center, ${rgba(0.16)}, ${rgba(0)} 60%)`,
      filter: "blur(20px)",
      pointerEvents: "none",
    } as React.CSSProperties,
  });

  return React.createElement(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "360px",
        perspective: "1400px",
        perspectiveOrigin: "52% 44%",
        transformStyle: "preserve-3d",
        animation: "loginFloat 9s ease-in-out infinite",
      } as React.CSSProperties,
    },
    [glow, cluster],
  );
}

/* -------------------------------------------------------------------------- */
/* Form                                                                       */
/* -------------------------------------------------------------------------- */
export default function AuthForm({ mode, selectedPlan }: { mode: Mode; selectedPlan?: PlanId }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const signin = mode === "signin";
  const submitBg = email && !loading ? "#aebfff" : "rgba(174,191,255,0.55)";

  useEffect(() => {
    if (signin || !selectedPlan) return;

    const pendingSignup = readPendingSignup();

    if (!pendingSignup || pendingSignup.planId !== selectedPlan) return;

    setEmail(pendingSignup.email);
    setAwaitingConfirmation(true);
    setNotice("Enter the verification code we sent to your email, then continue to checkout.");
  }, [selectedPlan, signin]);

  const continueAfterSignup = async (session: { idToken: string }) => {
    const planId = selectedPlan ?? "free";

    if (planId !== "free") {
      router.push(`/checkout?plan=${planId}`);
      return;
    }

    router.push("/dashboard");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (!signin && !awaitingConfirmation && !passwordMeetsPolicy(password)) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      }

      if (signin) {
        const session = await loginUser(normalizedEmail, password);
        saveSession(session);
        router.push("/dashboard");
        return;
      }

      if (awaitingConfirmation) {
        await confirmRegistration(normalizedEmail, confirmationCode.trim());
        const session = await loginUser(normalizedEmail, password);
        saveSession(session);
        clearPendingSignup();
        await continueAfterSignup(session);
        return;
      }

      const registration = await registerUser(normalizedEmail, password, selectedPlan ?? "free");

      if (registration.userConfirmed) {
        const session = await loginUser(normalizedEmail, password);
        saveSession(session);
        await continueAfterSignup(session);
        return;
      }

      writePendingSignup({ email: normalizedEmail, planId: selectedPlan ?? "free" });
      setAwaitingConfirmation(true);
      setNotice("We sent a verification code to your email. Enter it here to continue.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";

      if (!signin && message === "Email is already registered") {
        setAwaitingConfirmation(true);
        setNotice("This email is already registered. If it is not confirmed yet, enter or resend the verification code.");
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    setError(null);
    setNotice(null);
    setResending(true);

    try {
      await resendConfirmationCode(normalizedEmail);
      setNotice("We sent a new verification code to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend verification code");
    } finally {
      setResending(false);
    }
  };

  const onGoogleContinue = async () => {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);

    try {
      await startGoogleOAuth({
        intent: signin ? "signin" : "signup",
        ...(signin ? {} : { planId: selectedPlan ?? "free" }),
        returnTo: "/dashboard",
      });
    } catch (err) {
      setGoogleLoading(false);
      setError(err instanceof Error ? err.message : "Could not start Google sign in");
    }
  };

  const onGitHubContinue = async () => {
    setError(null);
    setNotice(null);
    setGithubLoading(true);

    try {
      await startGitHubOAuth({
        intent: signin ? "signin" : "signup",
        ...(signin ? {} : { planId: selectedPlan ?? "free" }),
        returnTo: "/dashboard",
      });
    } catch (err) {
      setGithubLoading(false);
      setError(err instanceof Error ? err.message : "Could not start GitHub sign in");
    }
  };

  const title = signin
    ? "Welcome back"
    : awaitingConfirmation
      ? "Verify your email"
      : "Create your account";
  const description = signin
    ? "Sign in to your Visora workspace."
    : awaitingConfirmation
      ? "Enter the code Cognito sent to your inbox."
      : "Start moderating images in minutes.";
  const submitLabel = loading
    ? "Please wait..."
    : signin
      ? "Sign In"
      : awaitingConfirmation
        ? "Verify and continue"
        : "Create Account";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050505" }}>
      {/* LEFT: brand panel */}
      <div
        className="auth-brand"
        style={{
          position: "relative",
          flex: 1.05,
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "44px 52px",
        }}
      >
        {/* ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-120px",
            width: "760px",
            height: "680px",
            background:
              "radial-gradient(ellipse at center, rgba(126,155,255,0.13), rgba(126,155,255,0) 62%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-260px",
            right: "-160px",
            width: "620px",
            height: "560px",
            background:
              "radial-gradient(ellipse at center, rgba(126,155,255,0.07), rgba(126,155,255,0) 64%)",
            pointerEvents: "none",
          }}
        />

        {/* logo */}
        <Link
          href="/"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "11px",
            textDecoration: "none",
            color: "#fff",
            width: "fit-content",
          }}
        >
          <VisoraLogo markSize={28} fontSize={19} tone="light" />
        </Link>

        {/* 3D object */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "320px",
          }}
        >
          {buildHero()}
        </div>

        {/* quote */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "440px" }}>
          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.45,
              fontWeight: 300,
              letterSpacing: "-0.01em",
              color: "rgba(255,255,255,0.82)",
              margin: "0 0 18px",
            }}
          >
            &quot;Visora turns an image upload into one clear moderation decision, so teams can
            ship safer user-generated content with less manual work.&quot;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #aebfff, #5566aa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0b0b0b",
              }}
            >
              MH
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: "14px", color: "#fff" }}>Mateo Hernandez</div>
              <div style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.45)" }}>
                Founder, Visora
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: form */}
      <div
        className="auth-form-panel"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 40px",
        }}
      >
        <form
          onSubmit={onSubmit}
          style={{
            width: "100%",
            maxWidth: "380px",
            animation: "loginRise .6s cubic-bezier(.2,.7,.2,1) both",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.03em" }}>
            {title}
          </h1>
          <p style={{ margin: "10px 0 0", fontSize: "15px", color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>
            {description}
          </p>

          {!signin && selectedPlan && !awaitingConfirmation && (
            <div style={{ marginTop: "22px", padding: "14px 15px", borderRadius: "12px", background: "rgba(126,155,255,0.08)", border: "1px solid rgba(126,155,255,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
              <div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.52)", marginBottom: "4px" }}>Selected plan</div>
                <div style={{ fontSize: "15px", color: "#fff", fontWeight: 600 }}>{planSummaries[selectedPlan].name}</div>
                <div style={{ marginTop: "3px", fontSize: "12px", color: "rgba(255,255,255,0.48)" }}>{planSummaries[selectedPlan].usage}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "13px", color: "#c5d0ff", fontWeight: 600 }}>{planSummaries[selectedPlan].price}</div>
                <Link href="/pricing" style={{ display: "inline-block", marginTop: "6px", fontSize: "12px", color: "#aebfff", textDecoration: "none" }}>Change</Link>
              </div>
            </div>
          )}

          {/* fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
                disabled={loading}
                className="v-input"
                style={{
                  width: "100%",
                  background: "#0e0e10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "11px",
                  padding: "12px 14px",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  transition: "border-color .15s",
                }}
              />
            </div>
            <div style={{ animation: "loginRise .35s ease both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Password</label>
                {signin ? (
                  <Link
                    href="/forgot-password"
                    className="v-link-underline"
                    style={{ fontSize: "12.5px", color: "#aebfff", textDecoration: "none" }}
                  >
                    Forgot?
                  </Link>
                ) : null}
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                disabled={loading}
                className="v-input"
                style={{
                  width: "100%",
                  background: "#0e0e10",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "11px",
                  padding: "12px 14px",
                  color: "#fff",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  transition: "border-color .15s",
                }}
              />
              {!signin && !awaitingConfirmation && (
                <div style={{ marginTop: "8px", fontSize: "11.5px", color: "rgba(255,255,255,0.35)", lineHeight: 1.45 }}>
                  Use 8+ characters with uppercase, lowercase, and a number.
                </div>
              )}
            </div>
            {awaitingConfirmation && (
              <div style={{ animation: "loginRise .35s ease both" }}>
                <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                  Verification code
                </label>
                <input
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  disabled={loading}
                  className="v-input"
                  style={{
                    width: "100%",
                    background: "#0e0e10",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "11px",
                    padding: "12px 14px",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    transition: "border-color .15s",
                  }}
                />
                <button
                  type="button"
                  onClick={onResendCode}
                  disabled={resending || loading}
                  style={{
                    marginTop: "10px",
                    background: "none",
                    border: "none",
                    color: "#aebfff",
                    fontFamily: "inherit",
                    fontSize: "12.5px",
                    cursor: resending || loading ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>
            )}
          </div>

          {(error || notice) && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "11px",
                border: "1px solid " + (error ? "rgba(255,155,155,0.28)" : "rgba(126,155,255,0.28)"),
                background: error ? "rgba(255,90,90,0.08)" : "rgba(126,155,255,0.08)",
                color: error ? "#ffb7b7" : "#c5d0ff",
                fontSize: "13px",
                lineHeight: 1.45,
              }}
            >
              {error ?? notice}
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={loading || googleLoading || githubLoading}
            className="v-submit"
            style={{
              width: "100%",
              marginTop: "22px",
              padding: "13px",
              background: submitBg,
              color: "#050505",
              border: "none",
              borderRadius: "11px",
              fontFamily: "inherit",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading || googleLoading || githubLoading ? "not-allowed" : "pointer",
              transition: "transform .15s, box-shadow .15s, background .2s",
            }}
          >
            {submitLabel}
          </button>

          {!awaitingConfirmation && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" }}>
                <span style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.09)" }} />
                <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.34)" }}>or</span>
                <span style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.09)" }} />
              </div>

              <button
                type="button"
                onClick={onGoogleContinue}
                disabled={loading || googleLoading || githubLoading}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.86)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading || googleLoading || githubLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", color: "#050505", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, fontFamily: "Arial, sans-serif" }}>G</span>
                {googleLoading ? "Redirecting to Google..." : signin ? "Continue with Google" : "Sign up with Google"}
              </button>

              <button
                type="button"
                onClick={onGitHubContinue}
                disabled={loading || googleLoading || githubLoading}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "12px 14px",
                  borderRadius: "11px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.86)",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading || googleLoading || githubLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <GitHubIcon />
                {githubLoading ? "Redirecting to GitHub..." : signin ? "Continue with GitHub" : "Sign up with GitHub"}
              </button>
            </>
          )}

          <p style={{ margin: "26px 0 0", textAlign: "center", fontSize: "13.5px", color: "rgba(255,255,255,0.45)" }}>
            {signin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={signin ? "/pricing" : "/login"}
              className="v-link-underline"
              style={{
                background: "none",
                border: "none",
                color: "#aebfff",
                fontFamily: "inherit",
                fontSize: "13.5px",
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
                textDecoration: "none",
              }}
            >
              {signin ? "Choose a plan" : "Sign in"}
            </Link>
          </p>

          <p
            style={{
              margin: "36px 0 0",
              textAlign: "center",
              fontSize: "11.5px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.3)",
              fontWeight: 300,
            }}
          >
            By continuing you agree to Visora&apos;s
            <br />
            <Link href="/terms" style={{ color: "rgba(255,255,255,0.52)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" style={{ color: "rgba(255,255,255,0.52)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Privacy Policy
            </Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
