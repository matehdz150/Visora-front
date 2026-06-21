import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Visora Cloud.",
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
