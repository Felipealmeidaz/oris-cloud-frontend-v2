import { motion } from 'framer-motion';
import { Cloud, Zap, Shield, Check } from 'lucide-react';

interface Highlight {
  icon: typeof Cloud;
  title: string;
  description: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: Cloud,
    title: 'Infra AWS real',
    description: 'Instâncias G4dn rodando em sa-east-1 (São Paulo). Sem revenda, sem intermediário, sem hardware caseiro.',
  },
  {
    icon: Zap,
    title: 'Performance de data center',
    description: 'GPU NVIDIA Tesla T4 com 16GB GDDR6. Processador Intel Xeon, SSD NVMe, memória DDR4 ECC.',
  },
  {
    icon: Shield,
    title: 'Dados e sessão protegidos',
    description: 'Login OAuth via Google ou GitHub, snapshot criptografado, transmissão segura via Parsec ou Moonlight.',
  },
];

const WHY_POINTS = [
  'Sem download gigante antes de cada sessão',
  'Acesso instantâneo, basta abrir o app cliente',
  'Planos quinzenal ou mensal, sem fidelidade',
  'Suporte direto com o time no Discord',
];

const STATS = [
  { label: 'Comunidade Discord', value: '+100' },
  { label: 'Snapshot', value: 'Preservado' },
  { label: 'Uptime alvo', value: '99.9%' },
  { label: 'Região', value: 'São Paulo' },
];

export default function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
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
            Sobre a Oris
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Cloud gaming sem<br />intermediário, sem enrolação
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto">
            A Oris aluga hardware AWS de verdade pra você jogar com performance
            de data center. Sem PC gamer, sem setup complicado.
          </p>
        </motion.div>

        {/* Mission + Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Left: mission + why */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-5"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-3">
                Nossa missão
              </p>
              <p className="text-sm md:text-base text-foreground/75 leading-relaxed">
                Tornar hardware de alto desempenho acessível pra qualquer jogador no
                Brasil, sem exigir investimento de R$ 5 mil em um PC gamer. Você paga
                só pelo tempo que realmente vai jogar.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-4">
                Por que Oris
              </p>
              <ul className="space-y-2.5">
                {WHY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/75 leading-snug">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/15">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: highlights stack */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            {HIGHLIGHTS.map((h, i) => (
              <HighlightCard key={h.title} highlight={h} delay={0.1 + i * 0.08} />
            ))}
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/[0.06]"
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/40 mb-1.5">
                {stat.label}
              </p>
              <p className="text-xl md:text-2xl font-bold text-white leading-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// HighlightCard
// ============================================================

function HighlightCard({ highlight, delay }: { highlight: Highlight; delay: number }) {
  const Icon = highlight.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ x: 3 }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 md:p-6 hover:border-white/15 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-foreground/80" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-semibold text-white leading-tight mb-1">
            {highlight.title}
          </h4>
          <p className="text-xs md:text-sm text-foreground/60 leading-relaxed">
            {highlight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
