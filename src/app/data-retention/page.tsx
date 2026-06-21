import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Data Retention",
  description: "Data retention explanation for Visora Cloud image moderation data.",
};

export default function DataRetentionPage() {
  return <LegalPage kind="retention" />;
}
