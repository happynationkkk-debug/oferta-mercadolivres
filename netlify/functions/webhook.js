exports.handler = async function(event, context) {
    console.log("=== WEBHOOK MISTICPAY RECEBIDO ===");

    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'Método ignorado' };
    }

    try {
        const payloadMistic = JSON.parse(event.body);
        console.log("Dados recebidos da MisticPay:", payloadMistic);

        if (payloadMistic.transactionType === 'RETIRADA') {
            console.log(`Aviso de SAQUE (Retirada) no valor de R$ ${payloadMistic.value} recebido. Ignorando Supabase.`);
            return { statusCode: 200, body: 'Aviso de saque ignorado pela loja.' };
        }

        if (payloadMistic.transactionType === 'DEPOSITO') {
            const idDaTransacao = payloadMistic.transactionId;
            const statusDoPagamento = payloadMistic.status;

            console.log(`Analisando Venda: ID ${idDaTransacao} | Status: ${statusDoPagamento}`);

            if (statusDoPagamento === 'COMPLETO') {
                console.log("Pagamento confirmado! Avisando o Supabase...");
                
                const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
                const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

                // CORREÇÃO: Tiramos o PED_ extra daqui. Agora ele procura o ID exato!
                const respostaSupa = await fetch(`${supabaseUrl}/rest/v1/pedidos?transaction_id=eq.${idDaTransacao}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseSecretKey,
                        'Authorization': `Bearer ${supabaseSecretKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({ status: 'APROVADO' })
                });

                if (!respostaSupa.ok) {
                    console.error("Erro ao atualizar o Supabase:", await respostaSupa.text());
                } else {
                    console.log("Supabase atualizado com sucesso! A tela do cliente vai mudar agora.");
                }
            }
        }

        return { statusCode: 200, body: 'Webhook processado com sucesso' };

    } catch (erro) {
        console.error("Falha na leitura do Webhook:", erro);
        return { statusCode: 500, body: 'Erro interno' };
    }
};
