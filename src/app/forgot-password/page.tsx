import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Visora account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
