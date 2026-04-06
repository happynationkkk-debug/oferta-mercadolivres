exports.handler = async function(event, context) {
    console.log("=== WEBHOOK MISTICPAY RECEBIDO (SISTEMA DE HISTÓRICO) ===");

    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'Método ignorado' };
    }

    try {
        const payloadMistic = JSON.parse(event.body);
        console.log("Dados recebidos da MisticPay:", payloadMistic);

        if (payloadMistic.transactionType === 'RETIRADA') {
            return { statusCode: 200, body: 'Aviso de saque ignorado.' };
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

        return { statusCode: 200, body: 'Webhook processado com sucesso' };

    } catch (erro) {
        console.error("Falha no processamento do histórico:", erro);
        return { statusCode: 500, body: 'Erro interno' };
    }
};
