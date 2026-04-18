/**
 * Fontes da Oris Cloud
 *
 * Mesma identidade tipográfica usada no client/ legado:
 *  - Space Grotesk → headlines, nomes de seção, marcas ("display")
 *  - Inter         → corpo de texto, UI, botões
 *  - JetBrains Mono → labels técnicas (g4dn.xlarge, sa-east-1, especs)
 *
 * Exportadas como CSS variables para o Tailwind resolver via `font-display`,
 * `font-sans`, `font-mono` nas classes.
 */

import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});
