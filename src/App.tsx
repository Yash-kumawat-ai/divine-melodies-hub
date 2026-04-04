import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import DeityPage from "./pages/DeityPage";
import BhajanPage from "./pages/BhajanPage";
import SearchPage from "./pages/SearchPage";
import UploadBhajan from "./pages/UploadBhajan";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Index />} />
          <Route path="/deity/:slug" element={<DeityPage />} />
          <Route path="/bhajan/:slug" element={<BhajanPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/upload-bhajan" element={<UploadBhajan />} />
          <Route path="/auth/login" element={<div className="min-h-screen bg-background py-12"><LoginForm /></div>} />
          <Route path="/auth/signup" element={<div className="min-h-screen bg-background py-12"><SignupForm /></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
