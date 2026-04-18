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
 * Landing page pública.
 * Acessível a todos, incluindo usuários logados (que podem querer ver
 * Planos/FAQ/Sobre antes de voltar ao Dashboard). O Header mostra um
 * botão "Dashboard" quando logado pra facilitar o retorno.
 */
export function LandingPage() {
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
