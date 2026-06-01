import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { usePageTracking } from "./hooks/usePageTracking";
import { usePrefetchRoutes } from "./hooks/usePrefetchRoutes";
import PageTransition from "./components/PageTransition";
import PullToRefresh from "./components/PullToRefresh";
import OfflineFallback from "./components/OfflineFallback";
import IdleMount from "./components/IdleMount";

// Defer non-critical floating widgets so they don't block first paint.
const AIChatbot = lazy(() => import("./components/AIChatbot"));
const GamificationWidget = lazy(() => import("./components/GamificationWidget"));

// Eagerly load the home page for fastest initial render
import Home from "./pages/Home";

// Lazy load all other routes for code splitting
const About = lazy(() => import("./pages/About"));
const Resume = lazy(() => import("./pages/Resume"));
const Projects = lazy(() => import("./pages/Projects"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Watch = lazy(() => import("./pages/Watch"));

const Gallery = lazy(() => import("./pages/Gallery"));
const Wall = lazy(() => import("./pages/Wall"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Booking = lazy(() => import("./pages/Booking"));
const SubmitRecommendation = lazy(() => import("./pages/SubmitRecommendation"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageTracker = () => {
  usePageTracking();
  usePrefetchRoutes();
  return null;
};

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin opacity-70" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />} key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/resume" element={<PageTransition><Resume /></PageTransition>} />
          <Route path="/projects" element={<PageTransition><Projects /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/vlogs" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/vlogs/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/watch/:slug" element={<Watch />} />
          <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
          <Route path="/wall" element={<PageTransition><Wall /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
          <Route path="/recommend/:token" element={<PageTransition><SubmitRecommendation /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineFallback />
      <BrowserRouter>
        <PageTracker />
        <PullToRefresh>
          <AnimatedRoutes />
        </PullToRefresh>
        <IdleMount>
          <Suspense fallback={null}>
            <AIChatbot />
            <GamificationWidget />
          </Suspense>
        </IdleMount>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
