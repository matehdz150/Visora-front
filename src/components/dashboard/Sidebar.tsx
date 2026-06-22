import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV } from "./constants";
import { NavIcon } from "./NavIcon";
import type { Page } from "./types";
import type { CurrentUser } from "@/lib/visora-api";
import { sidebarVariants } from "./animations";
import { VisoraLogo } from "@/components/VisoraLogo";

export function Sidebar({
  page,
  onNavigate,
  workspace,
  currentUser,
  onSignOut,
  reviewCount,
  redactionCount,
  showAdmin,
  mobileOpen = false,
}: {
  page: Page;
  onNavigate: (p: Page) => void;
  workspace: string;
  currentUser: CurrentUser | null;
  onSignOut: () => void;
  reviewCount: number;
  redactionCount: number;
  showAdmin: boolean;
  mobileOpen?: boolean;
}) {
  const initials = currentUser?.email.slice(0, 2).toUpperCase() ?? "VI";

  return (
    <motion.aside variants={sidebarVariants} initial="initial" animate="animate" className={"dash-sidebar" + (mobileOpen ? " dash-sidebar-open" : "")} style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "250px", background: "#000", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", zIndex: 20 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "22px 22px 20px", textDecoration: "none", color: "#fff" }}>
        <VisoraLogo markSize={26} fontSize={17} tone="light" />
      </Link>

      <div style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        {NAV.filter(([id]) => showAdmin || id !== "admin").map(([id, label]) => {
          const active = page === id || ((page === "create-project" || page === "project-detail") && id === "projects");
          const showReviewBadge = id === "reviews" && reviewCount > 0;
          const showRedactionBadge = id === "redactions" && redactionCount > 0;
          return (
            <motion.button
              key={id}
              onClick={() => onNavigate(id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.985 }}
              className="v-navbtn"
              style={{ display: "flex", alignItems: "center", gap: "11px", width: "100%", padding: "9px 12px", background: active ? "rgba(255,255,255,0.055)" : "transparent", border: "none", borderRadius: "9px", color: active ? "#fff" : "rgba(255,255,255,0.55)", fontFamily: "inherit", fontSize: "14px", fontWeight: active ? 500 : 400, cursor: "pointer", textAlign: "left", transition: "background .15s, color .15s" }}
            >
              <NavIcon name={id} on={active} />
              <span style={{ flex: 1 }}>{label}</span>
              {showReviewBadge && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", fontWeight: 500, color: "#e8c98a", background: "rgba(232,201,138,0.12)", border: "1px solid rgba(232,201,138,0.25)", padding: "1px 7px", borderRadius: "20px" }}>{reviewCount > 99 ? "99+" : reviewCount}</span>
              )}
              {showRedactionBadge && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", fontWeight: 500, color: "#aebfff", background: "rgba(126,155,255,0.11)", border: "1px solid rgba(126,155,255,0.24)", padding: "1px 7px", borderRadius: "20px" }}>{redactionCount > 99 ? "99+" : redactionCount}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", padding: "14px 14px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 10px", background: "#050505", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", cursor: "pointer", marginBottom: "10px", color: "#fff", fontFamily: "inherit" }}>
          <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "#000", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: "left", fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{workspace}</span>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>⌄</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px" }}>
          <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #aebfff, #5566aa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0b0b0b" }}>{initials}</span>
          <div style={{ flex: 1, lineHeight: 1.25 }}>
            <div style={{ fontSize: "13px", color: "#fff" }}>Visora user</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>{currentUser?.email}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ width: "100%", marginTop: "10px", padding: "8px 10px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.08)", background: "#050505", color: "rgba(255,255,255,0.62)", fontFamily: "inherit", fontSize: "12px", cursor: "pointer" }}>Sign out</button>
      </div>
    </motion.aside>
  );
}
