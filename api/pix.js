module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }

    try {
        const bodyObj = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { items, payerName, payerDocument, endereco } = bodyObj;

        const requisicao = await fetch('https://api.misticpay.com/api/transactions/create', {
            method: 'POST',
            headers: {
                'ci': 'ci_6zeltjzmqao9ak9',
                'cs': 'cs_7gw6ztvmm6mvjgv0yxswvm51y',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyObj) 
        });

        // --- AQUI ESTÁ A MUDANÇA PARA PEGAR O ERRO ---
        const textoResposta = await requisicao.text(); // Pega como texto primeiro

        if (!requisicao.ok) {
            console.error("ERRO DA MISTICPAY (TEXTO):", textoResposta);
            return res.status(requisicao.status).json({ 
                error: "Erro na integradora", 
                detalhes: textoResposta 
            });
        }

        // Se chegou aqui e está OK, aí sim tentamos tratar como JSON
        let resposta;
        try {
            resposta = JSON.parse(textoResposta);
        } catch (e) {
            console.error("ERRO AO DAR PARSE NO JSON. Recebido:", textoResposta);
            return res.status(500).send("O servidor enviou um formato inválido.");
        }
        // --------------------------------------------

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
                    client_document: payerDocument,
                    endereco: endereco
                })
            });

            if (!supaReq.ok) {
                const erroRealSupa = await supaReq.text();
                console.error("ERRO GRAVE DO SUPABASE:", erroRealSupa);
            } else {
                console.log("SUCESSO: Linha criada no Supabase!");
            }
        }

        return res.status(200).json(resposta);

    } catch (erro) {
        console.error("Erro interno no Pix Vercel:", erro);
        return res.status(500).json({ message: "Erro de comunicação no servidor seguro." });
    }
};
