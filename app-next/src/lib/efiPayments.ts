import axios from 'axios';
import https from 'https';


/**
 * Cria um agente HTTPS usando certificados das variáveis de ambiente
 * @returns {https.Agent} - Agente HTTPS configurado
 */
function createHttpsAgent(): https.Agent {
    const cert = process.env.EFI_CERT_PEM;
    const key = process.env.EFI_KEY_PEM;
    const ca = process.env.EFI_CA_PEM; // Opcional, caso tenha cadeia de certificados
    
    if (!cert || !key) {
        throw new Error('Certificados EFI não configurados nas variáveis de ambiente');
    }
    
    const agentOptions: https.AgentOptions = {
        cert: cert,
        key: key,
    };
    
    // Adicionar CA se disponível
    if (ca) {
        agentOptions.ca = ca;
    }
    
    return new https.Agent(agentOptions);
}

/**
 * Obtém o token de acesso do EfiBank usando variáveis de ambiente
 * @returns {Promise<string|null>} - Token de acesso
 */
export async function getEfiAccessToken(): Promise<string | null> {
    try {
        const clientId = process.env.EFI_CLIENT_ID;
        const clientSecret = process.env.EFI_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
            throw new Error('Credenciais do EfiBank não configuradas');
        }

        // Criar agente HTTPS com certificados das variáveis de ambiente
        const httpsAgent = createHttpsAgent();

        // Credenciais em base64
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        // Fazer requisição para obter o token
        const response = await axios.post(
            'https://pix.api.efipay.com.br/oauth/token',
            { grant_type: 'client_credentials' },
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent,
                timeout: 10000, // 10 segundos
            }
        );

        if (!response.data || !response.data.access_token) {
            throw new Error('Resposta inválida ao obter token EfiBank');
        }

        return response.data.access_token;
    } catch (error: any) {
        throw new Error(`Erro ao obter token EfiBank: ${error.response?.data || error.message}`);
    }
}

/**
 * Gera um identificador único para transação (txid)
 * @returns {string} - Identificador único
 */
function generateTxid(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Cria uma cobrança no EfiBank usando variáveis de ambiente
 * @param {number} valor - Valor da cobrança
 * @param {string} descricao - Descrição da cobrança
 * @param {number} validadeMinutos - Validade da cobrança em minutos (padrão: 15)
 * @param {string} nomeDevedor - Nome do devedor (opcional, padrão: "Cliente Nebula")
 * @param {string} cpfDevedor - CPF do devedor (opcional, padrão: CPF fictício)
 * @returns {Promise<Object|null>} - Objeto com informações da cobrança
 */
export async function criarCobrancaEfiBank(
    valor: number,
    descricao: string,
    validadeMinutos: number = 15,
    nomeDevedor: string = "Cliente Nebula",
    cpfDevedor: string = "33877493840"
): Promise<{
    txid: string;
    qrCodeBase64: string;
    pixCopiaECola: string;
    loc: string;
} | null> {
    try {
        const accessToken = await getEfiAccessToken();
        
        const pixKey = process.env.EFI_PIX;
        
        if (!pixKey) {
            throw new Error('Chave PIX do EfiBank não configurada');
        }

        // Criar agente HTTPS com certificados das variáveis de ambiente
        const httpsAgent = createHttpsAgent();

        // Gerar identificador único para a transação (txid)
        const txid = generateTxid();
        
        // Configurar dados da cobrança
        const cobData = {
            calendario: {
                expiracao: validadeMinutos * 60 // Converter minutos para segundos
            },
            devedor: {
                nome: nomeDevedor,
                cpf: cpfDevedor
            },
            valor: {
                original: valor.toFixed(2)
            },
            chave: pixKey,
            solicitacaoPagador: descricao.substring(0, 140), // Limitar a 140 caracteres
            infoAdicionais: [
                {
                    nome: "Pagamento",
                    valor: "Nebula Cloud"
                }
            ]
        };

        // Criar cobrança imediata
        const cobResponse = await axios.put(
            `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
            cobData,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent,
                timeout: 10000, // 10 segundos
            }
        );

        if (!cobResponse.data || !cobResponse.data.txid || !cobResponse.data.loc) {
            throw new Error('Resposta inválida ao criar cobrança EfiBank');
        }

        // Gerar QR Code para a cobrança
        const qrCodeResponse = await axios.get(
            `https://api-pix.gerencianet.com.br/v2/loc/${cobResponse.data.loc.id}/qrcode`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                httpsAgent,
                timeout: 10000, // 10 segundos
            }
        );

        if (!qrCodeResponse.data || !qrCodeResponse.data.imagemQrcode) {
            throw new Error('Resposta inválida ao gerar QR Code EfiBank');
        }

        // Usar o QR Code padrão da API
        let qrCodeBase64 = qrCodeResponse.data.imagemQrcode;
        if (!qrCodeBase64.startsWith('data:image/png;base64,')) {
            qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
        }

        return {
            txid: cobResponse.data.txid,
            qrCodeBase64: qrCodeBase64,
            pixCopiaECola: qrCodeResponse.data.qrcode,
            loc: cobResponse.data.loc.id
        };

    } catch (error: any) {
        throw new Error(`Erro ao criar cobrança no EfiBank: ${error.response?.data || error.message}`);
    }
}

/**
 * Consulta o status de uma cobrança no EfiBank usando variáveis de ambiente
 * @param {string} txid - ID da transação
 * @returns {Promise<string|null>} - Status da cobrança
 */
export async function consultarStatusCobranca(txid: string): Promise<string | null> {
    try {
        const accessToken = await getEfiAccessToken();

        // Criar agente HTTPS com certificados das variáveis de ambiente
        const httpsAgent = createHttpsAgent();

        // Consultar cobrança
        const response = await axios.get(
            `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                httpsAgent,
                timeout: 10000,
            }
        );

        if (!response.data || !response.data.status) {
            return null;
        }

        return response.data.status;
    } catch (error: any) {
        return null;
    }
}

/**
 * Obtém informações completas de uma cobrança incluindo QR Code usando variáveis de ambiente
 * @param {string} txid - ID da transação
 * @returns {Promise<Object|null>} - Dados completos da cobrança com QR Code
 */
export async function obterCobranca(txid: string): Promise<any> {
    try {
        const accessToken = await getEfiAccessToken();

        // Criar agente HTTPS com certificados das variáveis de ambiente
        const httpsAgent = createHttpsAgent();

        // Consultar cobrança
        const response = await axios.get(
            `https://api-pix.gerencianet.com.br/v2/cob/${txid}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                httpsAgent,
                timeout: 10000, // 10 segundos
            }
        );

        const cobrancaData = response.data;

        // Se a cobrança tem um loc.id, obter o QR Code
        if (cobrancaData && cobrancaData.loc && cobrancaData.loc.id) {
            try {
                const qrCodeResponse = await axios.get(
                    `https://api-pix.gerencianet.com.br/v2/loc/${cobrancaData.loc.id}/qrcode`,
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        httpsAgent,
                        timeout: 10000, // 10 segundos
                    }
                );

                if (qrCodeResponse.data && qrCodeResponse.data.imagemQrcode) {
                    // Usar o QR Code padrão da API
                    let qrCodeBase64 = qrCodeResponse.data.imagemQrcode;
                    if (!qrCodeBase64.startsWith('data:image/png;base64,')) {
                        qrCodeBase64 = `data:image/png;base64,${qrCodeBase64}`;
                    }
                    
                    // Adicionar o QR Code aos dados da cobrança
                    cobrancaData.qrCodeImage = qrCodeBase64;
                }
            } catch (qrError: any) {
                // QR Code error - não é crítico
            }
        }

        return cobrancaData;
    } catch (error: any) {
        return null;
    }
}

/**
 * Consulta o saldo disponível na conta EfiBank usando variáveis de ambiente
 * @param {boolean} bloqueios - Se deve incluir saldos bloqueados (padrão: false)
 * @returns {Promise<Object|null>} - Objeto com informações do saldo
 */
export async function consultarSaldoEfiBank(bloqueios: boolean = false): Promise<any> {
    try {
        const accessToken = await getEfiAccessToken();

        // Criar agente HTTPS com certificados das variáveis de ambiente
        const httpsAgent = createHttpsAgent();

        // Fazer requisição para consultar saldo
        const response = await axios.get(
            `https://pix.api.efipay.com.br/v2/gn/saldo?bloqueios=${bloqueios}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent,
                timeout: 10000, // 10 segundos
            }
        );

        if (!response.data) {
            return null;
        }

        return response.data;
    } catch (error: any) {
        return null;
    }
}