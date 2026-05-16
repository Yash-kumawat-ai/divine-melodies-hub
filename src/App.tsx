import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import SuspenseFallback from "./components/SuspenseFallback";
import AppShell from "./components/layout/AppShell";
import { LanguageProvider } from "./hooks/useLanguage";
import { AssistantContextProvider } from "./hooks/useAssistantContext";
import { AIModalProvider, useAIModal } from "./hooks/useAIModal";
import { ThemeProvider } from "./hooks/useTheme";
import { YouTubePlayerProvider } from "./hooks/useYouTubePlayer";
import { BhajanModalOpenProvider } from "./hooks/useBhajanModalOpen";
import Home from "./pages/Home";
import AllBhajans from "./pages/AllBhajans";

const queryClient = new QueryClient();

const AllDeities = lazy(() => import("./pages/AllDeities"));
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
const YouTubePlayerHost = lazy(() => import("./components/YouTubePlayerHost"));

const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));

function AppContent() {
  const { isOpen } = useAIModal();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth/login"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <AuthShell mode="login">
                  <LoginForm />
                </AuthShell>
              </Suspense>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <AuthShell mode="signup">
                  <SignupTabs />
                </AuthShell>
              </Suspense>
            }
          />

          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/all-bhajans" element={<AllBhajans />} />
            <Route path="/recent-bhajans" element={<RecentBhajans />} />
            <Route path="/all-deities" element={<AllDeities />} />
            <Route path="/deity/:slug" element={<DeityPage />} />
            <Route path="/bhajan/:slug" element={<BhajanPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route
              path="/admin/moderation"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminModeration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/accounts"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAuditLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <MyNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload-bhajan"
              element={
                <ProtectedRoute>
                  <UploadBhajan />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kirtan-ai"
              element={
                <ProtectedRoute>
                  <KirtanAIPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {isOpen && (
        <Suspense fallback={null}>
          <AIAssistantModalHost />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <YouTubePlayerHost />
      </Suspense>
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
              <YouTubePlayerProvider>
                <BhajanModalOpenProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
                </BhajanModalOpenProvider>
              </YouTubePlayerProvider>
            </AIModalProvider>
          </AssistantContextProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
