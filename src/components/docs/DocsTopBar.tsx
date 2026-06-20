"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MONO, surface, text } from "./theme";
import { SEARCH_INDEX } from "./data";
import { VisoraLogo } from "@/components/VisoraLogo";

interface DocsTopBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

function scrollToHref(href: string) {
  const element = document.getElementById(href.replace("#", ""));
  if (!element) return;

  element.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
}

function HighlightText({ value, query }: { value: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{value}</>;

  const lowerValue = value.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = lowerValue.indexOf(lowerQuery);

  while (index !== -1) {
    if (index > cursor) parts.push(value.slice(cursor, index));
    parts.push(
      <span key={index} style={{ textDecoration: "underline", textDecorationColor: "#aebfff", textUnderlineOffset: "3px", color: "#fff" }}>
        {value.slice(index, index + trimmed.length)}
      </span>,
    );
    cursor = index + trimmed.length;
    index = lowerValue.indexOf(lowerQuery, cursor);
  }

  if (cursor < value.length) parts.push(value.slice(cursor));
  return <>{parts}</>;
}

/** Sticky docs top bar: wordmark, search, and primary links. */
export function DocsTopBar({ searchQuery, onSearchQueryChange }: DocsTopBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const query = searchQuery.trim();

  const results = useMemo(() => {
    if (!query) return SEARCH_INDEX.slice(0, 5);

    const q = query.toLowerCase();
    return SEARCH_INDEX.filter((item) => {
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }).slice(0, 7);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function chooseFirstResult() {
    const first = results[0];
    if (!first) return;

    setOpen(false);
    inputRef.current?.blur();
    scrollToHref(first.href);
  }

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", background: "rgba(5,5,5,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid " + surface.borderFaint }}>
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none", color: "#fff" }}>
          <VisoraLogo markSize={26} fontSize={17} tone="light" docsLabel />
        </Link>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        <div style={{ position: "relative" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(255,255,255,0.04)", border: "1px solid " + surface.border, borderRadius: "9px", padding: "7px 12px", minWidth: "260px", cursor: "text", fontFamily: "inherit", transition: "border-color .15s, background .15s" }}>
            <span style={{ width: "13px", height: "13px", border: "1.5px solid rgba(255,255,255,0.35)", borderRadius: "50%", flexShrink: 0 }} />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(event) => {
                onSearchQueryChange(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") chooseFirstResult();
              }}
              placeholder="Search docs"
              type="search"
              aria-label="Search documentation"
              style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "#fff", fontSize: "13px", fontFamily: "inherit" }}
            />
            <span style={{ fontFamily: MONO, fontSize: "11px", color: text.ghost, border: "1px solid rgba(255,255,255,0.14)", borderRadius: "5px", padding: "1px 6px" }}>⌘K</span>
          </label>

          {open ? (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 9px)", width: "420px", maxWidth: "calc(100vw - 32px)", border: "1px solid " + surface.border, borderRadius: "12px", background: "rgba(12,12,12,0.98)", boxShadow: "0 22px 70px rgba(0,0,0,0.45)", overflow: "hidden" }}>
              <div style={{ padding: "8px", maxHeight: "360px", overflowY: "auto" }}>
                {results.length > 0 ? results.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setOpen(false);
                      scrollToHref(item.href);
                    }}
                    style={{ width: "100%", display: "block", textAlign: "left", padding: "10px 11px", border: 0, borderRadius: "9px", background: "transparent", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={(event) => { event.currentTarget.style.background = "rgba(255,255,255,0.055)"; }}
                    onMouseLeave={(event) => { event.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "13.5px", fontWeight: 600, marginBottom: "4px" }}>
                      <HighlightText value={item.title} query={query} />
                    </div>
                    <div style={{ fontSize: "12.5px", lineHeight: 1.45, color: text.muted }}>
                      <HighlightText value={item.description} query={query} />
                    </div>
                  </button>
                )) : (
                  <div style={{ padding: "18px 14px", fontSize: "13px", color: text.muted }}>No docs results found.</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "9px 12px", borderTop: "1px solid " + surface.borderFaint, color: text.ghost, fontFamily: MONO, fontSize: "11px" }}>
                <span>Enter to open</span>
                <span>Esc to close</span>
              </div>
            </div>
          ) : null}
        </div>
        <a href="#api-reference" onClick={(event) => { event.preventDefault(); scrollToHref("#api-reference"); }} className="docs-navlink" style={{ fontSize: "13.5px", color: text.body, textDecoration: "none" }}>API</a>
        <Link href="/dashboard" style={{ fontSize: "13.5px", fontWeight: 500, color: "#050505", background: "#fff", padding: "8px 15px", borderRadius: "9px", textDecoration: "none" }}>Dashboard</Link>
      </div>
    </header>
  );
}
