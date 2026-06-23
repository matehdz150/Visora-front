import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { NavIcon } from "./NavIcon";
import type { Page } from "./types";
import type { CurrentUser } from "@/lib/visora-api";
import { sidebarVariants } from "./animations";
import { VisoraLogo } from "@/components/VisoraLogo";

type NavLeaf = { id: Page; label: string };
type NavGroup = { group: string; label: string; icon: string; children: NavLeaf[] };
type NavNode = NavLeaf | NavGroup;

const isGroup = (node: NavNode): node is NavGroup => "group" in node;

/** Grouped, collapsible nav — keeps the icon count down. */
const NAV_TREE: NavNode[] = [
  { id: "overview", label: "Overview" },
  {
    group: "activity",
    label: "Activity",
    icon: "moderations",
    children: [
      { id: "moderations", label: "Moderations" },
      { id: "redactions", label: "Redactions" },
      { id: "verifications", label: "Verifications" },
      { id: "reviews", label: "Reviews" },
    ],
  },
  { id: "playground", label: "Playground" },
  { id: "projects", label: "Projects" },
  {
    group: "developers",
    label: "Developers",
    icon: "webhooks",
    children: [
      { id: "webhooks", label: "Webhooks" },
      { id: "keys", label: "API Keys" },
    ],
  },
  { id: "admin", label: "Admin" },
  { id: "settings", label: "Settings" },
];

export function Sidebar({
  page,
  onNavigate,
  workspace,
  currentUser,
  onSignOut,
  reviewCount,
  redactionCount,
  verifyCount,
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
  verifyCount: number;
  showAdmin: boolean;
  mobileOpen?: boolean;
}) {
  const initials = currentUser?.email.slice(0, 2).toUpperCase() ?? "VI";

  const isActive = (id: Page) =>
    page === id || ((page === "create-project" || page === "project-detail") && id === "projects");

  const badgeFor = (id: Page): { count: number; color: string; bg: string; border: string } | null => {
    if (id === "reviews" && reviewCount > 0) return { count: reviewCount, color: "#e8c98a", bg: "rgba(232,201,138,0.12)", border: "rgba(232,201,138,0.25)" };
    if (id === "redactions" && redactionCount > 0) return { count: redactionCount, color: "#aebfff", bg: "rgba(126,155,255,0.11)", border: "rgba(126,155,255,0.24)" };
    if (id === "verifications" && verifyCount > 0) return { count: verifyCount, color: "#7ee0a8", bg: "rgba(126,224,168,0.11)", border: "rgba(126,224,168,0.24)" };
    return null;
  };

  // Which groups are expanded. Start with the group containing the active page open.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const node of NAV_TREE) {
      if (isGroup(node)) initial[node.group] = node.children.some((c) => isActive(c.id));
    }
    return initial;
  });

  // Keep the group containing the current page expanded when navigation changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen((prev) => {
      const next = { ...prev };
      for (const node of NAV_TREE) {
        if (isGroup(node) && node.children.some((c) => isActive(c.id))) next[node.group] = true;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const Badge = ({ id }: { id: Page }) => {
    const b = badgeFor(id);
    if (!b) return null;
    return (
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", fontWeight: 500, color: b.color, background: b.bg, border: `1px solid ${b.border}`, padding: "1px 7px", borderRadius: "20px" }}>{b.count > 99 ? "99+" : b.count}</span>
    );
  };

  return (
    <motion.aside variants={sidebarVariants} initial="initial" animate="animate" className={"dash-sidebar" + (mobileOpen ? " dash-sidebar-open" : "")} style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: "250px", background: "#000", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", zIndex: 20 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", padding: "22px 22px 20px", textDecoration: "none", color: "#fff" }}>
        <VisoraLogo markSize={26} fontSize={17} tone="light" />
      </Link>

      <div style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
        {NAV_TREE.map((node) => {
          if (!isGroup(node)) {
            if (node.id === "admin" && !showAdmin) return null;
            const active = isActive(node.id);
            return (
              <motion.button
                key={node.id}
                onClick={() => onNavigate(node.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.985 }}
                className="v-navbtn"
                style={{ display: "flex", alignItems: "center", gap: "11px", width: "100%", padding: "9px 12px", background: active ? "rgba(255,255,255,0.055)" : "transparent", border: "none", borderRadius: "9px", color: active ? "#fff" : "rgba(255,255,255,0.55)", fontFamily: "inherit", fontSize: "14px", fontWeight: active ? 500 : 400, cursor: "pointer", textAlign: "left", transition: "background .15s, color .15s" }}
              >
                <NavIcon name={node.id} on={active} />
                <span style={{ flex: 1 }}>{node.label}</span>
                <Badge id={node.id} />
              </motion.button>
            );
          }

          const expanded = open[node.group] ?? false;
          const groupActive = node.children.some((c) => isActive(c.id));
          const collapsedBadgeCount = !expanded
            ? node.children.reduce((sum, c) => sum + (badgeFor(c.id)?.count ?? 0), 0)
            : 0;

          return (
            <div key={node.group}>
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [node.group]: !prev[node.group] }))}
                className="v-navbtn"
                style={{ display: "flex", alignItems: "center", gap: "11px", width: "100%", padding: "9px 12px", background: groupActive && !expanded ? "rgba(255,255,255,0.04)" : "transparent", border: "none", borderRadius: "9px", color: groupActive ? "#fff" : "rgba(255,255,255,0.55)", fontFamily: "inherit", fontSize: "14px", fontWeight: groupActive ? 500 : 400, cursor: "pointer", textAlign: "left", transition: "background .15s, color .15s" }}
              >
                <NavIcon name={node.icon} on={groupActive} />
                <span style={{ flex: 1 }}>{node.label}</span>
                {collapsedBadgeCount > 0 && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#aebfff" }} />
                )}
                <ChevronRight size={15} strokeWidth={2} style={{ flexShrink: 0, color: "rgba(255,255,255,0.4)", transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .18s" }} />
              </button>

              <div style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: "grid-template-rows .2s ease" }}>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "16px", marginTop: "2px" }}>
                    {node.children.map((child) => {
                      const active = isActive(child.id);
                      return (
                        <button
                          key={child.id}
                          onClick={() => onNavigate(child.id)}
                          className="v-navbtn"
                          style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "8px 12px", background: active ? "rgba(255,255,255,0.055)" : "transparent", border: "none", borderRadius: "9px", color: active ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "inherit", fontSize: "13.5px", fontWeight: active ? 500 : 400, cursor: "pointer", textAlign: "left", transition: "background .15s, color .15s" }}
                        >
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: active ? "#aebfff" : "rgba(255,255,255,0.22)" }} />
                          <span style={{ flex: 1 }}>{child.label}</span>
                          <Badge id={child.id} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
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
