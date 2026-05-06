export const config = {
    matcher: ['/(.*)'],
};

export default async function middleware(req) {
    const url = new URL(req.url);
    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const cookies = req.headers.get('cookie') || '';

    // ---> O CORREDOR LIVRE DA API ESTÁ AQUI <---
    // Isso garante que o cloaker não bloqueie o envio de dados para o Supabase
    if (url.pathname.startsWith('/api/')) {
        return; 
    }

    // Evitar que o script rode em imagens/arquivos e cause loop no chinelo.html
    if (url.pathname === '/chinelo.html' || (url.pathname.includes('.') && !url.pathname.endsWith('.html'))) {
        return; 
    }

    // 0. VERIFICA A PULSEIRA VIP (COOKIE)
    // Se o cliente já tem o cookie, retornamos vazio para o Vercel deixar ele navegar livremente
    if (cookies.includes('passaporte_liberado=true')) {
        return; 
    }

    // 1. Barrar robôs conhecidos
    const isBot = /facebookexternalhit|facebot|meta-externalads|HeadlessChrome/i.test(ua);

    // 2. Verifica se é celular
    const isMobile = /Mobile|iPhone|Android/i.test(ua);

    // 3. Verifica a assinatura do Facebook
    const hasFbclid = url.searchParams.has('fbclid');

    // 4. A Lógica de Bloqueio Suprema
    // Se for gringo, robô, sem fbclid ou não for celular -> CHINELO!
    if (country !== 'BR' || isBot || !hasFbclid || !isMobile) {
        url.pathname = '/chinelo.html';
        return fetch(url); // Isso faz o redirecionamento invisível (rewrite) no Vercel puro
    }

    // 5. LIBERAÇÃO E CRIAÇÃO DO COOKIE
    // Se chegou aqui, passou no teste. Vamos buscar a página que ele pediu e colar o Cookie nela.
    const respostaOriginal = await fetch(req);
    const novaResposta = new Response(respostaOriginal.body, respostaOriginal);
    
    // Adiciona o cookie "passaporte_liberado" válido por 24 horas (86400 segundos)
    novaResposta.headers.append(
        'Set-Cookie', 
        'passaporte_liberado=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax'
    );

    return novaResposta;
}
