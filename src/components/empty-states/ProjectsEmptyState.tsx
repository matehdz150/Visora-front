"use client";

import React from "react";
import { EmptyState } from "./EmptyState";
import { ProjectsIllustration } from "./illustrations";

export function ProjectsEmptyState({ onCta }: { onCta?: () => void }) {
  return (
    <EmptyState
      illustration={<ProjectsIllustration />}
      title="Create your first project"
      body="Projects keep uploads, API keys, and policies fully isolated. Spin one up to get started."
      cta="Create Project"
      onCta={onCta}
    />
  );
}
