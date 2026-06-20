import type { Metadata } from "next";
import DocsPage from "@/components/docs";

export const metadata: Metadata = {
  title: "Docs",
  description: "Visora API and SDK documentation for image moderation, project policies, API keys, logs, and dashboard routes.",
};

export default function Docs() {
  return <DocsPage />;
}
