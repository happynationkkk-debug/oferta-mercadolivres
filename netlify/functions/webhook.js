exports.handler = async function(event, context) {
    console.log("=== WEBHOOK MISTICPAY RECEBIDO ===");

    // 1. Libera a porta apenas para requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'Método ignorado' };
    }

    try {
        // 2. Recebe e decodifica o JSON oficial da MisticPay
        const payloadMistic = JSON.parse(event.body);
        console.log("Dados recebidos da MisticPay:", payloadMistic);

        // 3. Verifica se é um SAQUE (RETIRADA). Se for, ignora a loja.
        if (payloadMistic.transactionType === 'RETIRADA') {
            console.log(`Aviso de SAQUE (Retirada) no valor de R$ ${payloadMistic.value} recebido. Ignorando Supabase.`);
            // Retorna 200 OK para a MisticPay saber que você recebeu o aviso do saque
            return { statusCode: 200, body: 'Aviso de saque recebido e ignorado pela loja.' };
        }

        // 4. Se não é saque, verificamos se é a entrada de uma venda (DEPOSITO)
        if (payloadMistic.transactionType === 'DEPOSITO') {
            const idDaTransacao = payloadMistic.transactionId;
            const statusDoPagamento = payloadMistic.status;

            console.log(`Analisando Venda: ID ${idDaTransacao} | Status: ${statusDoPagamento}`);

            // 5. Se o depósito foi pago com sucesso (COMPLETO)
            if (statusDoPagamento === 'COMPLETO') {
                console.log("Pagamento confirmado! Avisando o Supabase...");
                
                const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
                const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

                // O Netlify usa a chave secreta e atualiza o Supabase
                const respostaSupa = await fetch(`${supabaseUrl}/rest/v1/pedidos?transaction_id=eq.PED_${idDaTransacao}`, {
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

        // 6. Avisamos a MisticPay que a mensagem foi recebida e processada
        return { statusCode: 200, body: 'Webhook processado com sucesso' };

    } catch (erro) {
        console.error("Falha na leitura do Webhook:", erro);
        return { statusCode: 500, body: 'Erro interno' };
    }
};
