"use client";

import React, { useEffect, useState } from "react";
import { MONO, text } from "./theme";
import { TOC_ITEMS } from "./data";

/**
 * Right rail "On this page" with scroll-spy: highlights the section nearest the
 * top of the viewport using an IntersectionObserver over the heading ids.
 */
export function DocsToc() {
  const [activeHref, setActiveHref] = useState(TOC_ITEMS[0]?.href ?? "");

  useEffect(() => {
    const ids = TOC_ITEMS.map((t) => t.href.replace("#", ""));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const firstVisible = ids.find((id) => visible.has(id));
        if (firstVisible) setActiveHref("#" + firstVisible);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();

    const element = document.getElementById(href.replace("#", ""));
    if (!element) return;

    setActiveHref(href);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <aside className="docs-toc" style={{ position: "sticky", top: "57px", alignSelf: "start", height: "calc(100vh - 57px)", padding: "44px 24px 60px" }}>
      <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: text.ghost, textTransform: "uppercase", marginBottom: "14px" }}>On this page</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
        {TOC_ITEMS.map((item) => {
          const on = item.href === activeHref;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => handleClick(event, item.href)}
              style={{ display: "block", padding: "6px 0 6px 14px", marginLeft: "-1px", fontSize: "13px", textDecoration: "none", color: on ? "#aebfff" : text.muted, borderLeft: "1px solid " + (on ? "#aebfff" : "transparent"), fontWeight: on ? 500 : 300, transition: "color .15s" }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </aside>
  );
}
