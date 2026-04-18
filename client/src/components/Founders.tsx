import { motion } from 'framer-motion';
import { Linkedin, MessageCircle, Quote } from 'lucide-react';

const DISCORD_URL = 'https://discord.gg/3pT7NJGZ97';

interface Founder {
  name: string;
  handle: string;
  role: string;
  bio: string;
  initial: string;
  linkedin?: string;
}

const FOUNDERS: Founder[] = [
  {
    name: 'Adryan',
    handle: 'S2',
    role: 'Fundador & CEO',
    bio: 'Lidera a estratégia e o crescimento da Oris Cloud. Responsável por parcerias com comunidades gamer e expansão de capacidade na AWS.',
    initial: 'A',
  },
  {
    name: 'Felipe Almeida',
    handle: 'Z2ky',
    role: 'Co-fundador e CTO',
    bio: 'Responsável pela infraestrutura, arquitetura cloud e otimização de performance. Cuida do stack técnico e da experiência de quem joga.',
    initial: 'F',
    linkedin: 'https://www.linkedin.com/in/felipe-almeida-7ab062336/',
  },
];

export default function Founders() {
  return (
    <section id="founders" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-medium text-foreground/60">
            Quem tá por trás
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Construído por gamers,<br />pra gamers
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-xl mx-auto">
            Uma dupla que junta visão de negócio com expertise em infraestrutura cloud pra
            entregar cloud gaming sério no Brasil.
          </p>
        </motion.div>

        {/* Founders grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {FOUNDERS.map((founder, i) => (
            <FounderCard key={founder.name} founder={founder} delay={0.15 + i * 0.1} />
          ))}
        </div>

        {/* Story card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] p-8 md:p-10"
        >
          <Quote size={28} className="text-foreground/20 mb-4" strokeWidth={2.5} />
          <blockquote className="text-lg md:text-xl text-foreground/85 leading-relaxed mb-4 max-w-3xl">
            A Oris Cloud nasceu de uma frustração simples: querer jogar títulos modernos sem
            investir R$ 5 mil num PC. Aplicamos nossa experiência em infraestrutura AWS e
            comunidades gamer pra entregar uma plataforma que funciona de verdade, com
            transparência total sobre o hardware que você tá usando.
          </blockquote>
          <p className="text-sm text-foreground/50">
            Adryan &amp; Felipe, fundadores
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// FounderCard
// ============================================================

function FounderCard({ founder, delay }: { founder: Founder; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.015] backdrop-blur-sm p-6 hover:border-white/15 transition-colors"
    >
      <div className="flex items-start gap-4 mb-5">
        {/* Avatar minimal com inicial estilizada */}
        <div className="relative shrink-0">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.04] border border-white/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-white tracking-tight">{founder.initial}</span>
          </div>
          {/* Ring sutil no hover */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all pointer-events-none" />
        </div>

        {/* Nome + handle + role */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white leading-none">{founder.name}</h3>
            <span className="text-xs font-mono text-foreground/40">@{founder.handle}</span>
          </div>
          <p className="text-xs font-medium text-foreground/60 mt-1.5">{founder.role}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-foreground/65 leading-relaxed mb-5">{founder.bio}</p>

      {/* Social / contato */}
      <div className="flex items-center gap-2">
        {founder.linkedin ? (
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`LinkedIn de ${founder.name}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/10 bg-white/[0.02] text-xs text-foreground/70 hover:text-white hover:border-white/25 transition-colors"
          >
            <Linkedin size={12} />
            LinkedIn
          </a>
        ) : (
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/10 bg-white/[0.02] text-xs text-foreground/70 hover:text-white hover:border-white/25 transition-colors"
          >
            <MessageCircle size={12} />
            Fala comigo no Discord
          </a>
        )}
      </div>
    </motion.div>
  );
}
