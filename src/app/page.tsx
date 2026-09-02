"use client";

import { IdentityGate } from "@/lib/identityContext";
import { AppShell } from "@/components/AppShell";

export default function Home() {
  return (
    <IdentityGate>
      <AppShell />
    </IdentityGate>
  );
}
