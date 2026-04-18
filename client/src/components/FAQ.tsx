import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const DISCORD_URL = 'https://discord.gg/3pT7NJGZ97';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: 'Como funciona o cloud gaming na Oris?',
    answer: 'Você recebe uma VM dedicada rodando na AWS em São Paulo com GPU Tesla T4. Instala seus próprios jogos pelas lojas que já usa (Steam, Epic, Battle.net) e joga a partir de qualquer dispositivo via Parsec ou Moonlight. É como ter um PC gamer de alto desempenho hospedado na nuvem.',
  },
  {
    question: 'Que internet preciso ter?',
    answer: 'Mínimo recomendado de 25 Mbps para 1080p a 60fps. Para 1440p, o ideal é 35 Mbps. Estabilidade é mais importante que velocidade bruta, então conexões via cabo ou Wi-Fi 5GHz próximas do roteador são sempre preferíveis ao 4G.',
  },
  {
    question: 'Posso jogar no celular, tablet ou TV?',
    answer: 'Sim. O Parsec roda em Windows, macOS, Linux, Android e iOS. O Moonlight é suportado até em Apple TV e alguns modelos de Smart TV. Se o dispositivo tem tela e conexão razoável, dá pra jogar.',
  },
  {
    question: 'Meus dados ficam salvos entre sessões?',
    answer: 'Sim. Sua VM tem storage dedicado e a gente mantém snapshot do estado. Seus jogos instalados, saves locais, configurações e mods ficam preservados mesmo quando você desliga a máquina.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer: 'Aceitamos PIX e cartão (crédito e débito). Os planos são quinzenais ou mensais, sem fidelidade. Você pode cancelar a qualquer momento e continuar usando até o fim do período já pago.',
  },
  {
    question: 'Qual o horário do suporte?',
    answer: 'Atendimento via Discord de segunda a sábado. Resposta na maior parte do dia é em minutos, casos técnicos podem ir pra fila interna mas sempre voltam com retorno no mesmo dia útil.',
  },
  {
    question: 'Posso instalar qualquer programa na VM?',
    answer: 'Sim, você tem acesso administrativo. Pode instalar lojas de jogos, apps de stream (OBS, Discord), mods, anticheats e o que mais precisar, desde que respeite os Termos de Uso e a legislação.',
  },
  {
    question: 'E se eu tiver lag ou queda de conexão?',
    answer: 'Primeiro verificamos seu lado (roteador, Wi-Fi, ISP). Se o problema for da plataforma, corrigimos em minutos. Temos monitoramento ativo das VMs e instâncias redundantes no mesmo AZ da AWS.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative overflow-hidden border-t border-white/[0.05]">
      {/* Background sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-[11px] font-medium text-foreground/60">
            Perguntas frequentes
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Tudo o que você<br />quer saber
          </h2>
          <p className="text-base md:text-lg text-foreground/60 max-w-xl mx-auto">
            Respostas diretas pras dúvidas mais comuns sobre hardware, suporte,
            pagamento e compatibilidade.
          </p>
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-2.5 mb-10">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.question}
              faq={faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Contact card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 md:p-8 text-center"
        >
          <div className="inline-flex h-11 w-11 rounded-2xl bg-white/[0.05] border border-white/10 items-center justify-center mb-4">
            <MessageCircle size={18} className="text-foreground/80" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-white leading-tight mb-1.5">
            Não achou o que queria?
          </h3>
          <p className="text-sm text-foreground/60 leading-relaxed mb-5 max-w-md mx-auto">
            Fala com a gente direto no Discord. Time real, resposta rápida,
            sem bot de formulário.
          </p>
          <motion.a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/15 text-white font-medium text-sm hover:bg-white/[0.03] hover:border-white/25 transition-colors"
          >
            <MessageCircle size={14} />
            Entrar no Discord
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// FaqItem
// ============================================================

interface FaqItemProps {
  faq: Faq;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ faq, index, isOpen, onToggle }: FaqItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.04 }}
      className={`rounded-xl border transition-colors ${
        isOpen
          ? 'border-white/15 bg-white/[0.025]'
          : 'border-white/[0.08] bg-white/[0.015] hover:border-white/[0.12]'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full px-5 py-4 text-left flex items-center gap-4"
      >
        <span className="text-[11px] font-mono font-semibold text-foreground/30 tracking-wider shrink-0">
          0{index + 1}
        </span>
        <h3 className="flex-1 text-sm md:text-base font-semibold text-white leading-snug">
          {faq.question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-foreground/50"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-sm text-foreground/70 leading-relaxed border-t border-white/5 ml-10 pl-0">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
