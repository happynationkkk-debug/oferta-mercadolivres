exports.handler = async function(event, context) {
    console.log("=== WEBHOOK MISTICPAY RECEBIDO ===");

    // 1. Libera a porta para a MisticPay entrar (ela só manda POST)
    if (event.httpMethod !== 'POST') {
        return { statusCode: 200, body: 'Método ignorado' };
    }

    try {
        // 2. Recebe o JSON puro da MisticPay
        const payloadMistic = JSON.parse(event.body);
        console.log("Dados recebidos da MisticPay:", payloadMistic);

        // 3. Lê as variáveis exatas que a MisticPay manda
        const idDaTransacao = payloadMistic.transactionId;
        const statusDoPagamento = payloadMistic.status;

        console.log(`Transação: ${idDaTransacao} | Status: ${statusDoPagamento}`);

        // 4. Se o status for "COMPLETO", avisamos o Supabase
        if (statusDoPagamento === 'COMPLETO') {
            console.log("Pagamento confirmado! Atualizando Supabase...");
            
            const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
            const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

            // O Netlify usa a chave secreta e atualiza o Supabase
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
                console.log("Supabase atualizado com sucesso para APROVADO!");
            }
        }

        // 5. Avisamos a MisticPay que recebemos o aviso
        return { statusCode: 200, body: 'Mensagem recebida com sucesso' };

    } catch (erro) {
        console.error("Falha na leitura do Webhook:", erro);
        return { statusCode: 500, body: 'Erro interno' };
    }
};
