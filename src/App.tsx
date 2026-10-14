import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { PWAPrompt } from "@/components/PWAPrompt";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { initAnalytics } from "@/lib/analytics";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

initAnalytics();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SettingsProvider>
        <Toaster />
        <Sonner />
        <PWAPrompt />
        <HashRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
