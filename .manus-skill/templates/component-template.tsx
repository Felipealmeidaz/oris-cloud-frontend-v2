// @ts-nocheck — arquivo de referencia, nao compilado
/**
 * Template canonico para um novo componente do Oris Cloud.
 * Copie este arquivo, renomeie, e adapte o conteudo.
 *
 * CHECKLIST:
 * - [ ] Props tipadas com interface (sem 'any')
 * - [ ] className opcional para extensibilidade
 * - [ ] Animacoes framer-motion se visual
 * - [ ] Icones lucide-react (unica lib permitida)
 * - [ ] Textos em pt-BR
 * - [ ] Acessibilidade: aria-label em botoes
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NomeDoComponenteProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function NomeDoComponente({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  children,
}: NomeDoComponenteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'group rounded-lg border border-border bg-card/40 p-5 hover:bg-card/70 hover:border-white/20 transition-all',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="h-10 w-10 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
            <Icon className="h-5 w-5 text-foreground/70 group-hover:text-white transition-colors" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          {description && (
            <p className="text-sm text-foreground/60 leading-relaxed">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </motion.div>
  );
}
