'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen w-screen bg-[rgb(9,9,11)] text-white">
            <div className="max-w-4xl mx-auto px-6 py-16 pt-32">
                
                {/* Back Button */}
                <Link href="/">
                    <Button variant="outline" className="mb-8 border-gray-700 hover:bg-gray-800">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-normal mb-4">Política de Privacidade</h1>
                    <p className="text-gray-400 text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-300">
                    
                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">1. Introdução</h2>
                        <p className="leading-relaxed">
                            A Oris Cloud está comprometida em proteger sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você utiliza nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">2. Informações que Coletamos</h2>
                        <p className="leading-relaxed mb-3">
                            Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
                        </p>
                        
                        <h3 className="text-xl text-white mt-6 mb-3">2.1 Informações Pessoais</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Nome de usuário</li>
                            <li>Endereço de e-mail</li>
                            <li>Informações de pagamento (processadas por terceiros)</li>
                            <li>ID do Discord (quando aplicável)</li>
                            <li>Foto de perfil</li>
                        </ul>

                        <h3 className="text-xl text-white mt-6 mb-3">2.2 Informações de Uso</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Endereço IP</li>
                            <li>Tipo de navegador</li>
                            <li>Páginas visitadas</li>
                            <li>Tempo de acesso</li>
                            <li>Informações sobre o uso das máquinas virtuais</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">3. Como Usamos suas Informações</h2>
                        <p className="leading-relaxed mb-3">
                            Utilizamos as informações coletadas para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Fornecer e manter nossos serviços</li>
                            <li>Processar pagamentos e transações</li>
                            <li>Enviar notificações sobre sua conta e serviços</li>
                            <li>Fornecer suporte técnico</li>
                            <li>Melhorar nossos serviços e desenvolver novos recursos</li>
                            <li>Detectar e prevenir fraudes</li>
                            <li>Cumprir obrigações legais</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">4. Compartilhamento de Informações</h2>
                        <p className="leading-relaxed mb-3">
                            Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong className="text-white">Processadores de Pagamento:</strong> Para processar transações (EFI Bank, Mercado Pago)</li>
                            <li><strong className="text-white">Provedores de Serviços:</strong> Empresas que nos auxiliam na operação dos serviços</li>
                            <li><strong className="text-white">Requisitos Legais:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
                            <li><strong className="text-white">Transferência de Negócios:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">5. Segurança dos Dados</h2>
                        <p className="leading-relaxed">
                            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro, e não podemos garantir segurança absoluta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">6. Cookies e Tecnologias Similares</h2>
                        <p className="leading-relaxed mb-3">
                            Utilizamos cookies e tecnologias similares para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Manter você conectado à sua conta</li>
                            <li>Lembrar suas preferências</li>
                            <li>Analisar o uso do site</li>
                            <li>Melhorar a experiência do usuário</li>
                        </ul>
                        <p className="leading-relaxed mt-3">
                            Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">7. Retenção de Dados</h2>
                        <p className="leading-relaxed">
                            Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">8. Seus Direitos</h2>
                        <p className="leading-relaxed mb-3">
                            Você tem os seguintes direitos em relação às suas informações pessoais:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li><strong className="text-white">Acesso:</strong> Solicitar uma cópia das informações que temos sobre você</li>
                            <li><strong className="text-white">Correção:</strong> Solicitar a correção de informações incorretas</li>
                            <li><strong className="text-white">Exclusão:</strong> Solicitar a exclusão de suas informações pessoais</li>
                            <li><strong className="text-white">Portabilidade:</strong> Solicitar a transferência de suas informações</li>
                            <li><strong className="text-white">Objeção:</strong> Opor-se ao processamento de suas informações</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">9. Privacidade de Menores</h2>
                        <p className="leading-relaxed">
                            Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. Se você é pai ou responsável e acredita que seu filho nos forneceu informações pessoais, entre em contato conosco.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">10. Transferências Internacionais</h2>
                        <p className="leading-relaxed">
                            Suas informações podem ser transferidas e mantidas em servidores localizados fora do seu país de residência. Ao utilizar nossos serviços, você consente com essa transferência.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">11. Alterações nesta Política</h2>
                        <p className="leading-relaxed">
                            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas publicando a nova política em nosso site. Recomendamos que você revise esta política regularmente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">12. Contato</h2>
                        <p className="leading-relaxed">
                            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco através do nosso servidor Discord ou pelos canais de suporte disponíveis em nosso site.
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <p className="text-gray-500 text-sm">
                        Ao utilizar os serviços da Oris Cloud, você confirma que leu, compreendeu e concordou com esta Política de Privacidade.
                    </p>
                </div>

            </div>
        </div>
    );
}
