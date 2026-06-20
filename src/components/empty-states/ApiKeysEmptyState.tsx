"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { ApiKeysIllustration } from "./illustrations";

export function ApiKeysEmptyState({ onCta, onSecondary }: { onCta?: () => void; onSecondary?: () => void }) {
  return (
    <EmptyState
      illustration={<ApiKeysIllustration />}
      title="No API keys yet"
      body="Generate a key to start authenticating requests. Keep it secret — it grants full access to this project."
      cta="Create API Key"
      onCta={onCta}
      secondary="Learn about auth"
      onSecondary={onSecondary}
    />
  );
}
