export default async function handler(req, res) {
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
        // Pega os dados enviados pelo front-end (chinelo.html)
        const corpo = req.body || {};
        
        // Mantém o disfarce: se não vier nome, salva como 'index'
        const paginaDisfarcada = corpo.pagina || 'index'; 

        // Pega o User-Agent do corpo ou do cabeçalho como garantia
        const userAgent = corpo.user_agent || req.headers['user-agent'] || 'Desconhecido';

        const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co'; 
        
        // Sua chave fixa conforme você pediu
        const supabaseSecretKey = 'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';

        // ⚠️ ATENÇÃO: Aqui está enviando para a tabela "visitas". 
        // Se você criou uma tabela separada para os barrados no Supabase (ex: acessos_barrados), mude a palavra "visitas" abaixo.
        const supaReq = await fetch(`${supabaseUrl}/rest/v1/visitas`, {
            method: 'POST',
            headers: {
                'apikey': supabaseSecretKey,
                'Authorization': `Bearer ${supabaseSecretKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                pagina: paginaDisfarcada, // Vai salvar no banco como 'index'
                user_agent: userAgent
            })
        });

        if (!supaReq.ok) {
            const erro = await supaReq.text();
            console.error("Erro ao registrar acesso barrado no Supabase:", erro);
            return res.status(500).json({ error: "Falha ao registrar" });
        }

        return res.status(200).json({ message: "Acesso registrado de forma oculta com sucesso!" });

    } catch (erro) {
        console.error("Erro interno no contador:", erro);
        return res.status(500).send('Erro interno');
    }
}
