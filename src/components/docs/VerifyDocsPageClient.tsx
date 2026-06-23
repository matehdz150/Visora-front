"use client";

import { DocsShell } from "@/components/docs";
import {
  VERIFY_NAV_GROUPS,
  VERIFY_TOC_ITEMS,
  VerifyArticle,
} from "@/components/docs/content/VerifyArticle";

export function VerifyDocsPageClient() {
  return (
    <DocsShell navGroups={VERIFY_NAV_GROUPS} tocItems={VERIFY_TOC_ITEMS}>
      {(articleRef) => <VerifyArticle articleRef={articleRef} />}
    </DocsShell>
  );
}
