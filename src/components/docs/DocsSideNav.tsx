"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MONO, text } from "./theme";
import { NAV_GROUPS } from "./data";

/** Left sidebar: grouped documentation navigation with smooth in-page scrolling. */
export function DocsSideNav() {
  const items = useMemo(() => NAV_GROUPS.flatMap((group) => group.items), []);
  const [activeHref, setActiveHref] = useState(items[0]?.href ?? "#overview");

  useEffect(() => {
    const ids = items.map((item) => item.href.replace("#", ""));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveHref("#" + visible[0].target.id);
          return;
        }

        const current = elements
          .filter((element) => element.getBoundingClientRect().top <= 96)
          .at(-1);

        if (current) setActiveHref("#" + current.id);
      },
      { rootMargin: "-86px 0px -68% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();

    const element = document.getElementById(href.replace("#", ""));
    if (!element) return;

    setActiveHref(href);
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <nav style={{ position: "sticky", top: "57px", alignSelf: "start", height: "calc(100vh - 57px)", overflowY: "auto", scrollBehavior: "smooth", padding: "30px 18px 60px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
      {NAV_GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: "26px" }}>
          <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: text.ghost, textTransform: "uppercase", padding: "0 12px", marginBottom: "10px" }}>{group.title}</div>
          {group.items.map((item) => {
            const active = item.href === activeHref;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(event) => handleClick(event, item.href)}
                className={active ? undefined : "docs-navitem"}
                style={{ display: "block", padding: "7px 12px", borderRadius: "8px", fontSize: "13.5px", textDecoration: "none", fontWeight: active ? 500 : 400, color: active ? "#fff" : text.muted, background: active ? "rgba(126,155,255,0.1)" : "transparent", borderLeft: "2px solid " + (active ? "#aebfff" : "transparent"), transition: "color .15s, background .15s, border-color .15s" }}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
