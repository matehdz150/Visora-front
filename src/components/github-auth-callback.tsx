"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { VisoraLogo } from "@/components/VisoraLogo";
import {
  exchangeGitHubCodeForSession,
  readOAuthState,
  saveSession,
} from "@/lib/visora-api";

export function GitHubAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      const oauthError = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const code = searchParams.get("code");
      const state = readOAuthState(searchParams.get("state"));

      if (oauthError) {
        throw new Error(errorDescription ?? oauthError);
      }

      if (!code) {
        throw new Error("Missing authorization code");
      }

      if (!state) {
        throw new Error("Invalid sign-in state. Please try again.");
      }

      const session = await exchangeGitHubCodeForSession(code, state.planId);
      saveSession(session);

      if (state.intent === "signup" && state.planId && state.planId !== "free") {
        router.replace(`/checkout?plan=${state.planId}`);
        return;
      }

      if (!cancelled) {
        router.replace(state.returnTo ?? "/dashboard");
      }
    }

    completeSignIn().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Could not complete sign in");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-sora), sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "28px", textAlign: "center", boxShadow: "0 24px 70px rgba(0,0,0,0.45)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
          <VisoraLogo markSize={30} fontSize={21} tone="light" />
        </div>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 600, letterSpacing: "0" }}>{error ? "Sign in failed" : "Completing sign in"}</h1>
        <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>
          {error ?? "We are verifying your GitHub account and preparing your workspace."}
        </p>
        {error ? (
          <Link href="/login" style={{ display: "inline-flex", marginTop: "22px", padding: "10px 15px", borderRadius: "10px", background: "#fff", color: "#050505", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Back to sign in</Link>
        ) : (
          <div style={{ width: "100%", height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: "24px" }}>
            <div style={{ width: "42%", height: "100%", borderRadius: "999px", background: "#fff", animation: "ldProgress 1.4s ease-in-out infinite" }} />
          </div>
        )}
      </div>
    </main>
  );
}
