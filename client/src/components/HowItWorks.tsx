import { motion } from 'framer-motion';
import { CreditCard, LogIn, Gamepad2, Cloud, Clock } from 'lucide-react';

interface Step {
  icon: typeof CreditCard;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: CreditCard,
    title: 'Escolha um plano',
    description: 'Selecione entre o quinzenal ou mensal de acordo com sua rotina e faça o pagamento via PIX ou cartão.',
  },
  {
    icon: LogIn,
    title: 'Crie sua conta',
    description: 'Login rápido com Google ou GitHub. Sem cadastro longo, sem verificação por telefone.',
  },
  {
    icon: Cloud,
    title: 'Inicie sua máquina',
    description: 'Sua VM dedicada na AWS São Paulo sobe em menos de 30 segundos. Snapshot pessoal, storage preservado.',
  },
  {
    icon: Gamepad2,
    title: 'Conecte e jogue',
    description: 'Acesse via Parsec ou Moonlight do seu notebook, celular ou TV. Latência baixa, 60fps estável.',
  },
];

const TIMELINE: { range: string; label: string }[] = [
  { range: '0 a 30s', label: 'Escolha o plano e conclua o pagamento' },
  { range: '30 a 60s', label: 'Entre com Google ou GitHub' },
  { range: '60 a 90s', label: 'Boote a VM dedicada na AWS' },
  { range: '90 a 120s', label: 'Parsec conectado, jogo iniciado' },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
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
            Onboarding
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Menos de 2 minutos<br />pra você estar jogando
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-xl mx-auto">
            Sem configuração manual, sem driver pra instalar, sem espera.
            Do pagamento ao primeiro frame em 4 passos simples.
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} />
          ))}
        </div>

        {/* Timeline card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Clock size={18} className="text-foreground/80" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white leading-tight">
                Linha do tempo completa
              </h3>
              <p className="text-xs text-foreground/50">
                Do clique inicial ao jogo rodando em tela cheia
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="flex items-center gap-4 px-4 py-3 rounded-lg border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors"
              >
                <span className="inline-flex items-center justify-center min-w-[72px] px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.03] text-[11px] font-mono font-semibold text-white">
                  {item.range}
                </span>
                <span className="text-sm text-foreground/75 leading-snug">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// StepCard
// ============================================================

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-sm p-6 hover:border-white/15 transition-colors"
    >
      {/* Número + ícone header */}
      <div className="flex items-start justify-between mb-5">
        <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
          <Icon size={18} className="text-foreground/80" />
        </div>
        <span className="text-[11px] font-mono font-semibold text-foreground/30 tracking-wider">
          0{index + 1}
        </span>
      </div>

      {/* Título + descrição */}
      <h3 className="text-base font-semibold text-white leading-tight mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-foreground/60 leading-relaxed">
        {step.description}
      </p>
    </motion.div>
  );
}
