export default async function(req, res) {
    // Permite apenas o método POST
    if (req.method !== 'POST') {
        return res.status(405).send('Método não permitido');
    }

    try {
        const supabaseUrl = 'https://rbolfrvtaulvdqajhryd.supabase.co'; 
        // ⚠️ USE VARIÁVEIS DE AMBIENTE AQUI DEPOIS PARA PROTEGER SUA CHAVE!
        const supabaseSecretKey = process.env.SUPABASE_KEY || 'SUA_CHAVE_AQUI';

        // Registra uma nova linha na tabela "visitas"
        const supaReq = await fetch(`${supabaseUrl}/rest/v1/visitas`, {
            method: 'POST',
            headers: {
                'apikey': supabaseSecretKey,
                'Authorization': `Bearer ${supabaseSecretKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                pagina: 'oferta_quente' // Identificador de onde veio o acesso
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
