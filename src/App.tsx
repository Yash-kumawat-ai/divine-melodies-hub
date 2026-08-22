import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import SuspenseFallback from "./components/SuspenseFallback";
import AppShell from "./components/layout/AppShell";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider, useLanguage } from "@/hooks/useLanguage";
import { AssistantContextProvider } from "@/hooks/useAssistantContext";
import { AIModalProvider, useAIModal } from "@/hooks/useAIModal";
import { ThemeProvider } from "@/hooks/useTheme";
import { YouTubePlayerProvider, useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { BhajanModalOpenProvider } from "@/hooks/useBhajanModalOpen";
import { DrawerProvider } from "@/context/DrawerContext";
import { MobileDrawer } from "@/components/navigation/MobileDrawer";
import LoginForm from "./components/Auth/LoginForm";
import SignupTabs from "./components/Auth/SignupTabs";
import AuthShell from "./components/Auth/AuthShell";
import AuthCallback from "./components/Auth/AuthCallback";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Home = lazy(() => import("./pages/Home"));
const AllBhajans = lazy(() => import("./pages/AllBhajans"));
const AllDeities = lazy(() => import("./pages/AllDeities"));
const DeityPage = lazy(() => import("./pages/DeityPage"));
const BhajanPage = lazy(() => import("./pages/BhajanPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const KirtanAIPage = lazy(() => import("./pages/KirtanAIPage"));
const RedirectKirtanToNarad = lazy(() =>
  import("./pages/KirtanAIPage").then((m) => ({ default: m.RedirectKirtanToNarad })),
);
const MeditationPage = lazy(() => import("./pages/MeditationPage"));
const PanchangPage = lazy(() => import("./pages/PanchangPage"));
const PanchangDetailsPage = lazy(() => import("./pages/PanchangDetailsPage"));
const TemplePage = lazy(() => import("./pages/TemplePage"));
const LiveAartiPage = lazy(() => import("./pages/LiveAartiPage"));
const AartiChalisaPage = lazy(() => import("./pages/AartiChalisaPage"));
const KathaPage = lazy(() => import("./pages/KathaPage"));
const UploadBhajan = lazy(() => import("./pages/UploadBhajan"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const RecentBhajans = lazy(() => import("./pages/RecentBhajans"));
const AdminAccounts = lazy(() => import("./pages/AdminAccounts"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog"));
const MyNotifications = lazy(() => import("./pages/MyNotifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AIAssistantModalHost = lazy(() => import("./components/AIAssistantModalHost"));
const NaradFloatingWidget = lazy(() => import("./components/kirtan/NaradFloatingWidget"));
const YouTubePlayerHost = lazy(() => import("./components/YouTubePlayerHost"));

const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/legal/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/legal/CookiePolicy"));
const AccountPage = lazy(() => import("./pages/account/AccountPage"));
const LikedBhajansPage = lazy(() => import("./pages/account/LikedBhajansPage"));
const SavedPostsPage = lazy(() => import("./pages/account/SavedPostsPage"));
const SupportPage = lazy(() => import("./pages/account/SupportPage"));
const WallpaperPage = lazy(() => import("./pages/BlessingsPage"));
const LeaderboardPage = lazy(() => import("./pages/LeaderboardPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const JoinCommunityPage = lazy(() => import("./pages/JoinCommunityPage"));
const PosterMakerPage = lazy(() => import("./pages/PosterMakerPage"));

// Bhakti Shorts Feature lazy loads
const ShortsFeed = lazy(() => import("./pages/ShortsFeed"));
const ChannelWhitelist = lazy(() => import("./pages/admin/ChannelWhitelist"));
const DMCAPage = lazy(() => import("./pages/DMCAPage"));


function DeferredNaradWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    const idleId =
      "requestIdleCallback" in window
        ? window.requestIdleCallback(enable, { timeout: 4000 })
        : window.setTimeout(enable, 2500);
    window.addEventListener("pointerdown", enable, { once: true, passive: true });
    return () => {
      if ("cancelIdleCallback" in window && typeof idleId === "number") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      window.removeEventListener("pointerdown", enable);
    };
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <NaradFloatingWidget />
    </Suspense>
  );
}

function DeferredYouTubePlayerHost() {
  const { isOpen } = useYouTubePlayer();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) setLoaded(true);
  }, [isOpen]);

  if (!loaded) return null;
  return (
    <Suspense fallback={null}>
      <YouTubePlayerHost />
    </Suspense>
  );
}

function AppContent() {
  const { isOpen } = useAIModal();
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.setAttribute("data-lang", language);
    // Keep classList synchronized with lang-[locale]
    const classes = Array.from(document.documentElement.classList);
    classes.forEach(c => {
      if (c.startsWith("lang-")) {
        document.documentElement.classList.remove(c);
      }
    });
    document.documentElement.classList.add(`lang-${language}`);
  }, [language]);

  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MobileDrawer />
        <Routes>
          <Route
            path="/auth/login"
            element={
              <AuthShell mode="login">
                <LoginForm />
              </AuthShell>
            }
          />
          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />
          <Route
            path="/auth/signup"
            element={
              <AuthShell mode="signup">
                <SignupTabs />
              </AuthShell>
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
            <Route path="/meditation" element={<MeditationPage />} />
            <Route path="/panchang" element={<PanchangPage />} />
            <Route path="/panchang/details" element={<PanchangDetailsPage />} />
            <Route path="/narad-ai" element={<KirtanAIPage />} />
            <Route path="/kirtan-ai" element={<RedirectKirtanToNarad />} />
            <Route path="/chalisa" element={<AartiChalisaPage />} />
            <Route path="/aarti" element={<AartiChalisaPage />} />
            <Route path="/aarti-chalisa" element={<AartiChalisaPage />} />
            <Route path="/katha" element={<KathaPage />} />
            <Route path="/live-aarti" element={<LiveAartiPage />} />
            <Route
              path="/temple"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <TemplePage />
                </Suspense>
              }
            />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/join-community" element={<JoinCommunityPage />} />
            <Route path="/community/groups/:slug" element={<JoinCommunityPage />} />
            <Route path="/community/posts/:postId" element={<JoinCommunityPage />} />
            
            {/* Bhakti Shorts & Legal compliance routes */}
            <Route path="/shorts" element={<ShortsFeed />} />
            <Route path="/shorts/:videoId" element={<ShortsFeed />} />
            <Route path="/dmca" element={<DMCAPage />} />
            <Route
              path="/admin/moderation"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminModeration />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/channel-whitelist"
              element={
                <ProtectedRoute requireAdmin>
                  <ChannelWhitelist />
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
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/liked"
              element={
                <ProtectedRoute>
                  <LikedBhajansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account/saved"
              element={
                <ProtectedRoute>
                  <SavedPostsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/account/support" element={<SupportPage />} />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/wallpaper" element={<WallpaperPage />} />
            <Route path="/poster-maker" element={<WallpaperPage />} />
            <Route path="/upload-bhajan"
              element={
                <ProtectedRoute>
                  <UploadBhajan />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>

        <DeferredNaradWidget />
      </BrowserRouter>

      {isOpen && (
        <Suspense fallback={null}>
          <AIAssistantModalHost />
        </Suspense>
      )}
      <DeferredYouTubePlayerHost />
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
        <LanguageProvider>
          <AssistantContextProvider>
            <AIModalProvider>
              <YouTubePlayerProvider>
                <BhajanModalOpenProvider>
                <DrawerProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
                </DrawerProvider>
                </BhajanModalOpenProvider>
              </YouTubePlayerProvider>
            </AIModalProvider>
          </AssistantContextProvider>
        </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
