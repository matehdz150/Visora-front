"use client";

import { DocsShell } from "@/components/docs";
import {
  WEBHOOKS_NAV_GROUPS,
  WEBHOOKS_TOC_ITEMS,
  WebhooksArticle,
} from "@/components/docs/content/WebhooksArticle";

export function WebhooksDocsPageClient() {
  return (
    <DocsShell navGroups={WEBHOOKS_NAV_GROUPS} tocItems={WEBHOOKS_TOC_ITEMS}>
      {(articleRef) => <WebhooksArticle articleRef={articleRef} />}
    </DocsShell>
  );
}
