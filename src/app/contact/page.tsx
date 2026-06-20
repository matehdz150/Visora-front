import type { Metadata } from "next";
import { ContactPage } from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Visora team for product questions, support, and security reports.",
};

export default function Contact() {
  return <ContactPage />;
}
