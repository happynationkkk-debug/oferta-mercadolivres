export default async function(req, res) {
    // Libera a segurança do navegador (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }

    try {
        // Pegando os dados enviados pelo site (Frontend)
        const body = req.body || {};
        const evento = body.evento || 'page_view';
        const detalhes = body.detalhes || {};
        const sessionId = body.session_id || 'anonimo';

        // Capturando User-Agent e o IP real do cliente (Vercel manda no x-forwarded-for)
        const userAgent = req.headers['user-agent'] || 'Desconhecido';
        const ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'IP Desconhecido';

        const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co';
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
                evento: evento,             // Ex: 'adicionou_carrinho', 'gerou_pix'
                session_id: sessionId,      // Código único daquele cliente
                detalhes: detalhes,         // Infos extras (valor, produto, etc) em formato JSONB
                user_agent: userAgent,
                ip_cliente: ipCliente
            })
        });

        if (!supaReq.ok) {
            const erro = await supaReq.text();
            console.error("Erro ao registrar evento no Supabase:", erro);
            return res.status(500).json({ error: "Falha ao registrar evento" });
        }

        return res.status(200).json({ message: "Evento rastreado com sucesso!" });

    } catch (erro) {
        console.error("Erro interno no rastreador:", erro);
        return res.status(500).send('Erro interno');
    }
};
