"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { ModerationsIllustration } from "./illustrations";

export function ModerationsEmptyState({ onCta, onSecondary }: { onCta?: () => void; onSecondary?: () => void }) {
  return (
    <EmptyState
      illustration={<ModerationsIllustration />}
      title="No moderations yet"
      body="Send your first image to the moderation endpoint and the decision will appear here instantly."
      cta="View API reference"
      onCta={onCta}
      secondary="Copy endpoint"
      onSecondary={onSecondary}
      hint="POST /moderate"
    />
  );
}
