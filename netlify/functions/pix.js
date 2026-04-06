exports.handler = async function(event, context) {
    // Permite apenas requisições POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        // O Netlify faz a chamada à MisticPay de forma oculta
        const requisicao = await fetch('https://api.misticpay.com/api/transactions/create', {
            method: 'POST',
            headers: {
                'ci': 'ci_6zeltjzmqao9ak9',
                'cs': 'cs_7gw6ztvmm6mvjgv0yxswvm51y',
                'Content-Type': 'application/json'
            },
            body: event.body // Repassa os dados do cliente (Nome, CPF, Valor)
        });

        const resposta = await requisicao.json();

        // NOVA PARTE: Salva o pedido no banco de dados Supabase como "AGUARDANDO"
        if (resposta && resposta.data && resposta.data.transactionId) {
            const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
            const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY'; 

            await fetch(`${supabaseUrl}/rest/v1/pedidos`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseSecretKey,
                    'Authorization': `Bearer ${supabaseSecretKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    transaction_id: String(resposta.data.transactionId),
                    status: 'AGUARDANDO'
                })
            }).catch(err => console.error("Aviso: Falha ao salvar no Supabase:", err));
        }

        // Devolve a resposta (QR Code) para o nosso frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resposta)
        };

    } catch (erro) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Erro de comunicação no servidor seguro." })
        };
    }
};
