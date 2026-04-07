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
            // Se vier texto antigo ou erro de cache, ele não quebra o servidor!
            let produtosJson = null;
            if (items) {
                if (typeof items === 'string') {
                    try {
                        produtosJson = JSON.parse(items); // Tenta ler como JSON
                    } catch (err) {
                        // Se for texto normal, forçamos virar um JSON válido pro Supabase aceitar
                        produtosJson = [{ titulo: items, quantidade: 1 }]; 
                    }
                } else {
                    produtosJson = items; // Já é objeto
                }
            }
        // Devolve a resposta (QR Code) para o nosso frontend usando o padrão da Vercel
        return res.status(200).json(resposta);

    } catch (erro) {
        console.error("Erro interno no Pix Vercel:", erro);
        return res.status(500).json({ message: "Erro de comunicação no servidor seguro." });
    }
}
