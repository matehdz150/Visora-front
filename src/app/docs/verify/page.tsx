import type { Metadata } from "next";
import { VerifyDocsPageClient } from "@/components/docs/VerifyDocsPageClient";

export const metadata: Metadata = {
  title: "Verify Docs",
  description: "Developer documentation for Visora identity verification — document authenticity, face match, selfie quality, decisions, settings, and the @visoracloud/client SDK.",
};

export default function VerifyDocsPage() {
  return <VerifyDocsPageClient />;
}
