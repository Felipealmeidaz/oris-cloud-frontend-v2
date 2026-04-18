import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";
import { MonitorCheck } from "lucide-react";

export function FeaturesSectionDemo() {
  const features = [
    {
      title: "GPUs NVIDIA de Última Geração",
      description:
        "Máquinas equipadas com Tesla T4 e A10 para rodar qualquer jogo com gráficos no máximo.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Acesso Instantâneo",
      description:
        "Sem downloads, sem instalações. Conecte e comece a jogar em segundos.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Preços Flexíveis",
      description:
        "Planos acessíveis com pagamento via PIX, cartão ou Mercado Pago. Sem taxas ocultas.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Infraestrutura AWS",
      description: "99.9% de uptime alvo rodando em instâncias EC2 na região sa-east-1 (São Paulo).",
      icon: <IconCloud />,
    },
    {
      title: "Controle Total",
      description: "Configure vCPUs, armazenamento e recursos da sua máquina virtual como preferir.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Suporte via Discord",
      description:
        "Comunidade ativa e equipe pronta para ajudar com qualquer dúvida.",
      icon: <IconHelp />,
    },
    {
      title: "Segurança Enterprise",
      description:
        "Proteção de nível corporativo para seus dados e sessões de jogo.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Jogue em Qualquer Lugar",
      description: "Acesse de PC, notebook, celular, TV Smart ou qualquer dispositivo.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="relative z-10 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-400">
          <MonitorCheck className="h-4 w-4" />
          Oris | Recursos
        </div>
        <h2 className="mb-4 text-4xl font-normal tracking-wide text-white sm:text-5xl">
          Por que escolher a<br />Oris Cloud?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
          Tecnologia de ponta, performance incomparável e flexibilidade total para sua experiência de gaming.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-gray-800",
        (index === 0 || index === 4) && "lg:border-l border-gray-800",
        index < 4 && "lg:border-b border-gray-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-gray-800/50 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-gray-400">
        {icon}
      </div>
      <div className="text-lg font-normal mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-gray-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white">
          {title}
        </span>
      </div>
      <p className="text-sm text-gray-400 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
