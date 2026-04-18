/**
 * Logo da Oris Cloud.
 *
 * Símbolo: anel aberto com barra diagonal atravessando.
 * Referência semântica: "oris" vem do latim e significa borda/limite/fronteira.
 * O anel aberto evoca um portal/fronteira; a barra sugere fluxo (dados, jogos, conexão).
 *
 * 100% SVG inline — sem dependência de imagem PNG/JPG.
 * Aceita className para cor (via currentColor) e tamanho.
 */

interface OrisLogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

export function OrisLogo({ className = "", size = 32, withWordmark = false }: OrisLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Oris Cloud"
        role="img"
        className="shrink-0"
      >
        {/* Anel aberto: gap no canto superior direito */}
        <path
          d="M16 3 C23.18 3 29 8.82 29 16 C29 23.18 23.18 29 16 29 C8.82 29 3 23.18 3 16 C3 10.48 6.44 5.77 11.29 3.89"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          fill="none"
        />
        {/* Barra diagonal atravessando — sinal de fluxo/movimento */}
        <path
          d="M10 22 L22 10"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span className="font-display font-semibold text-[1.05rem] tracking-tight text-white inline-flex items-baseline gap-[0.28em]">
          <span>Oris</span>
          <span className="text-white/60">Cloud</span>
        </span>
      )}
    </span>
  );
}
