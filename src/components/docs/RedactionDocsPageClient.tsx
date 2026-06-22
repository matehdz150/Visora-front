"use client";

import { DocsShell } from "@/components/docs";
import {
  REDACTION_NAV_GROUPS,
  REDACTION_TOC_ITEMS,
  RedactionArticle,
} from "@/components/docs/content/RedactionArticle";

export function RedactionDocsPageClient() {
  return (
    <DocsShell navGroups={REDACTION_NAV_GROUPS} tocItems={REDACTION_TOC_ITEMS}>
      {(articleRef) => <RedactionArticle articleRef={articleRef} />}
    </DocsShell>
  );
}
