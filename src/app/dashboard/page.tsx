import type { Metadata } from "next";
import Dashboard from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor moderation activity across your projects.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
