'use client';

/**
 * Página dedicada de Perguntas Frequentes (FAQ) da Oris Cloud.
 *
 * Espelha a seção FAQ da home (/) mas organiza por categorias pra ficar
 * mais fácil de navegar. Linkado no footer (coluna Recursos) e usado
 * pelo SEO como landing page de long-tail queries.
 */

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  MonitorCheck,
  Zap,
  Shield,
  CreditCard,
  Gamepad2,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: React.ReactNode;
}

interface FaqCategory {
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const categories: FaqCategory[] = [
  {
    title: "Conexão e performance",
    icon: <Zap className="h-4 w-4" />,
    items: [
      {
        q: "Qual é a velocidade ideal de internet para usar a Oris Cloud?",
        a: (
          <>
            A velocidade <strong>mínima</strong> recomendada é de 15 Mbps e a{" "}
            <strong>ideal</strong> é de 30 Mbps ou mais. Conexão estável e com
            baixa perda de pacote é mais importante do que velocidade bruta —
            preferimos cabo de rede ou Wi-Fi 5GHz ao invés de Wi-Fi 2.4GHz.
          </>
        ),
      },
      {
        q: "Em quais dispositivos posso jogar pela Oris?",
        a: (
          <>
            Praticamente qualquer dispositivo que rode{" "}
            <Link
              href="https://parsec.app/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Parsec
            </Link>{" "}
            ou{" "}
            <Link
              href="https://github.com/moonlight-stream/moonlight-qt/releases/tag/v6.1.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Moonlight
            </Link>
            : notebooks (mesmo fracos), celular Android/iOS, Smart TV ou TV Box
            Android, e computadores. A máquina virtual roda o jogo remotamente;
            o seu dispositivo só recebe o vídeo e manda o controle.
          </>
        ),
      },
      {
        q: "Quais resoluções estão disponíveis?",
        a: "Suportamos até 8K em todas as máquinas virtuais. Pra uma boa experiência, recomendamos 1080p a 60fps como padrão. 4K exige conexão de pelo menos 50 Mbps.",
      },
      {
        q: "Por que minha conexão está com latência alta?",
        a: (
          <>
            Latência alta geralmente é por Wi-Fi fraco, roteador sobrecarregado
            ou VPN ativa. Testes rápidos: (1) conecte por cabo se possível, (2)
            desative VPN/proxy, (3) feche apps que usam banda (Netflix,
            torrents). Se persistir, abra ticket no{" "}
            <Link
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Discord
            </Link>
            .
          </>
        ),
      },
    ],
  },
  {
    title: "Jogos e compatibilidade",
    icon: <Gamepad2 className="h-4 w-4" />,
    items: [
      {
        q: "Posso rodar qualquer jogo na Oris?",
        a: (
          <>
            A maioria sim. Mas alguns jogos com anti-cheat de kernel bloqueiam
            máquina virtual — hoje{" "}
            <strong>
              não funcionam: Valorant, GTA 5 Online, League of Legends e alguns
              jogos com Encrypt
            </strong>
            . Também não suportamos emuladores Android nem VirtualBox.
            Trabalhamos pra expandir a compatibilidade sempre que possível.
          </>
        ),
      },
      {
        q: "Posso instalar meus próprios jogos e programas?",
        a: "Sim. Você tem acesso de administrador à máquina virtual Windows e pode instalar Steam, Epic Games, GOG, Battle.net, Origin, Riot (exceto Valorant/LoL), Xbox, navegadores, Discord, OBS e praticamente qualquer software comercial legítimo.",
      },
      {
        q: "Vocês instalam jogos pirateados?",
        a: "Não. A Oris não incentiva e nunca incentivará o uso de programas piratas. Se detectarmos cracks ou software ilegal, sua máquina pode ser suspensa sem reembolso. Recomendamos usar sempre cópias oficiais — Steam costuma ter promoções agressivas.",
      },
    ],
  },
  {
    title: "Planos e pagamento",
    icon: <CreditCard className="h-4 w-4" />,
    items: [
      {
        q: "Quais formas de pagamento vocês aceitam?",
        a: "Cartão de crédito, cartão de débito, saldo do Mercado Pago e PIX. O pagamento é processado pelo Mercado Pago com criptografia de ponta.",
      },
      {
        q: "Vocês cobram por hora, mês ou como funciona?",
        a: (
          <>
            Oferecemos planos de <strong>Diário, Semanal, Quinzenal, Mensal e
            Trimestral</strong>. Dentro do período contratado, você liga e
            desliga a máquina quantas vezes quiser — cobramos pelo acesso, não
            por hora de uso. Confira os valores atuais em{" "}
            <Link
              href="/machines"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Máquinas
            </Link>
            .
          </>
        ),
      },
      {
        q: "Tem período de teste grátis?",
        a: (
          <>
            Hoje não oferecemos trial grátis, mas o plano Diário é acessível e
            te permite testar tudo. Se tiver dúvida, entra no{" "}
            <Link
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Discord
            </Link>{" "}
            e alguém da equipe responde direto.
          </>
        ),
      },
    ],
  },
  {
    title: "Segurança e políticas",
    icon: <Shield className="h-4 w-4" />,
    items: [
      {
        q: "Posso minerar criptomoedas ou fazer overclock na máquina?",
        a: (
          <>
            <strong>Não.</strong> É terminantemente proibido usar software de
            mineração ou overclocking. Violações resultam em suspensão imediata
            e sem reembolso. As máquinas são otimizadas para jogos e uso
            geral — mineração é abuso do recurso compartilhado.
          </>
        ),
      },
      {
        q: "Meus arquivos ficam salvos quando desligo a máquina?",
        a: "Sim. Seus jogos e arquivos permanecem no disco da máquina enquanto seu plano estiver ativo. Se o plano expirar e você não renovar, a máquina é desprovisionada e os dados apagados — recomendamos fazer backup de saves importantes no Steam Cloud ou OneDrive.",
      },
      {
        q: "Tem restrição de conteúdo pra menores de idade?",
        a: "Não há filtro técnico, mas recomendamos fortemente o uso supervisionado por responsável. A Oris atende a LGPD e nossos termos exigem autorização do responsável para menores de 18 anos criarem conta.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen w-full text-white bg-[rgb(9,9,11)]">
      {/* Hero */}
      <section className="relative px-6 md:px-11 pt-36 md:pt-44 pb-12 md:pb-16 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/[0.04] blur-3xl" />
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] text-xs font-medium text-white/80">
            <HelpCircle className="h-3.5 w-3.5" />
            Perguntas frequentes
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.05] mb-5">
            Tudo que você precisa saber.
          </h1>
          <p className="text-base md:text-lg text-white/65 leading-relaxed">
            Respostas rápidas pras dúvidas mais comuns sobre jogos, planos,
            conexão e segurança. Não achou o que procurava?{" "}
            <Link
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              Pergunta no Discord
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Categorias */}
      <section className="relative px-6 md:px-11 pb-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {categories.map((cat) => (
            <div key={cat.title}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {cat.icon}
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                  {cat.title}
                </h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {cat.items.map((item, idx) => (
                  <AccordionItem
                    key={`${cat.title}-${idx}`}
                    value={`${cat.title}-${idx}`}
                  >
                    <AccordionTrigger className="text-left text-base font-medium">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[15px] text-gray-400 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* CTA final pra Discord */}
          <div className="mt-16 rounded-2xl border border-gray-800 bg-gradient-to-br from-emerald-500/[0.04] to-transparent p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Ainda com dúvida?
            </h3>
            <p className="text-gray-400 mb-5 max-w-md mx-auto">
              Nossa comunidade no Discord responde rápido e tem gente da equipe
              online praticamente todo dia.
            </p>
            <Link
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-11 px-6">
                <MessageCircle className="h-4 w-4 mr-2" />
                Entrar no Discord
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
