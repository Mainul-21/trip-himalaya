import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import JourneyLoader from "./components/JourneyLoader";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const AdminRecovery = lazy(() => import("./pages/AdminRecovery"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
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
  return <Suspense fallback={<JourneyLoader />}><Switch>
    <Route path="/" component={Home} />
    <Route path="/tours" component={Tours} />
    <Route path="/tours/:slug" component={TourDetail} />
    <Route path="/treks" component={Treks} />
    <Route path="/book/:slug" component={TourBooking} />
    <Route path="/experiences"><PublicPage kind="experiences" /></Route>
    <Route path="/about"><PublicPage kind="about" /></Route>
    <Route path="/contact" component={Contact} />
    <Route path="/search" component={SearchPage} />
    <Route path="/admin/setup" component={AdminSetup} />
    <Route path="/admin/recover" component={AdminRecovery} />
    <Route path="/admin/login" component={AdminLogin} />
    <Route path="/admin/:rest*" component={AdminPortal} />
    <Route path="/admin" component={AdminPortal} />
    <Route component={NotFound} />
  </Switch></Suspense>;
}

export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
