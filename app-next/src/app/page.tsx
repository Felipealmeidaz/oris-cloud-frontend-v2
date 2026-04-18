'use client';

import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { MonitorCheck } from "lucide-react";

import WorldMap from "@/components/ui/world-map";
import { FeaturesSectionDemo } from "@/components/ui/features";

export default function Home() {
  return (
    <div className="min-h-screen w-screen text-white bg-[rgb(9,9,11)]">

      {/* Hero - text-only, factual, sem mascote */}
      <section className="relative px-6 md:px-11 pt-40 md:pt-56 pb-20 md:pb-32 overflow-hidden">
        {/* Glow sutil de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-sm text-xs font-medium text-white/80">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/80 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span>Powered by</span>
            <span className="font-semibold text-white">AWS</span>
            <span className="text-white/40">·</span>
            <span className="font-semibold text-white">NVIDIA Tesla T4</span>
          </div>

          {/* H1 factual, sem typing animation */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.02] mb-6 text-white">
            Cloud gaming
            <br />
            com hardware AWS.
          </h1>

          {/* Subline factual com especs reais */}
          <p className="mx-auto max-w-2xl text-base md:text-lg text-white/65 mb-9 leading-relaxed">
            VMs dedicadas com GPU{" "}
            <span className="text-white font-medium">NVIDIA Tesla T4</span>{" "}
            rodando em São Paulo. Você conecta pelo Parsec ou Moonlight e joga
            do notebook, celular ou TV.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/order">
              <Button size="lg" variant="default" className="px-8 font-medium">
                Começar agora
              </Button>
            </Link>
            <Link href="/machines">
              <Button size="lg" variant="ghost" className="px-8 font-medium text-white/80 hover:text-white">
                Ver máquinas
              </Button>
            </Link>
          </div>

          {/* Tech label abaixo do CTA */}
          <div className="mt-10 inline-flex items-center gap-3 font-mono text-[11px] text-white/40 uppercase tracking-[0.2em]">
            <span>g4dn.xlarge</span>
            <span className="text-white/20">·</span>
            <span>sa-east-1</span>
            <span className="text-white/20">·</span>
            <span>16GB VRAM</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 pt-28">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="h-96" />}>
            <FeaturesSectionDemo />
          </Suspense>
        </div>
      </section>

{/* World Map Section */}
      <section className="relative px-6 pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-400">
              <MonitorCheck className="h-4 w-4" />
              Oris | Global
            </div>
            <h2 className="mb-4 text-4xl font-normal tracking-wide text-white sm:text-5xl">
              Conectando Gamers<br />ao Redor do Mundo
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
              Nossa infraestrutura global permite que jogadores de qualquer lugar tenham acesso a máquinas de alta performance.
            </p>
          </div>
          
          <Suspense fallback={<div className="h-96" />}>
            <WorldMap
              dots={[
                {
                  start: { lat: -23.5505, lng: -46.6333 }, // São Paulo
                  end: { lat: 37.7749, lng: -122.4194 }, // San Francisco
                },
                {
                  start: { lat: -23.5505, lng: -46.6333 }, // São Paulo
                  end: { lat: 51.5074, lng: -0.1278 }, // Londres
                },
                {
                  start: { lat: -23.5505, lng: -46.6333 }, // São Paulo
                  end: { lat: 35.6762, lng: 139.6503 }, // Tóquio
                },
              ]}
              lineColor="#ffffffff"
            />
          </Suspense>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="flex-grow relative px-7 pt-28 pb-16 overflow-x-hidden">
        <div className="mx-auto max-w-6xl">

          {/* Main */}
          <div className="space-y-8 w-full text-left">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                <MonitorCheck className="h-4 w-4" />
                Oris | FAQ
              </div>
              <h2 className="mb-4 text-4xl font-normal tracking-wide text-white sm:text-5xl">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-gray-400">
                Encontre as respostas para as perguntas mais comuns sobre nossos serviços.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Qual é a velocidade ideal de internet para a melhor utilização do serviço?</AccordionTrigger>
                <AccordionContent>
                  A velocidade mínima é 15 mbp/s, e a ideal 30 mbp/s.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Posso utilizar softwares de mineração de criptomoedas e overclocking nas máquinas?</AccordionTrigger>
                <AccordionContent>
                  É completamente proibido a utilização de softwares de mineração e overclocking em qualquer hipótese em nosso serviço.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Na Oris é possível jogar qualquer jogo?</AccordionTrigger>
                <AccordionContent>
                  Estamos sempre atualizando e tentando trazer suporte para a maior quantidade de jogos possíveis, mas ainda existem algumas exceções por conta de determinados anti-cheats que bloqueiam máquina virtual.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Em quais dispositivos consigo acessar a Oris?</AccordionTrigger>
                <AccordionContent>
                  Em qualquer dispositivo, desde um notebook fraco, celular a até mesmo dispositivos como uma TV (Smart) / TV box (Com sistema Android).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Quais formas de pagamentos estão disponíveis para assinar?</AccordionTrigger>
                <AccordionContent>
                  Cartão de crédito, débito, saldo do Mercado Pago e até mesmo PIX.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Posso instalar aplicativos e/ou jogos pirateados nas máquinas?</AccordionTrigger>
                <AccordionContent>
                  A Oris não incentiva e nunca incentivará o uso de programas pirateados nas máquinas.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger>Quais resoluções estão disponíveis nas máquinas da Oris?</AccordionTrigger>
                <AccordionContent>
                  Suportamos resoluções em até 8K em todas as nossas máquinas virtuais.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger>Existe alguma restrição de conteúdo para o público menor de idade?</AccordionTrigger>
                <AccordionContent>
                  Não, nossas máquinas tem uso livre. Caso seja menor de idade, recomendamos altamente o uso acompanhado de algum adulto.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

        </div>
      </section>

    </div>
  );
};