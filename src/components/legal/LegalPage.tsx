"use client";

import Link from "next/link";
import { VisoraLogo } from "@/components/VisoraLogo";

const MONO = "var(--font-jetbrains), monospace";
const UPDATED_AT = "June 20, 2026";

type LegalPageKind = "terms" | "privacy" | "retention" | "delete-account";

type LegalSection = {
  title: string;
  body: string[];
};

const legalContent: Record<
  LegalPageKind,
  {
    eyebrow: string;
    title: string;
    summary: string;
    sections: LegalSection[];
  }
> = {
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    summary:
      "These terms explain how customers may use Visora Cloud, what content can be submitted, and how responsibility is shared when using automated image moderation.",
    sections: [
      {
        title: "1. Agreement",
        body: [
          "These Terms of Service govern your access to and use of Visora Cloud, including the dashboard, APIs, SDKs, documentation, image upload flow, moderation results, webhooks, and related services.",
          "By creating an account, choosing a plan, generating an API key, or using the API, you agree to these terms. If you use Visora for a company or organization, you represent that you have authority to bind that organization.",
        ],
      },
      {
        title: "2. What Visora does",
        body: [
          "Visora provides automated image moderation tools. The service may analyze images, generate labels, risk scores, categories, policy decisions, review queue items, logs, webhook events, and related metadata.",
          "Moderation results are probabilistic. Visora does not guarantee that every unsafe image will be detected or that every safe image will be allowed. You are responsible for deciding how to use moderation results in your product.",
        ],
      },
      {
        title: "3. Customer content and image storage",
        body: [
          "When you upload or submit images for moderation, those images may be stored in Visora-controlled storage so the platform can process the image, show moderation details, support review workflows, preserve logs, deliver webhooks, debug failures, and operate the service.",
          "Images are scoped by account and project. You are responsible for ensuring you have the rights, permissions, notices, and legal basis required to upload, process, and store any image you submit to Visora.",
          "You must not submit content that is illegal, content you do not have permission to process, child sexual abuse material, non-consensual intimate imagery, content intended to harm or exploit people, or sensitive regulated data unless you have a lawful basis and Visora has expressly agreed in writing.",
        ],
      },
      {
        title: "4. API keys and account security",
        body: [
          "You are responsible for keeping API keys, dashboard credentials, webhook secrets, and access tokens secure. Do not expose API keys in frontend code, public repositories, client-side apps, logs, screenshots, or support requests.",
          "Activity performed with your API keys or account credentials may be treated as activity by you. Rotate or revoke compromised keys immediately from the dashboard.",
        ],
      },
      {
        title: "5. Acceptable use",
        body: [
          "You may not use Visora to break the law, violate third-party rights, reverse engineer the service, bypass usage limits, overload the infrastructure, resell the service as a standalone moderation API without permission, or build systems that make illegal or harmful decisions about people.",
          "You may not use Visora as the only decision maker for high-risk, legally significant, employment, credit, housing, healthcare, law enforcement, immigration, or similarly sensitive decisions without appropriate human review and independent legal review.",
        ],
      },
      {
        title: "6. Plans, limits, and billing",
        body: [
          "Plans may include monthly usage limits, retention periods, feature access, and overage terms. Free plans may be blocked when limits are reached. Paid plans may support additional usage or overages depending on the plan configuration.",
          "Payments are processed by Stripe. Visora does not store raw card numbers. If you upgrade, downgrade, cancel, or fail to pay, your plan, access, retention, and limits may change.",
        ],
      },
      {
        title: "7. Data retention and deletion",
        body: [
          "Visora retains images, moderation logs, review items, webhook delivery records, usage records, and account metadata according to the plan and operational needs described in the Data Retention page.",
          "Deleting an account removes account-scoped application data and uploaded objects from active systems where technically possible. Some records may remain temporarily in backups, security logs, billing records, audit logs, or systems needed for legal, tax, fraud prevention, or dispute purposes.",
        ],
      },
      {
        title: "8. Service availability and changes",
        body: [
          "Visora may change features, limits, APIs, plans, SDKs, and documentation as the product evolves. We aim to avoid breaking changes, but you are responsible for testing integrations and handling API errors gracefully.",
          "The service is provided without any guarantee of uninterrupted availability, perfect accuracy, or fitness for a specific compliance outcome.",
        ],
      },
      {
        title: "9. Limitation of liability",
        body: [
          "To the maximum extent permitted by law, Visora will not be liable for indirect, incidental, special, consequential, punitive, or lost-profit damages arising from use of the service, moderation decisions, false positives, false negatives, downtime, data loss, or third-party services.",
          "You are responsible for your application, your users, your policies, and your use of Visora outputs.",
        ],
      },
      {
        title: "10. Contact",
        body: [
          "Questions about these terms can be sent to support@visoracloud.com. Security concerns should be sent to security@visoracloud.com.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    summary:
      "This policy explains what Visora Cloud collects, why we collect it, how moderation data is used, and how customers can request access or deletion.",
    sections: [
      {
        title: "1. Information we collect",
        body: [
          "Account information: email address, authentication provider, selected plan, organization/account identifiers, project identifiers, API key metadata, and dashboard activity needed to operate the service.",
          "Moderation data: uploaded images, image keys, moderation labels, categories, risk scores, policy decisions, review status, webhook events, delivery logs, usage counts, timestamps, and technical metadata.",
          "Payment information: subscription, customer, invoice, and payment status information from Stripe. Visora does not store raw payment card numbers.",
          "Technical information: request IDs, route names, error logs, authentication events, IP-related infrastructure logs, user agent information, and operational logs needed for security, debugging, abuse prevention, and reliability.",
        ],
      },
      {
        title: "2. How we use information",
        body: [
          "We use information to provide image moderation, generate upload URLs, apply project policies, maintain review queues, deliver webhooks, enforce API limits, operate billing, provide support, secure the service, debug errors, and improve product reliability.",
          "We do not sell customer images or moderation logs. We do not use customer images to build unrelated advertising profiles.",
        ],
      },
      {
        title: "3. Customer images",
        body: [
          "Images submitted through Visora may be stored so the product can process moderation, show moderation details, support review workflows, maintain logs, troubleshoot failures, and comply with retention settings.",
          "Customers control what images they submit. Customers are responsible for giving end users appropriate notices and obtaining any required permissions before sending images to Visora.",
        ],
      },
      {
        title: "4. Sharing and processors",
        body: [
          "Visora uses service providers to run the product, including cloud infrastructure, authentication, payment processing, email/authentication delivery, analytics-free operational logging, and related security tooling.",
          "We may disclose information when required by law, to protect the service, to investigate abuse or security incidents, to enforce our terms, or as part of a business transaction such as a merger, financing, or acquisition.",
        ],
      },
      {
        title: "5. Retention",
        body: [
          "Retention depends on your plan, your account settings, and the operational needs of the service. See the Data Retention page for the current default retention periods.",
          "Deletion from active systems may not immediately remove data from backups, security logs, billing records, or audit records. Those systems are retained for limited periods for security, legal, tax, fraud prevention, and operational reasons.",
        ],
      },
      {
        title: "6. Security",
        body: [
          "We use account-scoped object paths, API key hashing, token-based dashboard authentication, webhook signatures, access controls, and operational logging to protect the service.",
          "No system is perfectly secure. You are responsible for securing your own API keys, webhook endpoints, dashboard sessions, and applications.",
        ],
      },
      {
        title: "7. Your choices",
        body: [
          "You can update account settings, revoke or rotate API keys, delete projects, cancel paid plans through billing flows, and delete your Visora account from the dashboard where available.",
          "You can contact privacy@visoracloud.com for privacy requests, including access, correction, deletion, or questions about how data is processed.",
        ],
      },
      {
        title: "8. Children's data",
        body: [
          "Visora is not directed to children. Customers must not use Visora to knowingly collect or process children's personal information unless they have a lawful basis, appropriate notices, parental consent where required, and any additional agreement required by Visora.",
        ],
      },
      {
        title: "9. International use",
        body: [
          "If you use Visora from outside the United States or submit data about people outside the United States, you are responsible for ensuring your use complies with applicable privacy, data protection, and transfer laws.",
        ],
      },
      {
        title: "10. Contact",
        body: [
          "Privacy questions: privacy@visoracloud.com. Support questions: support@visoracloud.com. Security reports: security@visoracloud.com.",
        ],
      },
    ],
  },
  retention: {
    eyebrow: "Data",
    title: "Data Retention",
    summary:
      "This page explains how long Visora keeps uploaded images, moderation logs, review records, webhook logs, usage records, and account data.",
    sections: [
      {
        title: "1. What Visora stores",
        body: [
          "Visora may store uploaded images, generated image keys, moderation responses, labels, categories, risk scores, policy explanations, brand safety and compliance evaluations, review queue decisions, webhook events, delivery attempts, API usage records, account metadata, project settings, and API key metadata.",
          "Uploaded images are stored under account and project scoped paths so one account cannot access another account's images through Visora APIs.",
        ],
      },
      {
        title: "2. Default image retention by plan",
        body: [
          "Free: up to 7 days.",
          "Starter: up to 30 days.",
          "Growth: up to 90 days.",
          "Scale: up to 180 days.",
          "These periods describe default retention targets for active object storage. Actual deletion can be delayed by lifecycle processing, backups, operational queues, logs, legal holds, billing records, security records, or incident investigation needs.",
        ],
      },
      {
        title: "3. Logs and moderation records",
        body: [
          "Moderation logs and review records may be kept so customers can inspect results, resolve reviews, view dashboard metrics, retry webhooks, debug integrations, and audit API usage.",
          "Webhook delivery records are retained to troubleshoot failed deliveries and support retry/replay workflows. Usage records may be retained for billing, limit enforcement, fraud prevention, and account history.",
        ],
      },
      {
        title: "4. Account deletion",
        body: [
          "When you delete your account, Visora attempts to remove account-scoped projects, API keys, policies, moderation logs, review records, webhook settings/events, usage records, and uploaded images from active systems.",
          "Active paid subscriptions must be cancelled before deleting an account. Payment, invoice, tax, abuse-prevention, security, backup, and audit records may remain for limited periods where necessary.",
        ],
      },
      {
        title: "5. Customer responsibilities",
        body: [
          "Do not submit images longer than you are allowed to process them. If your product requires shorter retention, delete the project or account data earlier, avoid sending unnecessary images, or contact support about retention requirements before production use.",
          "You are responsible for telling your own users how their images are processed and retained when your application sends those images to Visora.",
        ],
      },
      {
        title: "6. Contact",
        body: [
          "For retention questions or deletion requests, contact privacy@visoracloud.com or support@visoracloud.com.",
        ],
      },
    ],
  },
  "delete-account": {
    eyebrow: "Account",
    title: "Delete Account Policy",
    summary:
      "This page explains what happens when a Visora Cloud account is deleted and what data may remain for limited operational or legal reasons.",
    sections: [
      {
        title: "1. How to delete your account",
        body: [
          "Account deletion is available in the dashboard settings. You must confirm the deletion before it is submitted.",
          "If you have an active paid subscription, cancel the subscription first through billing settings. Account deletion may be blocked until the active subscription is cancelled or resolved.",
        ],
      },
      {
        title: "2. What active data is deleted",
        body: [
          "Visora attempts to delete your account record, projects, API keys, project policies, moderation logs, review queue items, webhook endpoints, webhook events, usage records, identity links, and uploaded images stored under your account-scoped object path.",
          "After deletion, API keys should stop working, dashboard access to the deleted account should stop, and project-scoped images should no longer be available through Visora.",
        ],
      },
      {
        title: "3. What may remain",
        body: [
          "Some information may remain temporarily or as required in backups, security logs, billing and invoice records, fraud-prevention records, abuse reports, audit logs, tax records, dispute records, or legal preservation systems.",
          "Deleting your Visora account does not automatically delete accounts you maintain with third-party identity providers, such as Google or GitHub, or payment records held by Stripe.",
        ],
      },
      {
        title: "4. Irreversible action",
        body: [
          "Account deletion is intended to be permanent. Deleted projects, API keys, moderation history, review queue items, webhook configuration, and uploaded images may not be recoverable.",
        ],
      },
      {
        title: "5. Support",
        body: [
          "If you cannot access your dashboard or need help with deletion, contact support@visoracloud.com from the email address associated with your Visora account.",
        ],
      },
    ],
  },
};

const relatedLinks = [
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
  ["Data retention", "/data-retention"],
  ["Delete account", "/delete-account"],
  ["Contact", "/contact"],
];

const activeLegalHref: Record<LegalPageKind, string> = {
  terms: "/terms",
  privacy: "/privacy",
  retention: "/data-retention",
  "delete-account": "/delete-account",
};

export function LegalPage({ kind }: { kind: LegalPageKind }) {
  const page = legalContent[kind];
  const activeHref = activeLegalHref[kind];

  return (
    <main className="lp-root" style={{ minHeight: "100vh", background: "#050505", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-260px", right: "-240px", width: "820px", height: "620px", background: "radial-gradient(ellipse at center, rgba(126,155,255,0.14), rgba(126,155,255,0) 64%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(to bottom, #000 0%, transparent 74%)", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", background: "rgba(5,5,5,0.76)", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <VisoraLogo markSize={26} fontSize={18} tone="light" />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/docs" style={{ color: "rgba(255,255,255,0.64)", textDecoration: "none", fontSize: "14px" }}>Docs</Link>
          <Link href="/contact" style={{ color: "rgba(255,255,255,0.64)", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
        </div>
      </nav>

      <section style={{ position: "relative", zIndex: 1, maxWidth: "1120px", margin: "0 auto", padding: "86px 40px 96px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: "54px", alignItems: "start" }} className="legal-grid">
          <aside style={{ position: "sticky", top: "96px", display: "grid", gap: "12px" }}>
            <div style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.12em", color: "#8fa0d8", textTransform: "uppercase", marginBottom: "8px" }}>Legal center</div>
            {relatedLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "12px 13px",
                  borderRadius: "12px",
                  border: href === activeHref ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.07)",
                  background: href === activeHref ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.025)",
                  color: href === activeHref ? "#fff" : "rgba(255,255,255,0.62)",
                  textDecoration: "none",
                  fontSize: "13.5px",
                }}
              >
                {label}
              </Link>
            ))}
          </aside>

          <article>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "24px", padding: "7px 11px", borderRadius: "999px", background: "rgba(126,155,255,0.08)", border: "1px solid rgba(126,155,255,0.2)", color: "#aebfff", fontFamily: MONO, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {page.eyebrow}
            </div>
            <h1 style={{ margin: "0 0 18px", fontSize: "clamp(46px, 7vw, 82px)", lineHeight: 0.95, letterSpacing: "-0.055em", fontWeight: 600 }}>{page.title}</h1>
            <p style={{ maxWidth: "760px", margin: "0 0 18px", color: "rgba(255,255,255,0.6)", fontSize: "17px", lineHeight: 1.65, fontWeight: 300 }}>{page.summary}</p>
            <p style={{ margin: "0 0 46px", color: "rgba(255,255,255,0.38)", fontSize: "12.5px", fontFamily: MONO }}>Last updated: {UPDATED_AT}</p>

            <div style={{ display: "grid", gap: "18px" }}>
              {page.sections.map((section) => (
                <section key={section.title} style={{ padding: "24px", borderRadius: "18px", background: "rgba(255,255,255,0.026)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h2 style={{ margin: "0 0 14px", fontSize: "18px", letterSpacing: "-0.02em", fontWeight: 600 }}>{section.title}</h2>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {section.body.map((paragraph) => (
                      <p key={paragraph} style={{ margin: 0, color: "rgba(255,255,255,0.62)", fontSize: "14.5px", lineHeight: 1.75, fontWeight: 300 }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div style={{ marginTop: "26px", padding: "20px 22px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.035)", color: "rgba(255,255,255,0.58)", fontSize: "13.5px", lineHeight: 1.65 }}>
              These pages are product-facing legal documentation for Visora Cloud. They should be reviewed by qualified counsel before relying on them as final legal terms.
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
