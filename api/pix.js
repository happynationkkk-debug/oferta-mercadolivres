module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }

    try {
        const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { items, payerName, payerDocument } = bodyObj;

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

        if (resposta && resposta.data && resposta.data.transactionId) {
            const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
            const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY'; 

            let produtosJson = null;
            if (items) {
                if (typeof items === 'string') {
                    try {
                        produtosJson = JSON.parse(items);
                    } catch (err) {
                        produtosJson = [{ titulo: items, quantidade: 1 }]; 
                    }
                } else {
                    produtosJson = items;
                }
            }

            // NOVA PARTE: O VIGIA DO SUPABASE
            const supaReq = await fetch(`${supabaseUrl}/rest/v1/pedidos`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseSecretKey,
                    'Authorization': `Bearer ${supabaseSecretKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    transaction_id: String(resposta.data.transactionId),
                    status: 'AGUARDANDO',
                    produtos: produtosJson,
                    client_name: payerName,
                    client_document: payerDocument
                })
            });

            // Se o Supabase rejeitar, ele vai cuspir o erro real no log da Vercel!
            if (!supaReq.ok) {
                const erroRealSupa = await supaReq.text();
                console.error("ERRO GRAVE DO SUPABASE:", erroRealSupa);
            } else {
                console.log("SUCESSO: Linha criada no Supabase antes do pagamento!");
            }
        }

        return res.status(200).json(resposta);

    } catch (erro) {
        console.error("Erro interno no Pix Vercel:", erro);
        return res.status(500).json({ message: "Erro de comunicação no servidor seguro." });
    }
};
