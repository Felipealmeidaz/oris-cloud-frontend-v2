import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  Cpu,
  HardDrive,
  Info,
  MapPin,
  Mail,
  MessageCircle,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/3pT7NJGZ97';

type Tier = 'basic' | 'pro' | 'ultra';

interface Plan {
  tier: Tier;
  name: string;
  tagline: string;
  price: number;
  awsInstance: string;
  hardware: {
    gpu: string;
    vcpu: string;
    ram: string;
    storage: string;
  };
  performance: {
    resolution: string;
    latency: string;
    region: string;
  };
  support: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    tier: 'basic',
    name: 'Básico',
    tagline: 'Perfeito pra começar',
    price: 29.9,
    awsInstance: 'AWS g4dn.xlarge',
    hardware: {
      gpu: 'NVIDIA Tesla T4 · 16 GB GDDR6',
      vcpu: '4 vCPU · Intel Xeon',
      ram: '16 GB DDR4 ECC',
      storage: '125 GB NVMe local',
    },
    performance: {
      resolution: '1080p · High',
      latency: '~30 ms',
      region: 'São Paulo',
    },
    support: 'Email (24-48h)',
  },
  {
    tier: 'pro',
    name: 'Pro',
    tagline: 'Recomendado pra gamers',
    price: 69.9,
    awsInstance: 'AWS g4dn.2xlarge',
    hardware: {
      gpu: 'NVIDIA Tesla T4 · 16 GB GDDR6',
      vcpu: '8 vCPU · Intel Xeon',
      ram: '32 GB DDR4 ECC',
      storage: '225 GB NVMe local',
    },
    performance: {
      resolution: '1080p Ultra · 1440p High',
      latency: '~25 ms',
      region: 'São Paulo',
    },
    support: 'Discord prioritário (4h)',
    highlighted: true,
  },
  {
    tier: 'ultra',
    name: 'Ultra',
    tagline: 'Máximo desempenho',
    price: 129.9,
    awsInstance: 'AWS g4dn.4xlarge',
    hardware: {
      gpu: 'NVIDIA Tesla T4 · 16 GB GDDR6',
      vcpu: '16 vCPU · Intel Xeon',
      ram: '64 GB DDR4 ECC',
      storage: '225 GB NVMe local',
    },
    performance: {
      resolution: '1440p · Ultra',
      latency: '~20 ms',
      region: 'São Paulo',
    },
    support: 'Discord 24/7 dedicado',
  },
];

export default function Plans() {
  return (
    <section id="plans" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />

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
            <Sparkles size={11} className="text-foreground/40" />
            Planos Oris Cloud
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Escolha sua máquina
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto">
            Todos os planos rodam em infraestrutura{' '}
            <span className="text-white font-medium">AWS</span> com GPU{' '}
            <span className="text-white font-medium">NVIDIA Tesla T4</span> e servidores em São Paulo.
          </p>
        </motion.div>

        {/* Status banner — beta fechado */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <Info size={12} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-200 mb-0.5">
              Beta fechado · Vagas esgotadas no momento
            </p>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Estamos ampliando capacidade gradualmente pra manter a qualidade. Entre na lista de espera via Discord e te avisamos assim que abrir uma vaga no seu tier.
            </p>
          </div>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.tier} plan={plan} delay={0.15 + i * 0.08} />
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-foreground/40 mt-10 max-w-2xl mx-auto"
        >
          Preços em Reais com impostos inclusos. Sem fidelidade. Cancele a qualquer momento. A
          latência informada é média SP↔capital Sudeste — varia conforme ISP e região do jogador.
        </motion.p>
      </div>
    </section>
  );
}

// ============================================================
// PlanCard
// ============================================================

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  const isPro = plan.highlighted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="relative"
    >
      {/* Glow sutil atras do Pro */}
      {isPro && (
        <div className="absolute inset-0 -m-2 rounded-3xl bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02] blur-xl pointer-events-none" />
      )}

      {/* Badge Mais Popular (so no Pro) */}
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-lg">
            <Sparkles size={10} />
            Mais Popular
          </div>
        </div>
      )}

      <div
        className={`relative h-full rounded-2xl border backdrop-blur-sm p-6 transition-all ${
          isPro
            ? 'border-white/20 bg-gradient-to-b from-white/[0.04] to-white/[0.015]'
            : 'border-white/[0.08] bg-white/[0.015] hover:border-white/15'
        }`}
      >
        {/* Card header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <EsgotadoBadge />
          </div>
          <p className="text-sm text-foreground/50">{plan.tagline}</p>
        </div>

        {/* Preco */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] text-foreground/60">R$</span>
            <span className="text-4xl font-bold text-white tracking-tight tabular-nums">
              {plan.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-foreground/50">/mês</span>
          </div>
        </div>

        {/* CTA — Entrar na lista de espera */}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm mb-6 transition-all ${
            isPro
              ? 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]'
              : 'border border-white/15 text-white hover:bg-white/[0.04] hover:border-white/30'
          }`}
        >
          <MessageCircle size={14} />
          Entrar na lista de espera
        </a>

        {/* AWS instance badge */}
        <div className="inline-flex items-center gap-1.5 mb-5 px-2.5 py-1 rounded-md bg-black/30 border border-white/[0.06] text-[10px] font-mono text-foreground/60">
          <Server size={10} />
          {plan.awsInstance}
        </div>

        {/* Spec groups */}
        <div className="space-y-5 text-sm">
          <SpecGroup title="Hardware">
            <SpecRow icon={<Sparkles size={12} />} label="GPU" value={plan.hardware.gpu} />
            <SpecRow icon={<Cpu size={12} />} label="CPU" value={plan.hardware.vcpu} />
            <SpecRow icon={<Zap size={12} />} label="RAM" value={plan.hardware.ram} />
            <SpecRow icon={<HardDrive size={12} />} label="Storage" value={plan.hardware.storage} />
          </SpecGroup>

          <SpecGroup title="Performance">
            <SpecRow
              icon={<Check size={12} />}
              label="Resolução"
              value={plan.performance.resolution}
            />
            <SpecRow
              icon={<Clock size={12} />}
              label="Latência"
              value={plan.performance.latency}
            />
            <SpecRow
              icon={<MapPin size={12} />}
              label="Região"
              value={plan.performance.region}
            />
          </SpecGroup>

          <SpecGroup title="Suporte">
            <SpecRow
              icon={plan.support.includes('Discord') ? <MessageCircle size={12} /> : <Mail size={12} />}
              label=""
              value={plan.support}
              full
            />
          </SpecGroup>
        </div>
      </div>
    </motion.div>
  );
}

function EsgotadoBadge() {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
      <span className="w-1 h-1 rounded-full bg-amber-400" />
      Esgotado
    </div>
  );
}

function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/40 mb-2">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SpecRow({
  icon,
  label,
  value,
  full = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-foreground/40 mt-0.5">{icon}</span>
      {full ? (
        <span className="text-sm text-foreground/80 leading-snug">{value}</span>
      ) : (
        <>
          <span className="text-xs text-foreground/50 w-14 shrink-0">{label}</span>
          <span className="text-sm text-foreground/85 leading-snug">{value}</span>
        </>
      )}
    </div>
  );
}
