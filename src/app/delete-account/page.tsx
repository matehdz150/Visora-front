import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Delete Account Policy",
  description: "Delete account policy for Visora Cloud.",
};

export default function DeleteAccountPage() {
  return <LegalPage kind="delete-account" />;
}
