"use client";

import { AuthPrompt } from "@/components/AuthPrompt";
import { useAuth } from "@/components/AuthProvider";

export function AuthPromptHost() {
  const { authPromptOpen, closeAuthPrompt } = useAuth();
  return <AuthPrompt open={authPromptOpen} onClose={closeAuthPrompt} />;
}
