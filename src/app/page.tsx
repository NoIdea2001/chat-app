"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        <p className="max-w-md text-lg text-muted-foreground">
          Real-time messaging with your friends and teams. Fast, secure, and
          beautifully simple.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
