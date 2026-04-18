import { motion } from 'framer-motion';
import { Linkedin, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';

const DISCORD_URL = 'https://discord.gg/3pT7NJGZ97';
const LINKEDIN_URL = 'https://www.linkedin.com/in/felipe-almeida-7ab062336/';
const CONTACT_EMAIL = 'suporte@oriscloud.com.br';

const FOOTER_LINKS = {
  Produto: [
    { name: 'Planos', href: '/#plans' },
    { name: 'Como funciona', href: '/#how' },
    { name: 'Diferenciais', href: '/#features' },
    { name: 'FAQ', href: '/#faq' },
  ],
  Empresa: [
    { name: 'Sobre', href: '/#about' },
    { name: 'Fundadores', href: '/#founders' },
    { name: 'Regras da comunidade', href: '/rules' },
    { name: 'Termos de uso', href: '/terms' },
  ],
  Suporte: [
    { name: 'Discord', href: DISCORD_URL, external: true },
    { name: 'Email', href: `mailto:${CONTACT_EMAIL}` },
    { name: 'Política de privacidade', href: '/privacy' },
  ],
} as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[0.05] bg-background overflow-hidden">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Main footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="py-14 grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10"
        >
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo-sm.png"
                srcSet="/logo-sm.png 1x, /logo-md.png 2x, /logo-lg.png 3x"
                alt="Oris Cloud"
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="text-lg font-bold tracking-wider text-white">ORIS CLOUD</span>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed mb-5">
              Cloud gaming com VMs dedicadas na AWS São Paulo. GPU NVIDIA Tesla T4,
              latência baixa e transparência total sobre o hardware que você usa.
            </p>
            <div className="space-y-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-xs text-foreground/60 hover:text-white transition-colors"
              >
                <Mail size={12} className="text-foreground/40" />
                {CONTACT_EMAIL}
              </a>
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <MapPin size={12} className="text-foreground/40" />
                São Paulo, Brasil · AWS sa-east-1
              </div>
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const isExternal = 'external' in link && link.external;
                  const isRoute = link.href.startsWith('/') && !link.href.startsWith('/#');

                  if (isRoute) {
                    return (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className="text-xs text-foreground/65 hover:text-white transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    );
                  }

                  return (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className="text-xs text-foreground/65 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="py-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="text-xs text-foreground/50">
            © {currentYear} Oris Cloud. Todos os direitos reservados.
          </div>

          {/* Status + socials */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs text-foreground/55">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Todos os sistemas operacionais
            </div>

            <div className="flex items-center gap-2">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-foreground/60 hover:text-white hover:border-white/20 transition-colors"
              >
                <Linkedin size={13} />
              </a>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-foreground/60 hover:text-white hover:border-white/20 transition-colors"
              >
                <MessageCircle size={13} />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-foreground/60 hover:text-white hover:border-white/20 transition-colors"
              >
                <Mail size={13} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
