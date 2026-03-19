import { type ReactNode } from "react";
import { AuthProvider } from "@/hooks/useAuth";

export function AppAccessBoundary({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
