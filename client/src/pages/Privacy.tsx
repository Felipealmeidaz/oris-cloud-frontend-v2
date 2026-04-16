import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Privacy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <a className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors w-fit">
              <ArrowLeft size={20} />
              Voltar
            </a>
          </Link>
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-16 max-w-4xl"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Política de Privacidade</h1>
          <p className="text-foreground/70">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-8">
          {/* Introdução */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
            <p className="text-foreground/80 leading-relaxed">
              A Oris Cloud Gaming ("nós", "nosso" ou "Oris") está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site e utiliza nossos serviços.
            </p>
          </motion.section>

          {/* Informações Coletadas */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">2. Informações que Coletamos</h2>
            <div className="space-y-4 text-foreground/80">
              <p>Podemos coletar as seguintes informações:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Informações de Contato:</strong> Nome, email, telefone</li>
                <li><strong>Informações de Uso:</strong> Dados sobre como você interage com nosso site</li>
                <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
                <li><strong>Cookies:</strong> Identificadores armazenados no seu dispositivo</li>
              </ul>
            </div>
          </motion.section>

          {/* Como Usamos */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">3. Como Usamos Suas Informações</h2>
            <div className="space-y-4 text-foreground/80">
              <p>Usamos as informações coletadas para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Responder a suas consultas e solicitações</li>
                <li>Enviar atualizações e comunicações importantes</li>
                <li>Prevenir fraude e atividades não autorizadas</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </div>
          </motion.section>

          {/* Proteção de Dados */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">4. Proteção de Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Implementamos medidas de segurança técnicas, administrativas e físicas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia SSL/TLS, firewalls e monitoramento contínuo de segurança.
            </p>
          </motion.section>

          {/* LGPD */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">5. Direitos Conforme a LGPD</h2>
            <div className="space-y-4 text-foreground/80">
              <p>Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acesso:</strong> Solicitar quais dados pessoais temos sobre você</li>
                <li><strong>Correção:</strong> Corrigir dados imprecisos ou incompletos</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados ("direito ao esquecimento")</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              </ul>
              <p className="mt-4">
                Para exercer qualquer desses direitos, entre em contato conosco em <strong>suporte@oriscloud.com.br</strong>
              </p>
            </div>
          </motion.section>

          {/* Cookies */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
            <p className="text-foreground/80 leading-relaxed">
              Usamos cookies para melhorar sua experiência. Cookies são pequenos arquivos armazenados no seu dispositivo. Você pode controlar cookies através das configurações do seu navegador. Cookies não essenciais requerem seu consentimento explícito.
            </p>
          </motion.section>

          {/* Retenção de Dados */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">7. Retenção de Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Mantemos seus dados pessoais apenas pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Dados de contato são retidos por 2 anos após a última interação, a menos que você solicite exclusão antes.
            </p>
          </motion.section>

          {/* Compartilhamento */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">8. Compartilhamento de Dados</h2>
            <p className="text-foreground/80 leading-relaxed">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para fornecer nossos serviços (como processadores de pagamento) ou quando exigido por lei. Todos os terceiros são obrigados a manter a confidencialidade.
            </p>
          </motion.section>

          {/* Links Externos */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">9. Links Externos</h2>
            <p className="text-foreground/80 leading-relaxed">
              Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelas práticas de privacidade desses sites. Recomendamos que você leia as políticas de privacidade deles antes de fornecer informações pessoais.
            </p>
          </motion.section>

          {/* Contato */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">10. Entre em Contato</h2>
            <div className="space-y-4 text-foreground/80">
              <p>Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco:</p>
              <div className="bg-card border border-border rounded-lg p-6">
                <p><strong>Email:</strong> suporte@oriscloud.com.br</p>
                <p><strong>Discord:</strong> <a href="https://discord.gg/3pT7NJGZ97" className="text-blue-400 hover:text-blue-300">Junte-se ao nosso servidor</a></p>
              </div>
            </div>
          </motion.section>

          {/* Alterações */}
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">11. Alterações nesta Política</h2>
            <p className="text-foreground/80 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas publicando a nova versão neste site. Sua continuação do uso do site após tais notificações constitui sua aceitação das alterações.
            </p>
          </motion.section>
        </motion.div>
      </motion.div>
    </div>
  );
}
