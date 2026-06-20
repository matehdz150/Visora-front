"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VisoraLogo } from "@/components/VisoraLogo";
import { confirmForgotPassword, forgotPassword } from "@/lib/visora-api";

function passwordMeetsPolicy(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0e0e10",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "11px",
  padding: "12px 14px",
  color: "#fff",
  fontFamily: "inherit",
  fontSize: "14px",
};

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (!codeSent) {
        await forgotPassword(normalizedEmail);
        setCodeSent(true);
        setNotice("We sent a password reset code to your email.");
        return;
      }

      if (!passwordMeetsPolicy(newPassword)) {
        throw new Error("Password must be at least 8 characters and include uppercase, lowercase, and a number");
      }

      await confirmForgotPassword(normalizedEmail, confirmationCode.trim(), newPassword);
      router.push("/login?reset=success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "var(--font-sora), sans-serif" }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: "420px", background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px", padding: "28px", boxShadow: "0 24px 70px rgba(0,0,0,0.45)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "22px" }}>
          <VisoraLogo markSize={30} fontSize={21} tone="light" />
        </div>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600, letterSpacing: "-0.025em" }}>{codeSent ? "Enter reset code" : "Reset password"}</h1>
        <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.6, color: "rgba(255,255,255,0.52)", fontWeight: 300 }}>
          {codeSent ? "Use the code sent to your email and choose a new password." : "Enter your account email and we will send a reset code."}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "26px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@company.com" disabled={codeSent || loading} style={inputStyle} />
          </div>

          {codeSent && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>Reset code</label>
                <input value={confirmationCode} onChange={(event) => setConfirmationCode(event.target.value)} type="text" inputMode="numeric" placeholder="123456" disabled={loading} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>New password</label>
                <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" placeholder="••••••••" disabled={loading} style={inputStyle} />
                <div style={{ marginTop: "8px", fontSize: "11.5px", color: "rgba(255,255,255,0.35)", lineHeight: 1.45 }}>
                  Use 8+ characters with uppercase, lowercase, and a number.
                </div>
              </div>
            </>
          )}
        </div>

        {(error || notice) && (
          <div style={{ marginTop: "18px", padding: "12px 14px", borderRadius: "11px", border: "1px solid " + (error ? "rgba(255,155,155,0.28)" : "rgba(126,155,255,0.28)"), background: error ? "rgba(255,90,90,0.08)" : "rgba(126,155,255,0.08)", color: error ? "#ffb7b7" : "#c5d0ff", fontSize: "13px", lineHeight: 1.45 }}>
            {error ?? notice}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", marginTop: "22px", padding: "13px", background: loading ? "rgba(174,191,255,0.55)" : "#aebfff", color: "#050505", border: "none", borderRadius: "11px", fontFamily: "inherit", fontSize: "15px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Please wait..." : codeSent ? "Reset password" : "Send reset code"}
        </button>

        <p style={{ margin: "22px 0 0", textAlign: "center", fontSize: "13.5px", color: "rgba(255,255,255,0.45)" }}>
          Remember your password? <Link href="/login" style={{ color: "#aebfff", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </p>
      </form>
    </main>
  );
}
