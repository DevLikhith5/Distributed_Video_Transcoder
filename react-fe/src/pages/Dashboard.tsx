import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { VideoUpload } from "@/components/dashboard/VideoUpload";
import VideoList from "@/components/dashboard/VideoList";
import { useTabStore } from "@/store/useTabStore";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "react-router-dom";


export type VideoFilter = "all" | "uploaded" | "processing" | "completed" | "failed";

const Dashboard = () => {
  const { currentTab, setCurrentTab } = useTabStore();
  const navigate = useNavigate();

  const { data: session, isPending } = authClient.useSession();
  const sessionData = authClient.useSession();
  const userId = sessionData.data?.user?.id;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      console.log("NO AUTH");
      navigate('/');
    }
  }, [session, isPending, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background selection:bg-primary/10 selection:text-primary">
        <DashboardSidebar
          currentView={currentTab}
          onViewChange={setCurrentTab}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DashboardNavbar session={sessionData.data ?? null} />

          <main className="flex-1 overflow-y-auto bg-muted/5 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">

              {/* Welcome Section */}
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Welcome back, {session?.user?.name?.split(' ')[0] || 'Creator'}
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your content today.
                </p>
              </div>

              {/* Main Content Area */}
              <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm min-h-[500px] p-6">
                {currentTab === "upload" ? (
                  <VideoUpload
                    onUploadComplete={() => setCurrentTab("videos")}
                    userId={userId}
                    multipartThreshold={100 * 512 * 512}
                  />
                ) : (
                  <div className="space-y-6">

                    <VideoList />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
