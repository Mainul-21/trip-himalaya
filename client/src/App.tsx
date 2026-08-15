import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import { Mountain } from "lucide-react";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const BlogList = lazy(() => import("./pages/BlogList"));
const Contact = lazy(() => import("./pages/Contact"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicPage = lazy(() => import("./pages/PublicPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const TourBooking = lazy(() => import("./pages/TourBooking"));
const TourDetail = lazy(() => import("./pages/TourDetail"));
const Tours = lazy(() => import("./pages/Tours"));
const Treks = lazy(() => import("./pages/Treks"));

function Router() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#fbfaf6] text-[#123d5b]"><div className="grid justify-items-center gap-4"><span className="relative grid size-16 place-items-center rounded-2xl bg-[#123d5b] text-white shadow-[0_16px_32px_rgba(18,61,91,.18)]"><span className="absolute inset-[-6px] rounded-[1.15rem] border-2 border-[#f39a48] border-t-transparent motion-safe:animate-spin" /><Mountain className="size-7" /></span><div className="text-center"><p className="display text-2xl font-bold">Trip Himalaya</p><p className="mt-1 text-xs font-bold uppercase tracking-[.13em] text-[#e17818]">Preparing your journey</p></div></div></main>}><Switch>
    <Route path="/" component={Home} />
    <Route path="/tours" component={Tours} />
    <Route path="/tours/:slug" component={TourDetail} />
    <Route path="/treks" component={Treks} />
    <Route path="/book/:slug" component={TourBooking} />
    <Route path="/experiences"><PublicPage kind="experiences" /></Route>
    <Route path="/about"><PublicPage kind="about" /></Route>
    <Route path="/contact" component={Contact} />
    <Route path="/blog" component={BlogList} />
    <Route path="/blog/:slug" component={BlogDetail} />
    <Route path="/search" component={SearchPage} />
    <Route path="/admin/setup" component={AdminSetup} />
    <Route path="/admin/login" component={AdminLogin} />
    <Route path="/admin/:rest*" component={AdminPortal} />
    <Route path="/admin" component={AdminPortal} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
