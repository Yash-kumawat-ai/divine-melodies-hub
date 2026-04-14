import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import AllDeities from "./pages/AllDeities";
import AllBhajans from "./pages/AllBhajans";
import DeityPage from "./pages/DeityPage";
import BhajanPage from "./pages/BhajanPage";
import SearchPage from "./pages/SearchPage";
import KirtanAIPage from "./pages/KirtanAIPage";
import UploadBhajan from "./pages/UploadBhajan";
import AdminModeration from "./pages/AdminModeration";
import RecentBhajans from "./pages/RecentBhajans";
import AdminAccounts from "./pages/AdminAccounts";
import AdminAuditLog from "./pages/AdminAuditLog";
import MyNotifications from "./pages/MyNotifications";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";
import AuthShell from "./components/Auth/AuthShell";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AIAssistantModal from "./components/AIAssistantModal";
import { LanguageProvider } from "./hooks/useLanguage";
import { AssistantContextProvider } from "./hooks/useAssistantContext";
import { AIModalProvider, useAIModal } from "./hooks/useAIModal";
import { bhajans } from "./data/bhajans";
import { useDeities } from "./hooks/useDeities";

const queryClient = new QueryClient();

// Wrapper to use hooks
function AppContent() {
  const { isOpen, closeAI } = useAIModal();
  const { deities: allDeities } = useDeities();
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Index />} />
          <Route path="/all-bhajans" element={<AllBhajans />} />
          <Route path="/recent-bhajans" element={<RecentBhajans />} />
          <Route path="/all-deities" element={<AllDeities />} />
          <Route path="/deity/:slug" element={<DeityPage />} />
          <Route path="/bhajan/:slug" element={<BhajanPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/kirtan-ai" element={<ProtectedRoute><KirtanAIPage /></ProtectedRoute>} />
          <Route path="/admin/moderation" element={<ProtectedRoute requireAdmin><AdminModeration /></ProtectedRoute>} />
          <Route path="/admin/accounts" element={<ProtectedRoute requireAdmin><AdminAccounts /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute requireAdmin><AdminAuditLog /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><MyNotifications /></ProtectedRoute>} />
          <Route path="/upload-bhajan" element={<UploadBhajan />} />
          <Route path="/auth/login" element={<AuthShell mode="login"><LoginForm /></AuthShell>} />
          <Route path="/auth/signup" element={<AuthShell mode="signup"><SignupForm /></AuthShell>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      
      {/* Global AI Assistant Modal */}
      <AIAssistantModal
        allBhajans={bhajans}
        allDeities={allDeities || []}
        isOpen={isOpen}
        onClose={closeAI}
        onBhajanSelect={() => {}}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AssistantContextProvider>
        <AIModalProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </TooltipProvider>
        </AIModalProvider>
      </AssistantContextProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
