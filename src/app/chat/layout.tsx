"use client";

import { useStoreUser } from "@/hooks/use-store-user";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useStoreUser();

  return <>{children}</>;
}
