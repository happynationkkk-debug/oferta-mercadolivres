export default async function(req, res) {
    // 1. Libera a segurança do navegador (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Responde à "pergunta de segurança" do navegador
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).send('Método não permitido');
    }

    try {
        // ---> A NOVIDADE AQUI: Pegando o User-Agent e o IP de quem acessou! <---
        const userAgent = req.headers['user-agent'] || 'Desconhecido';

        const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co'; 
        // ⚠️ Não esqueça de colocar a sua chave secreta do Supabase aqui!
        const supabaseSecretKey = process.env.SUPABASE_KEY || 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

        const supaReq = await fetch(`${supabaseUrl}/rest/v1/visitas`, {
            method: 'POST',
            headers: {
                'apikey': supabaseSecretKey,
                'Authorization': `Bearer ${supabaseSecretKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                pagina: 'oferta_quente',
                user_agent: userAgent // Enviando a informação para a nova coluna!
            })
        });

        if (!supaReq.ok) {
            const erro = await supaReq.text();
            console.error("Erro ao registrar visita no Supabase:", erro);
            return res.status(500).json({ error: "Falha ao registrar visita" });
        }

        return res.status(200).json({ message: "Visita e User-Agent contabilizados com sucesso!" });

    } catch (erro) {
        console.error("Erro interno no contador:", erro);
        return res.status(500).send('Erro interno');
    }
};
