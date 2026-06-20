"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/auth-form";
import type { PlanId } from "@/lib/visora-api";

const PLAN_IDS = new Set<PlanId>(["free", "starter", "growth", "scale"]);

function isPlanId(value: string | null): value is PlanId {
  return value !== null && PLAN_IDS.has(value as PlanId);
}

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = useMemo(() => searchParams.get("plan"), [searchParams]);

  useEffect(() => {
    if (!isPlanId(selectedPlan)) {
      router.replace("/pricing");
    }
  }, [router, selectedPlan]);

  if (!isPlanId(selectedPlan)) {
    return null;
  }

  return <AuthForm mode="signup" selectedPlan={selectedPlan} />;
}
