"use client";

import { useQuery } from "convex/react";
import { useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "./sound-toggle";
import { LogOut } from "lucide-react";
import { api } from "../../../convex/_generated/api";

export function UserMenu() {
  const me = useQuery(api.users.getMe);
  const { signOut } = useClerk();

  if (!me) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-accent/50 transition-colors text-left">
          <Avatar className="h-9 w-9">
            <AvatarImage src={me.imageUrl} alt={me.name} />
            <AvatarFallback>{me.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{me.name}</p>
            <p className="text-xs text-muted-foreground truncate">{me.email}</p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">Sounds</span>
          <SoundToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
