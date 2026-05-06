import { createClient } from '@supabase/supabase-js';

// Conecta ao seu Supabase usando as variáveis de ambiente da Vercel
const supabaseUrl = process.env.'https://rbolfrvtaulvdqajhryd.supabase.co';
const supabaseKey = process.env.'sb_secret_-0MxutxgZw5kZBmNUd9b0w_5BJfkxoY';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    // Só aceita requisições POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Pega os dados enviados pelo script do chinelo.html
    const { pagina, user_agent } = req.body;
    
    // Tentativa extra de pegar o User-Agent pelo cabeçalho (útil contra alguns bots)
    const agenteFinal = user_agent || req.headers['user-agent'] || 'Desconhecido';

    try {
        // ATENÇÃO: Mude 'acessos_barrados' para o nome exato da sua nova tabela no Supabase
        const { data, error } = await supabase
            .from('acessos_barrados') 
            .insert([
                {
                    pagina: pagina || 'chinelo',
                    user_agent: agenteFinal
                }
            ]);

        if (error) {
            throw error;
        }

        return res.status(200).json({ message: 'Acesso barrado salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
        return res.status(500).json({ error: 'Erro interno ao salvar.' });
    }
}
