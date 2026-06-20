"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { SettingsIllustration } from "./illustrations";

export function SettingsEmptyState({ onCta, onSecondary }: { onCta?: () => void; onSecondary?: () => void }) {
  return (
    <EmptyState
      illustration={<SettingsIllustration />}
      title="Finish setting up your workspace"
      body="Add your team, connect authentication, and configure billing to get the most out of Visora."
      cta="Complete setup"
      onCta={onCta}
      secondary="Invite team"
      onSecondary={onSecondary}
    />
  );
}
