exports.handler = async function(event, context) {
    // O Webhook da MisticPay vai enviar um POST para esta rota
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        const dadosMistic = JSON.parse(event.body);
        
        // Extraímos o ID da transação e o estado enviados pela MisticPay
        // (Nota: ajustado para cobrir as variações comuns de envio da API deles)
        const transactionId = dadosMistic.transactionId || dadosMistic.id; 
        const statusPagamento = dadosMistic.transactionState || dadosMistic.status;

        // Se o estado indicar que o pagamento foi concluído com sucesso
        if (statusPagamento === 'COMPLETO' || statusPagamento === 'PAGO') {
            
            const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
            const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

            // Vamos ao Supabase procurar a linha que tem este transaction_id e alterar para APROVADO
            await fetch(`${supabaseUrl}/rest/v1/pedidos?transaction_id=eq.${transactionId}`, {
                method: 'PATCH',
                headers: {
                    'apikey': supabaseSecretKey,
                    'Authorization': `Bearer ${supabaseSecretKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ status: 'APROVADO' })
            });
        }

        // A MisticPay exige que respondamos com 200 OK rapidamente para confirmar a receção
        return { statusCode: 200, body: 'Webhook processado com sucesso' };
        
    } catch (erro) {
        console.error("Erro no processamento do webhook:", erro);
        return { statusCode: 500, body: 'Erro interno no servidor' };
    }
};