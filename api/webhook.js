export default async function handler(req, res) {
    console.log("=== WEBHOOK MISTICPAY RECEBIDO (SISTEMA DE HISTÓRICO - VERCEL) ===");

    // Na Vercel, verificamos o método através do req.method
    if (req.method !== 'POST') {
        return res.status(200).send('Método ignorado');
    }

    try {
        // A Vercel normalmente já converte o JSON automaticamente, mas colocamos uma verificação de segurança
        const payloadMistic = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        console.log("Dados recebidos da MisticPay:", payloadMistic);

        if (payloadMistic.transactionType === 'RETIRADA') {
            return res.status(200).send('Aviso de saque ignorado.');
        }

        if (payloadMistic.transactionType === 'DEPOSITO') {
            const idDaTransacao = payloadMistic.transactionId;
            const statusDoPagamento = payloadMistic.status;

            // Extraímos as novas informações do payload oficial da MisticPay
            const nomePardor = payloadMistic.clientName;
            const documentoPagador = payloadMistic.clientDocument;
            const valorPago = payloadMistic.value;

            if (statusDoPagamento === 'COMPLETO') {
                console.log(`Aprovando Pedido ${idDaTransacao} para o CPF ${documentoPagador}...`);
                
                const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
                const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

                // Atualizamos o status E salvamos os dados do cliente para consulta futura
                const respostaSupa = await fetch(`${supabaseUrl}/rest/v1/pedidos?transaction_id=eq.${idDaTransacao}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseSecretKey,
                        'Authorization': `Bearer ${supabaseSecretKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ 
                        status: 'APROVADO',
                        client_name: nomePardor,
                        client_document: documentoPagador,
                        value: valorPago
                    })
                });

                if (!respostaSupa.ok) {
                    console.error("Erro ao atualizar histórico no Supabase:", await respostaSupa.text());
                } else {
                    console.log("Histórico de venda salvo com sucesso!");
                }
            }
        }

        // Resposta de sucesso no formato Vercel
        return res.status(200).send('Webhook processado com sucesso');

    } catch (erro) {
        console.error("Falha no processamento do histórico:", erro);
        return res.status(500).send('Erro interno');
    }
}
