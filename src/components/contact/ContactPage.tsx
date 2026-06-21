"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VisoraLogo } from "@/components/VisoraLogo";

const MONO = "var(--font-jetbrains), monospace";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "13px",
  padding: "16px 18px",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: "15px",
  outline: 0,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025)",
  transition: "border-color .15s, background .15s, box-shadow .15s",
};

const contacts = [
  { label: "Get help", email: "support@visoracloud.com", href: "mailto:support@visoracloud.com", note: "Account, API, dashboard, or integration issues." },
  { label: "Product questions", email: "hello@visoracloud.com", href: "mailto:hello@visoracloud.com", note: "Plans, roadmap, partnerships, and general questions." },
  { label: "Report security concerns", email: "security@visoracloud.com", href: "mailto:security@visoracloud.com", note: "Responsible disclosure and sensitive reports." },
];


function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{ display: "block", fontSize: "13.5px", color: "rgba(255,255,255,0.66)", marginBottom: "10px" }}>{label}</label>
      {children}
    </div>
  );
}

export function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const canSubmit = email.trim().length > 0;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const subject = encodeURIComponent("Visora contact request");
    const body = encodeURIComponent([
      "Email: " + email.trim(),
      "",
      message.trim() || "Hi Visora team,",
    ].join("\n"));

    setSent(true);
    setSentEmail(email.trim());
    window.location.href = "mailto:support@visoracloud.com?subject=" + subject + "&body=" + body;
  }

  function reset() {
    setSent(false);
    setEmail("");
    setMessage("");
    setSentEmail("");
  }

  return (
    <main className="lp-root" style={{ position: "relative", width: "100%", minHeight: "100vh", background: "#050505", color: "#fff", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-300px", right: "-200px", width: "900px", height: "700px", background: "radial-gradient(ellipse at center, rgba(126,155,255,0.12), rgba(126,155,255,0) 62%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-360px", left: "-260px", width: "780px", height: "620px", background: "radial-gradient(ellipse at center, rgba(174,191,255,0.08), rgba(174,191,255,0) 64%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(circle at 68% 18%, #000 0%, transparent 56%)", opacity: 0.7, pointerEvents: "none" }} />

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "rgba(5,5,5,0.72)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <VisoraLogo markSize={26} fontSize={18} tone="light" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <span className="lp-nav-mid" style={{ display: "contents" }}>
            <Link href="/docs" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Documentation</Link>
            <Link href="/pricing" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Pricing</Link>
            <Link href="/login" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Log In</Link>
          </span>
          <Link href="/register" className="v-btn-primary-sm" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "9px 18px", borderRadius: "9px", textDecoration: "none" }}>Start Free</Link>
        </div>
      </nav>

      <section style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto", padding: "158px 40px 110px" }}>
        <div className="r-stack" style={{ display: "grid", gridTemplateColumns: "1.12fr 0.88fr", gap: "54px", alignItems: "start" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "24px", padding: "7px 11px", borderRadius: "999px", background: "rgba(126,155,255,0.08)", border: "1px solid rgba(126,155,255,0.2)", color: "#aebfff", fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Contact Visora
            </div>
            <h1 style={{ margin: "0 0 26px", fontSize: "clamp(58px, 8vw, 116px)", lineHeight: 0.94, fontWeight: 600, letterSpacing: "-0.06em", color: "#fff" }}>Get in<br />touch</h1>
            <p style={{ maxWidth: "560px", margin: "0 0 46px", fontSize: "18px", lineHeight: 1.65, color: "rgba(255,255,255,0.58)", fontWeight: 300 }}>
              Questions about integrating Visora, choosing a plan, or setting up moderation policies? Send a note and we will route it to the right place.
            </p>

            {!sent ? (
              <form onSubmit={submit} style={{ maxWidth: "590px", padding: "28px", borderRadius: "22px", background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018))", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 28px 80px rgba(0,0,0,0.34)" }}>
                <FieldShell label="Email address">
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@company.com" style={inputStyle} />
                </FieldShell>
                <FieldShell label="How can we help?">
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="I'd like to know how Visora can help me with..." style={{ ...inputStyle, lineHeight: 1.6, resize: "none" }} />
                </FieldShell>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "18px" }}>
                  <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.5, color: "rgba(255,255,255,0.42)", maxWidth: "310px" }}>This opens your email client with a prepared message to support@visoracloud.com.</p>
                  <button type="submit" disabled={!canSubmit} style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "13px 16px 13px 24px", borderRadius: "40px", border: "none", fontFamily: "inherit", fontSize: "15px", fontWeight: 500, cursor: canSubmit ? "pointer" : "not-allowed", background: canSubmit ? "#fff" : "rgba(255,255,255,0.08)", color: canSubmit ? "#050505" : "rgba(255,255,255,0.4)", transition: "background .2s, transform .15s", flexShrink: 0 }}>
                    <span>Submit</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", background: canSubmit ? "rgba(5,5,5,0.1)" : "rgba(255,255,255,0.06)" }}>›</span>
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ maxWidth: "590px", padding: "34px 32px", borderRadius: "22px", background: "linear-gradient(180deg, rgba(126,224,168,0.07), rgba(255,255,255,0.025))", border: "1px solid rgba(126,224,168,0.22)", boxShadow: "0 28px 80px rgba(0,0,0,0.34)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "16px" }}>
                  <span style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(126,224,168,0.12)", border: "1px solid rgba(126,224,168,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", color: "#7ee0a8" }}>✓</span>
                  <span style={{ fontSize: "20px", fontWeight: 600, letterSpacing: "-0.02em" }}>Email prepared</span>
                </div>
                <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, color: "rgba(255,255,255,0.6)", fontWeight: 300 }}>Your email client should open with a message to Visora. We will reply to <strong style={{ color: "#fff", fontWeight: 500 }}>{sentEmail}</strong>.</p>
                <button onClick={reset} style={{ marginTop: "22px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", padding: "10px 18px", borderRadius: "10px", cursor: "pointer" }}>Send another</button>
              </div>
            )}
          </div>

          <aside style={{ position: "sticky", top: "112px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ padding: "26px", borderRadius: "22px", background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: "#8fa0d8", textTransform: "uppercase", marginBottom: "22px" }}>Direct inboxes</div>
              <div style={{ display: "grid", gap: "22px" }}>
                {contacts.map((contact) => (
                  <div key={contact.email}>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "7px" }}>{contact.label}</div>
                    <a href={contact.href} style={{ fontSize: "15.5px", color: "#fff", textDecoration: "none" }}>{contact.email}</a>
                    <div style={{ marginTop: "6px", fontSize: "12.5px", lineHeight: 1.45, color: "rgba(255,255,255,0.38)" }}>{contact.note}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "28px", paddingTop: "22px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginBottom: "9px" }}>Response time</div>
                <div style={{ fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.72)", fontWeight: 300 }}>We usually reply within one business day. For account issues, include your Visora Cloud email.</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
