"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { OverviewIllustration } from "./illustrations";

export function OverviewEmptyState({ onCta, onSecondary }: { onCta?: () => void; onSecondary?: () => void }) {
  return (
    <EmptyState
      illustration={<OverviewIllustration />}
      title="No activity yet"
      body="Once your projects start moderating images, you’ll see live metrics and recent decisions here."
      cta="Create your first project"
      onCta={onCta}
      secondary="Read the docs"
      onSecondary={onSecondary}
      hint="Waiting for first request"
    />
  );
}
