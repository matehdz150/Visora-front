"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { PoliciesIllustration } from "./illustrations";

export function PoliciesEmptyState({ onCta, onSecondary }: { onCta?: () => void; onSecondary?: () => void }) {
  return (
    <EmptyState
      illustration={<PoliciesIllustration />}
      title="No custom policy set"
      body="You’re using the Balanced default. Create a policy to control thresholds, blocked categories, and actions."
      cta="Configure policy"
      onCta={onCta}
      secondary="See presets"
      onSecondary={onSecondary}
      hint="Using default · Balanced"
    />
  );
}
