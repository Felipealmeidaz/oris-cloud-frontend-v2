import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Router, Route, useLocation } from "wouter";

import Header from "./components/Header";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { LandingPage } from "./pages/LandingPage";

/**
 * Splash screen que redireciona automaticamente para login ou dashboard
 */
function SplashScreen() {
  const [, navigate] = useLocation();
  const { isLoggedIn, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  }, [isLoading, isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-white">Oris Cloud</h1>
        <p className="text-foreground/60 mt-2">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen w-full bg-background text-foreground">
                <Route path="/" component={SplashScreen} />
                <Route path="/landing" component={LandingPage} />
                <Route path="/login" component={Login} />
                <Route path="/dashboard" component={Dashboard} />
              </div>
              <Toaster />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
