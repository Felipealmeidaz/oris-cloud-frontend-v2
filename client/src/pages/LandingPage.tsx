import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Founders from '@/components/Founders';
import Plans from '@/components/Plans';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

/**
 * Landing page pública com login integrado.
 * Se o usuário já está logado, redireciona para /dashboard.
 */
export function LandingPage() {
  const [, navigate] = useLocation();
  const { isLoggedIn, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoading, isLoggedIn, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
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
  );
}
