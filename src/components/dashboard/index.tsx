"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { ModDetail } from "./ModDetail";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { OverviewPage } from "./pages/OverviewPage";
import { ModerationsPage } from "./pages/ModerationsPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import { WebhooksPage } from "./pages/WebhooksPage";
import { AdminPage } from "./pages/AdminPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { CreateProjectPage, type CreateProjectInput } from "./pages/CreateProjectPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ToastViewport, type DashboardNotify, type DashboardToast } from "./Toast";
import type { ApiKey, ModLog, Page, Project, ReviewItem, UsageSummary, WebhookEndpoint, WebhookEventLog, WebhookEventStatus, WebhookEventType } from "./types";
import type { PolicyMap, PolicyPatch } from "./usePolicyStore";
import {
  changeBillingPlan,
  clearSession,
  createBillingPortalSession,
  createDashboardProject,
  deleteAccount,
  createProjectApiKey,
  createProjectWebhook,
  decideReviewQueueItem,
  deleteDashboardProject,
  disableProjectWebhook,
  getAdminOverview,
  getDashboardData,
  getStoredSession,
  listProjectWebhooks,
  listReviewQueue,
  listWebhookEvents,
  renameDashboardProject,
  renameProjectApiKey,
  retryWebhookEvent,
  revokeProjectApiKey,
  rotateProjectApiKey,
  rotateProjectWebhookSecret,
  saveDashboardPolicy,
  syncBillingAccount,
  updateAccountPlan,
  type AdminOverviewData,
  type CurrentUser,
  type DashboardAccount,
  type DashboardWebhookEndpoint,
  type PlanId,
} from "@/lib/visora-api";
import { makePolicy } from "./engine";
import { mapApiKey, mapDashboardData, mapProject, mapPolicy, mapReviewItem, reviewToModLog, toDashboardPolicy } from "./live-data";
import { pageVariants } from "./animations";

function mapWebhook(endpoint: DashboardWebhookEndpoint): WebhookEndpoint {
  return {
    webhookId: endpoint.webhookId,
    projectId: endpoint.projectId,
    name: endpoint.name,
    url: endpoint.url,
    events: endpoint.events,
    status: endpoint.status,
    createdAt: endpoint.createdAt,
    updatedAt: endpoint.updatedAt,
    previousSecretExpiresAt: endpoint.previousSecretExpiresAt,
  };
}

/**
 * Visora — dashboard shell.
 *
 * Orchestrates navigation and the cross-cutting state (selected moderation,
 * workspace name, and the shared policy store). Each screen lives in its own
 * component under `./pages` and owns its local UI state; only state that more
 * than one screen needs is lifted here.
 */
export default function Dashboard() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("overview");
  const [selectedMod, setSelectedMod] = useState<ModLog | null>(null);
  const [workspace, setWorkspace] = useState("Visora Workspace");
  const [accountId, setAccountId] = useState("");
  const [accountPlan, setAccountPlan] = useState<DashboardAccount | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModLog[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEventLog[]>([]);
  const [loadingWebhookEvents, setLoadingWebhookEvents] = useState(false);
  const [webhooksByProject, setWebhooksByProject] = useState<Record<string, WebhookEndpoint[]>>({});
  const [loadingWebhooksProjectId, setLoadingWebhooksProjectId] = useState<string | null>(null);
  const [webhookSecret, setWebhookSecret] = useState<{ projectId: string; secret: string } | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminOverviewData | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [policyByProject, setPolicyByProject] = useState<PolicyMap>({});
  const [rawApiKey, setRawApiKey] = useState<string | null>(null);
  const [stats, setStats] = useState({ imagesModerated: 0, rejected: 0, review: 0, activeProjects: 0 });
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<DashboardToast[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [savingPolicyId, setSavingPolicyId] = useState<string | null>(null);
  const [resolvingReviewId, setResolvingReviewId] = useState<string | null>(null);
  const toastIdRef = useRef(0);

  const session = typeof window !== "undefined" ? getStoredSession() : null;

  const notify: DashboardNotify = useCallback((toast) => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, ...toast }].slice(-4));
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 4200);
  }, []);

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  const loadAdminOverview = useCallback(async (idToken: string, options: { silentForbidden?: boolean } = {}) => {
    if (!idToken) return;

    setLoadingAdmin(true);
    setAdminError(null);
    try {
      const data = await getAdminOverview(idToken);
      setAdminOverview(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load admin data";
      const forbidden = message.includes("Admin access");

      if (options.silentForbidden && forbidden) {
        setAdminOverview(null);
        return;
      }

      setAdminError(message);
      notify({ kind: "error", title: "Could not load admin data", message });
    } finally {
      setLoadingAdmin(false);
    }
  }, [notify]);

  const applyDashboardData = (data: Awaited<ReturnType<typeof getDashboardData>>) => {
    const mapped = mapDashboardData(data);
    setAccountId(data.account.accountId);
    setAccountPlan(data.account);
    setCurrentUser({ userId: data.account.userId, email: data.account.email });
    setProjects(mapped.projects);
    setApiKeys(mapped.apiKeys);
    setModerationLogs(mapped.moderationLogs);
    setPolicyByProject(mapped.policyByProject);
    setStats(mapped.stats);
    setUsage(mapped.usage);
    setError(null);
  };

  const loadDashboardSnapshot = async (idToken: string) => {
    const data = await getDashboardData(idToken);
    const mapped = mapDashboardData(data);
    const reviews = await listReviewQueue({ idToken, status: "pending", limit: 100 });

    applyDashboardData(data);
    setReviewQueue(reviews.map((review) => mapReviewItem(review, mapped.projects)));
  };

  const refreshDashboardData = async () => {
    if (!session?.idToken) return;
    await loadDashboardSnapshot(session.idToken);
  };

  useEffect(() => {
    const storedSession = getStoredSession();

    if (!storedSession?.idToken) {
      router.replace("/login");
      return;
    }

    const load = async () => {
      try {
        const billingStatus = new URLSearchParams(window.location.search).get("billing");

        if (billingStatus === "success") {
          try {
            await syncBillingAccount(storedSession.idToken);
            notify({ kind: "success", title: "Billing updated", message: "Your plan is now synced with Stripe." });
          } catch (err) {
            notify({ kind: "error", title: "Could not sync billing", message: err instanceof Error ? err.message : "Refresh the dashboard in a moment." });
          } finally {
            window.history.replaceState(null, "", "/dashboard");
          }
        }

        if (billingStatus === "cancelled") {
          notify({ kind: "error", title: "Checkout cancelled", message: "No changes were made to your plan." });
          window.history.replaceState(null, "", "/dashboard");
        }

        const [data, reviews] = await Promise.all([
          getDashboardData(storedSession.idToken),
          listReviewQueue({ idToken: storedSession.idToken, status: "pending", limit: 100 }),
        ]);
        const mapped = mapDashboardData(data);
        applyDashboardData(data);
        setReviewQueue(reviews.map((review) => mapReviewItem(review, mapped.projects)));
        void loadAdminOverview(storedSession.idToken, { silentForbidden: true });
      } catch (err) {
        if (err instanceof Error && err.message.includes("authorization")) {
          clearSession();
          router.replace("/login");
          return;
        }

        setError(err instanceof Error ? err.message : "Could not load dashboard");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router, loadAdminOverview, notify]);

  const setPolicy = (projectId: string, patch: PolicyPatch) => {
    setPolicyByProject((prev) => {
      const cur = prev[projectId];
      if (!cur) return prev;
      const next = typeof patch === "function" ? patch(cur) : patch;
      return { ...prev, [projectId]: { ...cur, ...next } };
    });
  };

  const goToCreateProject = () => setPage("create-project");

  const loadWebhookEvents = async (filters: {
    projectId?: string;
    status?: WebhookEventStatus | "all";
    eventType?: WebhookEventType | "all";
  } = {}) => {
    if (!session?.idToken) return;

    setLoadingWebhookEvents(true);
    try {
      const events = await listWebhookEvents({
        idToken: session.idToken,
        projectId: filters.projectId,
        status: filters.status,
        eventType: filters.eventType,
        limit: 75,
      });
      setWebhookEvents(events);
    } catch (err) {
      notify({ kind: "error", title: "Could not load webhook logs", message: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoadingWebhookEvents(false);
    }
  };

  const loadProjectWebhooks = async (projectId: string) => {
    if (!session?.idToken) return;

    setLoadingWebhooksProjectId(projectId);
    try {
      const webhooks = await listProjectWebhooks({ idToken: session.idToken, projectId });
      setWebhooksByProject((prev) => ({ ...prev, [projectId]: webhooks.map(mapWebhook) }));
    } catch (err) {
      notify({ kind: "error", title: "Could not load webhooks", message: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setLoadingWebhooksProjectId((current) => (current === projectId ? null : current));
    }
  };

  const openProject = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    setPolicyByProject((prev) =>
      prev[projectId]
        ? prev
        : { ...prev, [projectId]: makePolicy(project?.mode ?? "balanced", project?.compliancePack) },
    );
    setSelectedProjectId(projectId);
    setSelectedMod(null);
    setWebhookSecret((current) => (current?.projectId === projectId ? current : null));
    setPage("project-detail");
    void loadProjectWebhooks(projectId);
  };

  const createProject = async (input: CreateProjectInput) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    const project = await createDashboardProject({ idToken: session.idToken, name: input.name });
    const policy = makePolicy(input.mode);
    const savedPolicy = await saveDashboardPolicy({ idToken: session.idToken, policy: toDashboardPolicy(project.projectId, policy) });
    const uiProject = mapProject(project, savedPolicy);

    let createdApiKey: Awaited<ReturnType<typeof createProjectApiKey>> | null = null;
    if (input.generateApiKey) {
      createdApiKey = await createProjectApiKey({
        idToken: session.idToken,
        projectId: project.projectId,
        name: "Default key",
      });
    }

    setProjects((prev) => [...prev, uiProject]);
    setPolicyByProject((prev) => ({ ...prev, [project.projectId]: mapPolicy(savedPolicy) }));
    if (createdApiKey) {
      setRawApiKey(createdApiKey.rawApiKey);
      setApiKeys((prev) => [...prev, mapApiKey(createdApiKey, prev.length)]);
    }
    setStats((prev) => ({ ...prev, activeProjects: prev.activeProjects + 1 }));
    notify({ kind: "success", title: "Project created", message: `${project.name} is ready${createdApiKey ? " with a new API key." : "."}` });

    return {
      projectId: project.projectId,
      name: project.name,
      rawApiKey: createdApiKey?.rawApiKey,
    };
  };

  const createApiKey = async (projectId?: string) => {
    const targetProject = projectId ?? projects[0]?.id;
    if (!targetProject || !session?.idToken) return;

    try {
      const apiKey = await createProjectApiKey({
        idToken: session.idToken,
        projectId: targetProject,
        name: window.prompt("API key name", "Default key")?.trim() || undefined,
      });
      setRawApiKey(apiKey.rawApiKey);
      setApiKeys((prev) => [...prev, mapApiKey(apiKey, prev.length)]);
      setPage("keys");
      notify({ kind: "success", title: "API key created", message: "Copy the raw key now. It will only be shown once." });
    } catch (err) {
      notify({ kind: "error", title: "Could not create API key", message: err instanceof Error ? err.message : "Please try again." });
    }
  };

  const renameApiKey = async (apiKeyHash: string, name: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const apiKey = await renameProjectApiKey({ idToken: session.idToken, apiKeyHash, name });
      setApiKeys((prev) => prev.map((item, index) => (item.apiKeyHash === apiKeyHash ? mapApiKey(apiKey, index) : item)));
      notify({ kind: "success", title: "API key renamed", message: "The new name was saved." });
    } catch (err) {
      notify({ kind: "error", title: "Could not rename API key", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const revokeApiKey = async (apiKeyHash: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const apiKey = await revokeProjectApiKey({ idToken: session.idToken, apiKeyHash });
      setApiKeys((prev) => prev.map((item, index) => (item.apiKeyHash === apiKeyHash ? mapApiKey(apiKey, index) : item)));
      notify({ kind: "success", title: "API key revoked", message: "Requests using this key will now be rejected." });
    } catch (err) {
      notify({ kind: "error", title: "Could not revoke API key", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const rotateApiKey = async (apiKeyHash: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const response = await rotateProjectApiKey({ idToken: session.idToken, apiKeyHash });
      setRawApiKey(response.apiKey.rawApiKey);
      setApiKeys((prev) => {
        const next = prev.map((item, index) =>
          item.apiKeyHash === response.revokedApiKey.apiKeyHash
            ? mapApiKey(response.revokedApiKey, index)
            : item,
        );

        return [...next, mapApiKey(response.apiKey, next.length)];
      });
      notify({ kind: "success", title: "API key rotated", message: "The old key was revoked. Copy the new raw key now." });
    } catch (err) {
      notify({ kind: "error", title: "Could not rotate API key", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const renameProject = async (projectId: string, name: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const project = await renameDashboardProject({ idToken: session.idToken, projectId, name });
      const policy = policyByProject[project.projectId];
      const dashboardPolicy = policy ? toDashboardPolicy(project.projectId, policy) : undefined;
      const mapped = mapProject(project, dashboardPolicy);

      setProjects((prev) => prev.map((item) => (item.id === projectId ? mapped : item)));
      setModerationLogs((prev) => prev.map((log) => (log.projectId === projectId ? { ...log, project: mapped.name } : log)));
      notify({ kind: "success", title: "Project renamed", message: `${mapped.name} was saved.` });
    } catch (err) {
      notify({ kind: "error", title: "Could not rename project", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      await deleteDashboardProject({ idToken: session.idToken, projectId });
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      setApiKeys((prev) => prev.map((apiKey) => (apiKey.projectId === projectId ? { ...apiKey, status: "Revoked" } : apiKey)));
      setModerationLogs((prev) => prev.filter((log) => log.projectId !== projectId));
      setReviewQueue((prev) => prev.filter((review) => review.projectId !== projectId));
      setPolicyByProject((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      setStats((prev) => ({ ...prev, activeProjects: Math.max(0, prev.activeProjects - 1) }));
      setSelectedProjectId(null);
      setPage("projects");
      notify({ kind: "success", title: "Project deleted", message: "Attached API keys were revoked." });
    } catch (err) {
      notify({ kind: "error", title: "Could not delete project", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const createWebhook = async (projectId: string, input: { name?: string; url: string; events: WebhookEventType[] }) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const result = await createProjectWebhook({
        idToken: session.idToken,
        projectId,
        url: input.url,
        name: input.name,
        events: input.events,
      });
      setWebhooksByProject((prev) => ({
        ...prev,
        [projectId]: [mapWebhook(result.webhook), ...(prev[projectId] ?? [])],
      }));
      setWebhookSecret({ projectId, secret: result.secret });
      notify({ kind: "success", title: "Webhook created", message: "Copy the signing secret now. It will only be shown once." });
    } catch (err) {
      notify({ kind: "error", title: "Could not create webhook", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };


  const retryWebhook = async (eventId: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const event = await retryWebhookEvent({ idToken: session.idToken, eventId });
      setWebhookEvents((prev) => prev.map((item) => (item.eventId === eventId ? event : item)));
      notify({ kind: "success", title: "Webhook retry queued", message: "Visora will attempt to deliver this event again." });
      await loadWebhookEvents();
    } catch (err) {
      notify({ kind: "error", title: "Could not retry webhook", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const rotateWebhookSecret = async (projectId: string, webhookId: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const result = await rotateProjectWebhookSecret({ idToken: session.idToken, webhookId });
      setWebhooksByProject((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).map((item) =>
          item.webhookId === webhookId ? mapWebhook(result.webhook) : item,
        ),
      }));
      setWebhookSecret({ projectId, secret: result.secret });
      notify({ kind: "success", title: "Webhook secret rotated", message: "Copy the new signing secret now. The previous secret is retained for 24 hours." });
    } catch (err) {
      notify({ kind: "error", title: "Could not rotate webhook secret", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const disableWebhook = async (projectId: string, webhookId: string) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    try {
      const webhook = await disableProjectWebhook({ idToken: session.idToken, webhookId });
      setWebhooksByProject((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] ?? []).map((item) =>
          item.webhookId === webhookId ? mapWebhook(webhook) : item,
        ),
      }));
      notify({ kind: "success", title: "Webhook disabled", message: "Visora will stop sending events to this endpoint." });
    } catch (err) {
      notify({ kind: "error", title: "Could not disable webhook", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    }
  };

  const decideReview = async (reviewId: string, decision: "approved" | "rejected" | "ignored") => {
    if (!session?.idToken) throw new Error("Missing dashboard session");
    setResolvingReviewId(reviewId);

    try {
      await decideReviewQueueItem({ idToken: session.idToken, reviewId, decision });
      setReviewQueue((prev) => prev.filter((review) => review.reviewId !== reviewId));
      notify({ kind: "success", title: "Review resolved", message: `Marked as ${decision}.` });
    } catch (err) {
      notify({ kind: "error", title: "Could not resolve review", message: err instanceof Error ? err.message : "Please try again." });
      throw err;
    } finally {
      setResolvingReviewId(null);
    }
  };

  const openReviewModeration = (review: ReviewItem) => {
    setSelectedMod(reviewToModLog(review));
  };

  const savePolicy = async (projectId: string) => {
    const policy = policyByProject[projectId];
    if (!policy || !session?.idToken) return;
    setSavingPolicyId(projectId);
    try {
      const saved = await saveDashboardPolicy({ idToken: session.idToken, policy: toDashboardPolicy(projectId, policy) });
      setPolicyByProject((prev) => ({ ...prev, [projectId]: mapPolicy(saved) }));
      notify({ kind: "success", title: "Policy saved", message: "New moderation requests will use the updated project policy." });
    } catch (err) {
      notify({ kind: "error", title: "Could not save policy", message: err instanceof Error ? err.message : "Please try again." });
    } finally {
      setSavingPolicyId(null);
    }
  };

  const changePlan = async (planId: PlanId) => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    if (!accountPlan?.stripeCustomerId && planId !== "free") {
      window.location.assign(`/checkout?plan=${planId}`);
      return;
    }

    if (!accountPlan?.stripeCustomerId && planId === "free") {
      await updateAccountPlan(session.idToken, planId);
      await refreshDashboardData();
      notify({ kind: "success", title: "Plan updated", message: "Your account is now on the free plan." });
      return;
    }

    const result = await changeBillingPlan(session.idToken, planId);
    setAccountPlan(result.account);
    await refreshDashboardData();

    if (result.changeType === "scheduled") {
      const effectiveDate = result.effectiveAt ? new Date(result.effectiveAt).toLocaleDateString() : "the end of the billing period";
      notify({ kind: "success", title: "Plan change scheduled", message: `${planId} will take effect on ${effectiveDate}.` });
      return;
    }

    notify({ kind: "success", title: "Plan updated", message: `Your account is now on ${planId}.` });
  };

  const manageBilling = async () => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    const portal = await createBillingPortalSession(session.idToken);
    window.location.assign(portal.url);
  };

  const deleteCurrentAccount = async () => {
    if (!session?.idToken) throw new Error("Missing dashboard session");

    await deleteAccount(session.idToken);
    clearSession();
    notify({ kind: "success", title: "Account deleted", message: "Your Visora account data was removed." });
    router.replace("/");
  };

  const navigate = (p: Page) => {
    setPage(p);
    setSelectedMod(null);
    setMobileNavOpen(false);
    if (p !== "project-detail") setSelectedProjectId(null);
    if (p === "webhooks") void loadWebhookEvents();
    if (p === "admin" && session?.idToken) void loadAdminOverview(session.idToken);
  };

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;
  const selectedProjectPolicy = selectedProject ? policyByProject[selectedProject.id] : null;

  const renderPage = () => {
    if (page === "overview") return <OverviewPage projects={projects} logs={moderationLogs} stats={stats} usage={usage} onCreateProject={goToCreateProject} onSelectMod={setSelectedMod} onViewAll={() => setPage("moderations")} />;
    if (page === "moderations") return <ModerationsPage projects={projects} logs={moderationLogs} onSelectMod={setSelectedMod} />;
    if (page === "reviews") return <ReviewsPage projects={projects} reviews={reviewQueue} resolvingReviewId={resolvingReviewId} onOpenModeration={openReviewModeration} onDecideReview={decideReview} />;
    if (page === "webhooks") return <WebhooksPage projects={projects} events={webhookEvents} loading={loadingWebhookEvents} onRefresh={loadWebhookEvents} onRetryWebhook={retryWebhook} />;
    if (page === "admin") return <AdminPage data={adminOverview} loading={loadingAdmin} error={adminError} onRefresh={() => loadAdminOverview(session?.idToken ?? "")} />;
    if (page === "playground") return <PlaygroundPage projects={projects} idToken={session?.idToken ?? ""} onModerated={() => { void refreshDashboardData(); }} notify={notify} />;
    if (page === "projects") return <ProjectsPage accountId={accountId} projects={projects} onCreateProject={goToCreateProject} onSelectProject={openProject} />;
    if (page === "project-detail" && selectedProject && selectedProjectPolicy) {
      return (
        <ProjectDetailPage
          project={selectedProject}
          policy={selectedProjectPolicy}
          projectLogs={moderationLogs.filter((log) => log.projectId === selectedProject.id)}
          webhooks={webhooksByProject[selectedProject.id] ?? []}
          webhookSecret={webhookSecret?.projectId === selectedProject.id ? webhookSecret.secret : null}
          loadingWebhooks={loadingWebhooksProjectId === selectedProject.id}
          setPolicy={(patch) => setPolicy(selectedProject.id, patch)}
          onBack={() => { setSelectedProjectId(null); setPage("projects"); }}
          onSavePolicy={() => savePolicy(selectedProject.id)}
          savingPolicy={savingPolicyId === selectedProject.id}
          onCreateApiKey={() => createApiKey(selectedProject.id)}
          onRenameProject={(name) => renameProject(selectedProject.id, name)}
          onDeleteProject={() => deleteProject(selectedProject.id)}
          onCreateWebhook={(input) => createWebhook(selectedProject.id, input)}
          onDisableWebhook={(webhookId) => disableWebhook(selectedProject.id, webhookId)}
          onRotateWebhookSecret={(webhookId) => rotateWebhookSecret(selectedProject.id, webhookId)}
          onDismissWebhookSecret={() => setWebhookSecret(null)}
          onSelectMod={setSelectedMod}
        />
      );
    }
    if (page === "create-project") return <CreateProjectPage onCancel={() => setPage("projects")} onCreateProject={createProject} notify={notify} />;
    if (page === "keys") return <ApiKeysPage projects={projects} apiKeys={apiKeys} rawApiKey={rawApiKey} onDismissRawKey={() => setRawApiKey(null)} onCreateApiKey={createApiKey} onRenameApiKey={renameApiKey} onRevokeApiKey={revokeApiKey} onRotateApiKey={rotateApiKey} notify={notify} />;
    if (page === "settings") return <SettingsPage accountId={accountId} currentUser={currentUser} accountPlan={accountPlan} usage={usage} workspace={workspace} onWorkspaceChange={setWorkspace} onChangePlan={changePlan} onManageBilling={manageBilling} onDeleteAccount={deleteCurrentAccount} notify={notify} />;
    return null;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "440px", background: "#0f0f0f", border: "1px solid rgba(255,90,90,0.22)", borderRadius: "16px", padding: "26px", textAlign: "center" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "11px", margin: "0 auto 16px", background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.25)" }} />
          <h1 style={{ margin: 0, fontSize: "19px", fontWeight: 600 }}>Could not load dashboard</h1>
          <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.55, color: "rgba(255,255,255,0.55)", fontWeight: 300 }}>{error}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "22px" }}>
            <button onClick={() => window.location.reload()} style={{ padding: "9px 14px", borderRadius: "9px", border: "none", background: "#fff", color: "#050505", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Try again</button>
            <button onClick={() => { clearSession(); router.replace("/login"); }} style={{ padding: "9px 14px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.72)", fontFamily: "inherit", fontSize: "13px", cursor: "pointer" }}>Sign in again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050505" }}>
      {/* Mobile top bar (hidden on desktop via CSS) */}
      <div className="dash-mobilebar" style={{ position: "fixed", top: 0, left: 0, right: 0, height: "54px", zIndex: 30, alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "rgba(11,11,11,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => setMobileNavOpen(true)} aria-label="Open menu" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", width: "38px", height: "38px", padding: "0 9px", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", cursor: "pointer" }}>
          <span style={{ height: "1.5px", background: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
          <span style={{ height: "1.5px", background: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
          <span style={{ height: "1.5px", background: "rgba(255,255,255,0.8)", borderRadius: "2px" }} />
        </button>
        <span style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.02em", color: "#fff" }}>Visora</span>
        <span style={{ width: "38px" }} />
      </div>

      {/* Drawer scrim (mobile only) */}
      {mobileNavOpen && (
        <div className="dash-overlay" onClick={() => setMobileNavOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }} />
      )}

      <Sidebar page={page} onNavigate={navigate} workspace={workspace} currentUser={currentUser} reviewCount={reviewQueue.length} showAdmin={Boolean(adminOverview)} mobileOpen={mobileNavOpen} onSignOut={() => { clearSession(); router.replace("/login"); }} />

      <main className="dash-main" style={{ marginLeft: "250px", flex: 1, minHeight: "100vh", overflow: "hidden" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${page}-${selectedProjectId ?? "root"}`} className="dash-page-wrap" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ minHeight: "100vh" }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedMod && <ModDetail key={selectedMod.moderationId} mod={selectedMod} onClose={() => setSelectedMod(null)} />}
      </AnimatePresence>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
