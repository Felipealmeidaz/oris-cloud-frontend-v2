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
    title: 'Sem PC gamer caro',
    description: 'Acesse hardware de data center sem gastar R$ 5 mil em um setup. Você paga só pelo tempo que joga.',
  },
  {
    icon: Globe,
    title: 'Servidor em São Paulo',
    description: 'Instâncias AWS na região sa-east-1 garantindo latência baixa pra jogadores do Sudeste e Sul.',
  },
  {
    icon: Lock,
    title: 'Conexão segura',
    description: 'Sessões protegidas via Parsec e Moonlight, transmissão com criptografia e autenticação OAuth.',
  },
  {
    icon: Cloud,
    title: 'Seus jogos, seu snapshot',
    description: 'Você instala seus próprios jogos. A gente faz snapshot da sua VM para que nada se perca entre sessões.',
  },
  {
    icon: Cpu,
    title: 'Hardware real AWS',
    description: 'NVIDIA Tesla T4 com 16GB GDDR6 e Intel Xeon. Mesma infra usada por empresas de IA e VFX.',
  },
  {
    icon: Headphones,
    title: 'Suporte no Discord',
    description: 'Time disponível de segunda a sábado no canal oficial. Resolução rápida, sem ticket burocrático.',
  },
  {
    icon: TrendingUp,
    title: 'Preços transparentes',
    description: 'Quinzenal ou mensal, sem taxa extra. Cancelou, acabou. Nada de fidelidade forçada.',
  },
  {
    icon: Wifi,
    title: 'Streaming otimizado',
    description: 'Protocolos modernos garantem 60fps estáveis em 1080p e 1440p até em conexões de 25 Mbps.',
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
            Feito pra quem leva<br />jogo a sério
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-xl mx-auto">
            8 pilares que separam a Oris de qualquer serviço genérico de
            cloud gaming no Brasil.
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
              Pronto pra trocar seu PC fraco por uma VM na AWS?
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Veja os planos disponíveis. Sem fidelidade, sem pegadinha.
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
