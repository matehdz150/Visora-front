"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { VisoraLogo } from "@/components/VisoraLogo";
import { clearSession, getCurrentUser, getStoredSession, type CurrentUser } from "@/lib/visora-api";

type Menu = "features" | "docs" | "help" | null;

const featureLinks = [
  ["Moderation", "/docs#moderate", "Scan uploads and image keys."],
  ["Redaction", "/features/redaction", "Blur faces, text, and plates."],
  ["Webhooks", "/features/webhooks", "Deliver signed events."],
  ["Review Queue", "/docs#review-queue", "Resolve manual decisions."],
  ["Policies", "/docs#policies", "Set project rules."],
] as const;

const docsLinks = [
  ["Moderation", "/docs", "API reference"],
  ["Redaction", "/docs/redaction", "Blur workflows"],
  ["Webhooks", "/docs/webhooks", "Signed event delivery"],
] as const;

const helpLinks = [
  ["Contact", "/contact", "Send us a message"],
  ["Support", "mailto:support@visoracloud.com", "support@visoracloud.com"],
  ["Docs", "/docs", "Integration guides"],
] as const;

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: "6px",
        height: "6px",
        borderRight: "1.5px solid currentColor",
        borderBottom: "1.5px solid currentColor",
        transform: open ? "rotate(225deg) translateY(-1px)" : "rotate(45deg) translateY(-2px)",
        transition: "transform .18s ease",
        opacity: 0.75,
      }}
    />
  );
}

function DropdownLink({ label, href, hint, active }: { label: string; href: string; hint: string; active?: boolean }) {
  return (
    <a href={href} role="menuitem" className="nav-dropdown-link" style={{ textDecoration: "none" }}>
      <div className="nav-dropdown-title" style={{ fontSize: label === "Review Queue" || label === "Moderation" ? "20px" : "21px", lineHeight: 1.1, letterSpacing: "-0.035em", color: active ? "#fff" : "rgba(255,255,255,0.58)", fontWeight: 500 }}>
        {label}
      </div>
      <div className="nav-dropdown-hint" style={{ marginTop: "5px", fontSize: "11.5px", color: "rgba(255,255,255,0.34)" }}>
        {hint}
      </div>
    </a>
  );
}

function PreviewCard({ href, title, body, cta, neutral = false }: { href: string; title: string; body: string; cta: string; neutral?: boolean }) {
  return (
    <a
      href={href}
      className="nav-dropdown-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "168px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: neutral
          ? "radial-gradient(circle at 70% 10%, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 42%, rgba(255,255,255,0.02))"
          : "radial-gradient(circle at 70% 10%, rgba(126,155,255,0.18), rgba(255,255,255,0.035) 42%, rgba(255,255,255,0.02))",
        padding: "18px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.28 }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: "22px", lineHeight: 1.15, letterSpacing: "-0.035em", color: "#fff", marginBottom: "8px" }}>{title}</div>
        <p style={{ margin: 0, fontSize: "12.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.52)" }}>{body}</p>
      </div>
      <span style={{ position: "relative", fontSize: "12.5px", color: "#aebfff", fontWeight: 500 }}>{cta}</span>
    </a>
  );
}

function MenuPanel({ kind, align = "left" }: { kind: Exclude<Menu, null>; align?: "left" | "right" }) {
  const links = kind === "features" ? featureLinks : kind === "docs" ? docsLinks : helpLinks;
  const card = kind === "features"
    ? { href: "/features/redaction", title: "Redaction", body: "Create paid-plan projects that return processed images with sensitive regions hidden.", cta: "Explore redaction ->" }
    : kind === "docs"
      ? { href: "/docs/redaction", title: "Developer docs", body: "Choose the moderation or redaction guide for your integration.", cta: "Open redaction docs ->" }
      : { href: "/contact", title: "Need help integrating?", body: "Tell us what you are building and we will point you in the right direction.", cta: "Open contact ->", neutral: true };

  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", top: "100%", left: "-28px", right: align === "right" ? "-190px" : "-28px", height: "14px" }} />
      <div role="menu" style={{ position: "absolute", top: "calc(100% + 14px)", left: align === "left" ? "-18px" : undefined, right: align === "right" ? "-160px" : undefined, width: "430px", display: "grid", gridTemplateColumns: "142px 1fr", gap: "14px", padding: "16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.12)", background: "linear-gradient(135deg, rgba(10,10,10,0.98), rgba(18,18,20,0.94))", boxShadow: "0 34px 90px rgba(0,0,0,0.64)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "9px 6px" }}>
          {links.map(([label, href, hint], index) => <DropdownLink key={label} label={label} href={href} hint={hint} active={index === 0} />)}
        </div>
        <PreviewCard {...card} />
      </div>
    </>
  );
}

export function MarketingHeader() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState<Menu>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    }
    if (open) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

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

  const menuButton = (kind: Exclude<Menu, null>, label: string, align?: "left" | "right") => (
    <div onMouseEnter={() => setOpen(kind)} onMouseLeave={() => setOpen(null)} style={{ position: "relative" }}>
      <button type="button" className="v-navlink" onFocus={() => setOpen(kind)} onClick={() => setOpen(kind)} aria-expanded={open === kind} aria-haspopup="menu" style={{ appearance: "none", border: 0, background: "transparent", padding: 0, display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "inherit", fontSize: "14px", color: "rgba(255,255,255,0.7)", cursor: "pointer", transition: "color .2s" }}>
        {label}
        <Chevron open={open === kind} />
      </button>
      {open === kind ? <MenuPanel kind={kind} align={align} /> : null}
    </div>
  );

  return (
    <nav ref={navRef} data-nav="" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "rgba(5,5,5,0.78)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", transition: "background .4s ease, border-color .4s ease, backdrop-filter .4s ease" }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <VisoraLogo markSize={26} fontSize={18} tone="light" />
      </Link>
      <div className="lp-nav-mid" style={{ display: "flex", alignItems: "center", gap: "34px" }}>
        {menuButton("features", "Features")}
        {menuButton("docs", "Documentation")}
        <Link href="/pricing" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color .2s" }}>Pricing</Link>
        {menuButton("help", "Help", "right")}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {currentUser ? (
          <>
            <span title={currentUser.email} style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px", color: "rgba(255,255,255,0.72)" }}>{currentUser.email}</span>
            <Link href="/dashboard" className="v-btn-primary-sm" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "9px 18px", borderRadius: "9px", textDecoration: "none", transition: "transform .2s, box-shadow .2s" }}>Dashboard</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="v-navlink" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none", transition: "color .2s" }}>Log In</Link>
            <Link href="/register" className="v-btn-primary-sm" style={{ fontSize: "14px", fontWeight: 500, color: "#050505", background: "#fff", padding: "9px 18px", borderRadius: "9px", textDecoration: "none", transition: "transform .2s, box-shadow .2s" }}>Start Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}
