import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AIAssistantModal from "./components/AIAssistantModal";
import { LanguageProvider } from "./hooks/useLanguage";
import { AssistantContextProvider } from "./hooks/useAssistantContext";
import { AIModalProvider, useAIModal } from "./hooks/useAIModal";
import { ThemeProvider } from "./hooks/useTheme";

const queryClient = new QueryClient();

const Index = lazy(() => import("./pages/Index"));
const AllDeities = lazy(() => import("./pages/AllDeities"));
const AllBhajans = lazy(() => import("./pages/AllBhajans"));
const DeityPage = lazy(() => import("./pages/DeityPage"));
const BhajanPage = lazy(() => import("./pages/BhajanPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const KirtanAIPage = lazy(() => import("./pages/KirtanAIPage"));
const UploadBhajan = lazy(() => import("./pages/UploadBhajan"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const RecentBhajans = lazy(() => import("./pages/RecentBhajans"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog"));
const MyNotifications = lazy(() => import("./pages/MyNotifications"));
const LoginForm = lazy(() => import("./components/Auth/LoginForm"));
const SignupTabs = lazy(() => import("./components/Auth/SignupTabs"));
const AuthShell = lazy(() => import("./components/Auth/AuthShell"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIAssistantModalHost = lazy(() => import("./components/AIAssistantModalHost"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { isOpen } = useAIModal();
  
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
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
            <Route path="/upload-bhajan" element={<ProtectedRoute><UploadBhajan /></ProtectedRoute>} />
            <Route path="/auth/login" element={<AuthShell mode="login"><LoginForm /></AuthShell>} />
            <Route path="/auth/signup" element={<AuthShell mode="signup"><SignupTabs /></AuthShell>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      {isOpen && (
        <Suspense fallback={null}>
          <AIAssistantModalHost />
        </Suspense>
      )}
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
