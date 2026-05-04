export default async function(req, res) {
    // 1. Libera a segurança do navegador (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite qualquer origem
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. Responde à "pergunta de segurança" do navegador com sinal verde
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Permite apenas GET ou POST
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).send('Método não permitido');
    }

    try {
        const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co'; 
        // ⚠️ LEMBRE-SE: Nunca deixe sua chave exposta em produção. Use variáveis de ambiente!
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
                pagina: 'oferta_quente'
            })
        });

        if (!supaReq.ok) {
            const erro = await supaReq.text();
            console.error("Erro ao registrar visita no Supabase:", erro);
            return res.status(500).json({ error: "Falha ao registrar visita" });
        }

        return res.status(200).json({ message: "Visita contabilizada com sucesso!" });

    } catch (erro) {
        console.error("Erro interno no contador:", erro);
        return res.status(500).send('Erro interno');
    }
};
