import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Index from "./pages/Index";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "./components/ui/toast";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";
import Dashboard from "./pages/Dashboard";
import { authClient } from "@/lib/auth-client";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import VideoPlayerPage from "./pages/VideoPlayerPage";

export const App = () => {
  return (
    <BrowserRouter>
      <AuthUIProvider authClient={authClient} >
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <ToastProvider />
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path = "/player" element={<VideoPlayerPage/>}></Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthUIProvider>
    </BrowserRouter>
  );
};
