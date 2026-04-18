import { motion } from 'framer-motion';
import {
  Zap,
  Globe,
  Lock,
  Cloud,
  Cpu,
  Headphones,
  TrendingUp,
  Wifi,
  ArrowRight,
} from 'lucide-react';

interface Feature {
  icon: typeof Zap;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: 'Sem investimento em PC',
    description: 'Hardware AWS alugado por período. Pagamento quinzenal ou mensal, não por hora de uso.',
  },
  {
    icon: Globe,
    title: 'Região São Paulo',
    description: 'Instâncias EC2 na região sa-east-1 da AWS, com latência baixa pro Sudeste e Sul do Brasil.',
  },
  {
    icon: Lock,
    title: 'Conexão criptografada',
    description: 'Sessões transmitidas via Parsec ou Moonlight com criptografia fim a fim. Autenticação OAuth.',
  },
  {
    icon: Cloud,
    title: 'Snapshot persistente',
    description: 'Você instala seus próprios jogos. O estado da VM é preservado entre sessões.',
  },
  {
    icon: Cpu,
    title: 'Hardware EC2 G4dn',
    description: 'NVIDIA Tesla T4 com 16GB GDDR6, Intel Xeon e memória DDR4 ECC.',
  },
  {
    icon: Headphones,
    title: 'Suporte via Discord',
    description: 'Atendimento de segunda a sábado pelo canal oficial da comunidade.',
  },
  {
    icon: TrendingUp,
    title: 'Planos simples',
    description: 'Quinzenal e mensal, sem taxa adicional e sem contrato de fidelidade.',
  },
  {
    icon: Wifi,
    title: 'Streaming 60fps',
    description: 'Parsec e Moonlight entregam 60fps em 1080p e 1440p em conexões a partir de 25 Mbps.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-medium text-foreground/60">
            Por que Oris
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Características<br />da plataforma
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-xl mx-auto">
            Infraestrutura AWS dedicada, conexão por Parsec ou Moonlight e suporte via Discord.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>

        {/* Bottom CTA card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-8"
        >
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white leading-tight mb-1.5">
              Disponível em dois planos
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Veja valores e condições.
            </p>
          </div>
          <motion.a
            href="#plans"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.12)]"
          >
            <span>Ver planos</span>
            <ArrowRight size={16} />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// FeatureCard
// ============================================================

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.05 + index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-sm p-5 hover:border-white/15 transition-colors"
    >
      {/* Ícone */}
      <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 group-hover:bg-white/[0.08] transition-colors">
        <Icon size={16} className="text-foreground/80" />
      </div>

      {/* Título + descrição */}
      <h3 className="text-sm font-semibold text-white leading-tight mb-1.5">
        {feature.title}
      </h3>
      <p className="text-xs text-foreground/55 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}
