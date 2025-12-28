import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Dashboard from "./pages/Dashboard";
import Subreddits from "./pages/Subreddits";
import NewAnalysis from "./pages/NewAnalysis";
import AnalysesList from "./pages/AnalysesList";
import AnalysisDetail from "./pages/AnalysisDetail";
import IdeasList from "./pages/IdeasList";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to app dashboard */}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/subreddits" element={<Subreddits />} />
            <Route path="/app/new" element={<NewAnalysis />} />
            <Route path="/app/analyses" element={<AnalysesList />} />
            <Route path="/app/analyses/:id" element={<AnalysisDetail />} />
            <Route path="/app/ideas" element={<IdeasList />} />
            <Route path="/app/alerts" element={<Alerts />} />
            <Route path="/app/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
