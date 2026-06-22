import type { Metadata } from "next";
import { RedactionDocsPageClient } from "@/components/docs/RedactionDocsPageClient";

export const metadata: Metadata = {
  title: "Redaction Docs",
  description: "Developer documentation for Visora image redaction, face blur, text blur, license plate blur, and the @visoracloud/client SDK.",
};

export default function RedactionDocsPage() {
  return <RedactionDocsPageClient />;
}
