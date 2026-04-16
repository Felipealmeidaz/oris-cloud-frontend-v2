import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <div className="min-h-screen w-full bg-background text-foreground">
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
          </div>
          <Toaster />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
