import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallback } from "@/components/auth-callback";

export const metadata: Metadata = {
  title: "Signing in",
  description: "Completing your Visora sign in.",
};

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallback />
    </Suspense>
  );
}

function AuthCallbackFallback() {
  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-sora), sans-serif" }}>
      <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.58)" }}>Completing sign in...</div>
    </main>
  );
}
