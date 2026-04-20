import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { OrisLogo } from "@/components/ui/oris-logo";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "PRODUTO",
    links: [
      { label: "Máquinas Virtuais", href: "/machines" },
      { label: "Assinar plano", href: "/order" },
      { label: "Painel de Controle", href: "/dashboard" },
    ],
  },
  {
    title: "RECURSOS",
    links: [
      { label: "Perguntas Frequentes", href: "/faq" },
      { label: "Parsec", href: "https://parsec.app/downloads", external: true },
      {
        label: "Moonlight",
        href: "https://github.com/moonlight-stream/moonlight-qt/releases/tag/v6.1.0",
        external: true,
      },
    ],
  },
  {
    title: "SUPORTE",
    links: [
      { label: "Discord", href: "/discord", external: true },
      { label: "Contato", href: "mailto:suporte@oriscloud.com.br" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Termos de Uso", href: "/terms" },
      { label: "Política de Privacidade", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full text-gray-400 pt-10 pb-8 px-6 md:px-8">
      {/* Divisor superior com gradiente sutil */}
      <div className="w-full max-w-6xl mx-auto h-px mb-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand (ocupa 2 colunas no desktop) */}
          <div className="col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity"
            >
              <OrisLogo size={28} className="text-emerald-400" />
              <span className="font-semibold text-lg tracking-tight inline-flex items-baseline gap-[0.28em]">
                <span>Oris</span>
                <span className="text-white/60">Cloud</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
              Cloud gaming com GPU NVIDIA Tesla T4 rodando em AWS São Paulo.
              Jogue do notebook, celular ou TV via Parsec ou Moonlight.
            </p>
          </div>

          {/* Colunas de links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-medium text-xs tracking-widest mb-4 text-white/90">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5"
                      {...(link.external && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                    >
                      <span>{link.label}</span>
                      {link.external && (
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rodapé final */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Oris Cloud. Todos os direitos
            reservados.
          </p>
          <p className="font-mono tracking-wider">
            AWS sa-east-1 · São Paulo, Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
