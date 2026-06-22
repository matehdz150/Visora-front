import type { Metadata } from "next";
import { WebhooksDocsPageClient } from "@/components/docs/WebhooksDocsPageClient";

export const metadata: Metadata = {
  title: "Webhooks Docs",
  description: "Developer documentation for Visora webhooks — signed event delivery, event types, signature verification, and the @visoracloud/client SDK handlers.",
};

export default function WebhooksDocsPage() {
  return <WebhooksDocsPageClient />;
}
