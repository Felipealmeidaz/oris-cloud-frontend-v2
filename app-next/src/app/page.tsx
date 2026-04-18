'use client';

import Link from "next/link";
import Image from "next/image";
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
import { TypingAnimation } from "@/components/ui/typing-animation";
import { AnimatedGradientTextDemo } from "@/components/ui/TextDemo";

export default function Home() {
  return (
    <div className="min-h-screen w-screen text-white bg-[rgb(9,9,11)]">

      {/* Main Section */}
      <section className="relative px-6 md:px-11 mt-36 md:mt-48">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="mb-4 flex justify-center lg:justify-start">
                <AnimatedGradientTextDemo />
              </div>
              <div className="mb-4">
                <h1 className="text-3xl font-normal tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  Seu PC gamer na nuvem.{" "}
                  <span className="inline-block min-w-[280px] sm:min-w-[350px] md:min-w-[450px] lg:min-w-[550px] align-bottom">
                    <TypingAnimation
                      words={[
                        "No celular.",
                        "No computador.",
                        "No notebook.",
                        "Na TV.",
                        "Em qualquer lugar."
                      ]}
                      className="text-3xl font-normal tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent sm:text-4xl md:text-5xl lg:text-6xl"
                      typeSpeed={100}
                      deleteSpeed={50}
                      pauseDelay={2000}
                      loop={true}
                    />
                  </span>
                </h1>
              </div>
              <p className="mx-auto lg:mx-0 mb-8 max-w-xl text-base text-gray-400 sm:text-lg md:text-xl">
                Máquinas virtuais com GPUs NVIDIA de última geração. Sem downloads, sem instalações. Conecte e jogue instantaneamente.
              </p>
              <Link href="/order">
                <Button size="lg" variant="default" className="px-6 sm:px-8">
                  Começar agora
                </Button>
              </Link>
            </div>

            {/* Right Side - Image */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-lg">
                <Image
                  src="/images/oris-hero.png"
                  alt="Oris Cloud"
                  width={600}
                  height={600}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

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