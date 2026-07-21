import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import AlertPreferences from "./pages/AlertPreferences";
import { MyGovCheat } from "./pages/MyGovCheat";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Note: Contracts and ContractDetail pages are now public
// Users can browse without authentication
// Authentication is required only for placing bids and saving contracts

function Router() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/login">
        <LoginPage />
      </Route>
      {/* Public Routes */}
      <Route path="/contracts" component={Contracts} />
      <Route path="/contract/:id" component={ContractDetail} />
      {/* Protected Routes */}
      {isAuthenticated ? (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/my-govcheat" component={MyGovCheat} />
          <Route path="/alerts" component={AlertPreferences} />
          <Route path="/admin" component={Admin} />
          <Route path="/thank-you" component={ThankYou} />
        </>
      ) : null}
      <Route path="/:rest*" component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
