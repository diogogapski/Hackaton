"use client";

import type { ReactNode } from "react";
import { AppShell, type ShellUser } from "@/src/components/layout/AppShell";
import { navAdmin } from "@/src/components/layout/navegacao";
import { HackathonProvider, HackathonSelector } from "@/src/components/admin/HackathonContext";

export function AdminShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  return (
    <HackathonProvider>
      <AppShell user={user} nav={navAdmin} area="ADMIN" toolbar={<HackathonSelector />}>
        {children}
      </AppShell>
    </HackathonProvider>
  );
}
