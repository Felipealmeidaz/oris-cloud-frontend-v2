import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { Router, Route } from "wouter";

import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Founders from "./components/Founders";
import Plans from "./components/Plans";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import { Login } from "./pages/Login";

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Founders />
        <Plans />
        <HowItWorks />
        <Features />
        <FAQ />
      </main>
      <Footer />
    </>
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
                <Route path="/" component={HomePage} />
                <Route path="/login" component={Login} />
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
