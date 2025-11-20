"use client";

import { Upload, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LogoLight from "@/assets/Logo.svg";
import LogoDark from "@/assets/LogoLight.png";

interface DashboardSidebarProps {
  currentView: "upload" | "videos";
  onViewChange: (view: "upload" | "videos") => void;
}

export function DashboardSidebar({
  currentView,
  onViewChange,
}: DashboardSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";


  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? LogoDark : LogoLight;
  console.log(logoSrc)

  return (
    <Sidebar className="border-r border-border/40 bg-card/95 backdrop-blur-2xl" collapsible="icon">
      {/* Sidebar Header with Logo */}
      <SidebarHeader className="h-16 border-b border-border/40 px-4 flex justify-center">
        <div className="flex items-center gap-3 group w-full">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={logoSrc}
              alt="Streamly Logo"
              className="relative h-8 w-auto object-contain rounded-xl bg-background/50 backdrop-blur-sm p-1.5 transition-transform duration-300 group-hover:scale-105 ring-1 ring-border/50"
            />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-none">
                Streamly
              </span>
              <span className="text-[9px] font-medium text-muted-foreground/80 tracking-wider uppercase mt-0.5">
                Creator Studio
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("videos")}
                  isActive={currentView === "videos"}
                  className={`w-full transition-all duration-200 h-9 rounded-lg group/btn ${currentView === "videos"
                    ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                    }`}
                  tooltip="My Videos"
                >
                  <LayoutDashboard className={`h-4 w-4 transition-colors ${currentView === "videos" ? "text-primary" : "text-muted-foreground group-hover/btn:text-foreground"
                    }`} />
                  {!isCollapsed && <span className="font-medium text-sm">My Videos</span>}
                  {currentView === "videos" && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onViewChange("upload")}
                  isActive={currentView === "upload"}
                  className={`w-full transition-all duration-200 h-9 rounded-lg group/btn ${currentView === "upload"
                    ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                    }`}
                  tooltip="Upload Video"
                >
                  <Upload className={`h-4 w-4 transition-colors ${currentView === "upload" ? "text-primary" : "text-muted-foreground group-hover/btn:text-foreground"
                    }`} />
                  {!isCollapsed && <span className="font-medium text-sm">Upload Video</span>}
                  {currentView === "upload" && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
