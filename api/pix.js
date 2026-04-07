export default async function handler(req, res) {
    // Permite apenas requisições POST
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }

    try {
        // A Vercel já converte o body automaticamente, mas usamos um fallback por segurança
        const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { items, payerName, payerDocument } = bodyObj;

        // O fetch para a MisticPay (garantimos que o body seja enviado como string)
        const requisicao = await fetch('https://api.misticpay.com/api/transactions/create', {
            method: 'POST',
            headers: {
                'ci': 'ci_6zeltjzmqao9ak9',
                'cs': 'cs_7gw6ztvmm6mvjgv0yxswvm51y',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyObj) 
        });

        const resposta = await requisicao.json();

        // Salva o pedido no banco de dados Supabase como "AGUARDANDO"
        if (resposta && resposta.data && resposta.data.transactionId) {
            const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
            const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY'; 

            // TRUQUE DE MESTRE: Garante que os itens sejam salvos como um Array JSON limpo 
            // no Supabase, e não como um texto embolado.
            let produtosJson = null;
            if (items) {
                produtosJson = typeof items === 'string' ? JSON.parse(items) : items;
            }

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
                    status: 'AGUARDANDO',
                    produtos: produtosJson, // Salvando o carrinho completo (com foto, preço, etc.)
                    client_name: payerName,
                    client_document: payerDocument
                })
            }).catch(err => console.error("Aviso: Falha ao salvar no Supabase:", err));
        }

        // Devolve a resposta (QR Code) para o nosso frontend usando o padrão da Vercel
        return res.status(200).json(resposta);

    } catch (erro) {
        console.error("Erro interno no Pix Vercel:", erro);
        return res.status(500).json({ message: "Erro de comunicação no servidor seguro." });
    }
}
