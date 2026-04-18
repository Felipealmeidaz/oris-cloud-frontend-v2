'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
                    <h1 className="text-5xl font-normal mb-4">Termos de Serviço</h1>
                    <p className="text-gray-400 text-lg">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-gray-300">
                    
                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">1. Aceitação dos Termos</h2>
                        <p className="leading-relaxed">
                            Ao acessar e utilizar os serviços da Oris Cloud, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">2. Descrição dos Serviços</h2>
                        <p className="leading-relaxed mb-3">
                            A Oris Cloud oferece serviços de máquinas virtuais para cloud gaming em instâncias AWS EC2 dedicadas. Nossos serviços incluem:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Acesso a máquinas virtuais com GPU NVIDIA Tesla T4 em AWS sa-east-1 (São Paulo)</li>
                            <li>Streaming via Parsec ou Moonlight com baixa latência</li>
                            <li>Suporte técnico via Discord</li>
                            <li>Planos de assinatura com diferentes durações e vCPUs</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">3. Política de Pagamento e Reembolso</h2>
                        <p className="leading-relaxed mb-3">
                            <strong className="text-white">IMPORTANTE:</strong> Não oferecemos reembolso após a confirmação da assinatura. Ao realizar o pagamento, você concorda que:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>O pagamento é final e não reembolsável</li>
                            <li>A assinatura será ativada imediatamente após a confirmação do pagamento</li>
                            <li>Você é responsável por verificar a disponibilidade de estoque antes da compra</li>
                            <li>Os preços estão sujeitos a alterações sem aviso prévio</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">4. Uso Aceitável</h2>
                        <p className="leading-relaxed mb-3">
                            Ao utilizar nossos serviços, você concorda em:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Não utilizar softwares de mineração de criptomoedas</li>
                            <li>Não realizar overclocking nas máquinas</li>
                            <li>Não utilizar os serviços para atividades ilegais</li>
                            <li>Não compartilhar suas credenciais de acesso</li>
                            <li>Não utilizar programas pirateados</li>
                            <li>Respeitar os limites de uso estabelecidos em seu plano</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">5. Disponibilidade e Manutenção</h2>
                        <p className="leading-relaxed">
                            Nos reservamos o direito de realizar manutenções programadas e emergenciais. Faremos o possível para notificar os usuários com antecedência. Não garantimos disponibilidade de 100% do serviço e não nos responsabilizamos por interrupções temporárias.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">6. Limitações de Jogos</h2>
                        <p className="leading-relaxed mb-3">
                            Alguns jogos podem não funcionar em máquinas virtuais devido a restrições de anti-cheat. Jogos conhecidos por não funcionarem incluem, mas não se limitam a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Valorant</li>
                            <li>GTA 5 Online</li>
                            <li>League of Legends</li>
                            <li>Jogos com Encrypt</li>
                            <li>Emuladores Android</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">7. Propriedade Intelectual</h2>
                        <p className="leading-relaxed">
                            Todo o conteúdo presente em nosso site, incluindo textos, gráficos, logos e software, é propriedade da Oris Cloud e está protegido por leis de direitos autorais. É proibida a reprodução sem autorização prévia.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">8. Limitação de Responsabilidade</h2>
                        <p className="leading-relaxed">
                            A Oris Cloud não se responsabiliza por danos diretos, indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de usar nossos serviços. Não garantimos que os serviços atenderão a todas as suas necessidades específicas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">9. Cancelamento e Suspensão</h2>
                        <p className="leading-relaxed">
                            Reservamo-nos o direito de suspender ou cancelar sua conta a qualquer momento, sem aviso prévio, caso você viole estes termos de serviço. Nenhum reembolso será concedido em caso de suspensão ou cancelamento por violação dos termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">10. Modificações dos Termos</h2>
                        <p className="leading-relaxed">
                            Podemos modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. É sua responsabilidade revisar periodicamente estes termos. O uso continuado dos serviços após as alterações constitui aceitação dos novos termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-white mb-4">11. Contato</h2>
                        <p className="leading-relaxed">
                            Para questões sobre estes Termos de Serviço, entre em contato conosco através do nosso servidor Discord ou pelos canais de suporte disponíveis em nosso site.
                        </p>
                    </section>

                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <p className="text-gray-500 text-sm">
                        Ao utilizar os serviços da Oris Cloud, você confirma que leu, compreendeu e concordou com estes Termos de Serviço.
                    </p>
                </div>

            </div>
        </div>
    );
}
