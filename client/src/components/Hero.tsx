import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  ArrowRight,
  Cpu,
  HardDrive,
  MapPin,
  Server,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

/**
 * Hero da landing Oris Cloud.
 * Design sóbrio premium com especs reais AWS G4dn (NVIDIA Tesla T4).
 * Elementos flutuantes sutis: VM card + chips + light orbs.
 */
export default function Hero() {
  const [, navigate] = useLocation();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden"
    >
      <BackgroundLayer />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ============================ */}
          {/* LEFT COLUMN: content            */}
          {/* ============================ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            {/* Badge premium */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-sm text-xs font-medium text-foreground/80"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/80 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span>Powered by</span>
              <span className="font-semibold text-white">AWS</span>
              <span className="text-foreground/40">·</span>
              <span className="font-semibold text-white">NVIDIA Tesla T4</span>
            </motion.div>

            {/* H1 factual, tom normal */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.02] mb-6 text-white"
            >
              Cloud gaming
              <br />
              com hardware AWS.
            </motion.h1>

            {/* Descrição factual */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-foreground/65 max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed"
            >
              VMs dedicadas com GPU{' '}
              <span className="text-white font-medium">NVIDIA Tesla T4</span>{' '}
              rodando em São Paulo. Você conecta pelo Parsec ou Moonlight e
              joga do notebook, celular ou TV.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 mb-10"
            >
              <motion.button
                onClick={() => navigate('/#plans')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black font-semibold rounded-lg overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                <span className="relative z-10">Ver planos</span>
                <ArrowRight
                  size={16}
                  className="relative z-10 transition-transform group-hover:translate-x-0.5"
                />
                {/* Glow animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.a
                href="https://discord.gg/3pT7NJGZ97"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 text-white font-medium rounded-lg hover:bg-white/[0.03] hover:border-white/25 transition-colors"
              >
                <span>Entrar na lista de espera</span>
              </motion.a>
            </motion.div>

            {/* Trust bar com stats inline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-sm text-foreground/50"
            >
              <TrustItem icon={<Shield size={14} />}>
                <span className="text-white font-medium">99.9%</span> uptime
              </TrustItem>
              <TrustItem icon={<Zap size={14} />}>
                <span className="text-white font-medium">&lt;30ms</span> latência
              </TrustItem>
              <TrustItem icon={<Sparkles size={14} />}>
                <span className="text-white font-medium">Tesla T4</span> GPU
              </TrustItem>
            </motion.div>
          </motion.div>

          {/* ============================ */}
          {/* RIGHT COLUMN: VM card           */}
          {/* ============================ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center gap-5"
          >
            <FloatingVMCard />
            <InstanceLabel />
          </motion.div>
        </div>

        {/* ============================ */}
        {/* STATS BAR bottom                 */}
        {/* ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-16 pt-8 border-t border-white/[0.06]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((stat) => (
              <StatItem key={stat.label} {...stat} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// BACKGROUND: grid pattern + light orbs + radial gradient
// ============================================================

function BackgroundLayer() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Gradient sutil do topo: iluminação neutra (sem cores saturadas) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,255,255,0.04),transparent_60%)]" />

      {/* Grid pattern SVG bem discreto */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.015]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Fade pra segunda seção */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

// ============================================================
// FLOATING VM CARD: specs de uma VM ativa (mockup)
// ============================================================

function FloatingVMCard() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-full max-w-[420px]"
    >
      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.015] backdrop-blur-xl p-6 shadow-2xl">
        {/* Shine/highlight no topo */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[11px] font-mono text-foreground/50 ml-2">
              vm-oris-sp
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Online
          </div>
        </div>

        {/* Specs grid 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <SpecCard icon={<Cpu size={14} />} label="GPU" value="Tesla T4" sub="16GB GDDR6" />
          <SpecCard icon={<Server size={14} />} label="vCPU" value="16 cores" sub="Intel Xeon" />
          <SpecCard icon={<HardDrive size={14} />} label="RAM" value="64 GB" sub="DDR4 ECC" />
          <SpecCard icon={<MapPin size={14} />} label="Região" value="sa-east-1" sub="São Paulo" />
        </div>

        {/* Latency bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-foreground/50">Latência</span>
            <span className="text-xs font-mono font-semibold text-emerald-400">
              12 ms
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '18%' }}
              transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            />
          </div>
        </div>

        {/* Status row substitui o botão Conectar (mockup visual) */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-black/30 border border-white/5">
          <div className="flex items-center gap-2 text-[11px] font-mono text-foreground/60">
            <span className="text-emerald-400">$</span>
            <span>session-active</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="relative flex h-1 w-1">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-400" />
              </span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-foreground/40">uptime 02:14:33</span>
        </div>
      </div>

      {/* Glow atrás do card: sutil branco, sem cores saturadas */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02] blur-3xl" />
    </motion.div>
  );
}

function SpecCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-foreground/50 mb-1.5">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-white leading-tight">{value}</p>
      <p className="text-[10px] text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}

// ============================================================
// INSTANCE LABEL: info técnica estática abaixo do VM card
// ============================================================

function InstanceLabel() {
  return (
    <div className="w-full max-w-[420px] flex items-center justify-center gap-2 text-[10px] font-mono text-foreground/45">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.02]">
        <span className="text-foreground/35">tipo:</span>
        <span className="text-foreground/80">g4dn.xlarge</span>
      </span>
      <span className="text-foreground/25">·</span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.02]">
        <span className="text-foreground/35">região:</span>
        <span className="text-foreground/80">sa-east-1</span>
      </span>
    </div>
  );
}

// ============================================================
// TRUST BAR items
// ============================================================

function TrustItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="text-foreground/40">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ============================================================
// STATS BAR items
// ============================================================

interface Stat {
  label: string;
  value: string;
  sub: string;
}

const STATS: Stat[] = [
  { label: 'Infraestrutura', value: 'AWS G4dn', sub: 'São Paulo' },
  { label: 'GPU', value: 'NVIDIA Tesla T4', sub: '16GB GDDR6' },
  { label: 'Configurações', value: '4 a 16', sub: 'vCPU · até 64GB RAM' },
  { label: 'Latência média', value: '< 30 ms', sub: '99.9% uptime' },
];

function StatItem({ label, value, sub }: Stat) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/40 mb-1.5">
        {label}
      </p>
      <p className="text-lg font-bold text-white leading-tight">{value}</p>
      <p className="text-xs text-foreground/50 mt-0.5">{sub}</p>
    </div>
  );
}
