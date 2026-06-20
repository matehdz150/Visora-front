import { Suspense } from "react";

import { GitHubAuthCallback } from "@/components/github-auth-callback";

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GitHubAuthCallback />
    </Suspense>
  );
}
