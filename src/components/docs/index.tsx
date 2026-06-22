"use client";

import React, { useEffect, useRef, useState } from "react";
import { DocsTopBar } from "./DocsTopBar";
import { DocsSideNav } from "./DocsSideNav";
import { DocsToc } from "./DocsToc";
import { QuickstartArticle } from "./content/QuickstartArticle";
import { NAV_GROUPS, TOC_ITEMS, type NavGroup, type TocItem } from "./data";

function clearSearchHighlight() {
  const css = globalThis.CSS as typeof CSS & { highlights?: { delete: (name: string) => void } };
  css.highlights?.delete("docs-search");
}

function applySearchHighlight(root: HTMLElement, query: string) {
  const trimmed = query.trim();
  clearSearchHighlight();

  if (trimmed.length < 2) return;

  const css = globalThis.CSS as typeof CSS & { highlights?: { set: (name: string, highlight: unknown) => void } };
  const HighlightCtor = (globalThis as typeof globalThis & { Highlight?: new (...ranges: Range[]) => unknown }).Highlight;

  if (!css.highlights || !HighlightCtor) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const value = node.textContent ?? "";
      const parent = node.parentElement;

      if (!value.trim() || !parent) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "BUTTON"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const ranges: Range[] = [];
  const needle = trimmed.toLowerCase();
  let node = walker.nextNode();

  while (node) {
    const value = node.textContent ?? "";
    const lowerValue = value.toLowerCase();
    let index = lowerValue.indexOf(needle);

    while (index !== -1) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + trimmed.length);
      ranges.push(range);
      index = lowerValue.indexOf(needle, index + trimmed.length);
    }

    node = walker.nextNode();
  }

  if (ranges.length > 0) css.highlights.set("docs-search", new HighlightCtor(...ranges));
}

/**
 * Visora — documentation page.
 *
 * Three-column docs shell (sidebar · article · table of contents). The article
 * is searchable from the top bar, and matches are highlighted with the CSS
 * Custom Highlight API so React-owned markup stays untouched.
 */
export function DocsShell({
  children,
  navGroups = NAV_GROUPS,
  tocItems = TOC_ITEMS,
}: {
  children: (articleRef: React.Ref<HTMLElement>) => React.ReactNode;
  navGroups?: NavGroup[];
  tocItems?: TocItem[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    applySearchHighlight(article, searchQuery);
    return clearSearchHighlight;
  }, [searchQuery]);

  return (
    <div style={{ minHeight: "100vh", background: "#050505" }}>
      <style>{"::highlight(docs-search) { background: rgba(174, 191, 255, 0.18); color: #fff; text-decoration: underline; text-decoration-color: #aebfff; text-underline-offset: 3px; }"}</style>
      <DocsTopBar searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
      <div className="docs-grid" style={{ display: "grid", gridTemplateColumns: "248px minmax(0, 1fr) 220px", maxWidth: "1320px", margin: "0 auto" }}>
        <DocsSideNav groups={navGroups} />
        {children(articleRef)}
        <DocsToc items={tocItems} />
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <DocsShell>
      {(articleRef) => <QuickstartArticle articleRef={articleRef} />}
    </DocsShell>
  );
}
