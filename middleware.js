export const config = {
    matcher: ['/(.*)'],
};

export default async function middleware(req) {
    const url = new URL(req.url);
    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const cookies = req.headers.get('cookie') || '';

    // ---> O CORREDOR LIVRE DA API ESTÁ AQUI <---
    if (url.pathname.startsWith('/api/')) {
        return; 
    }

    // Evitar que o script rode em imagens/arquivos e cause loop no chinelo.html
    if (url.pathname === '/chinelo.html' || (url.pathname.includes('.') && !url.pathname.endsWith('.html'))) {
        return; 
    }

    // 0. VERIFICA A PULSEIRA VIP (COOKIE)
    if (cookies.includes('passaporte_liberado=true')) {
        return; 
    }

    // 1. Barrar robôs conhecidos
    const isBot = /facebookexternalhit|facebot|meta-externalads|HeadlessChrome/i.test(ua);

    // 2. Verifica se é celular
    const isMobile = /Mobile|iPhone|Android/i.test(ua);

    // 3. Verifica a assinatura do Facebook
    const hasFbclid = url.searchParams.has('fbclid');

    // ---> A NOVIDADE: VERIFICA O PASSE LIVRE (VIP) <---
    // Checa se o link tem "?vip" ou "&vip" escrito nele
    const isVip = url.searchParams.has('vip');

    // 4. A Lógica de Bloqueio Suprema
    // Só vai mandar pro CHINELO se NÃO for VIP e cair em uma das regras de bloqueio
    if (!isVip && (country !== 'BR' || isBot || !hasFbclid || !isMobile)) {
        url.pathname = '/chinelo.html';
        return fetch(url); 
    }

    // 5. LIBERAÇÃO E CRIAÇÃO DO COOKIE
    // Se chegou aqui (porque é tráfego limpo OU porque é VIP), pega a página e cola o Cookie.
    const respostaOriginal = await fetch(req);
    const novaResposta = new Response(respostaOriginal.body, respostaOriginal);
    
    // Adiciona o cookie válido por 24 horas
    novaResposta.headers.append(
        'Set-Cookie', 
        'passaporte_liberado=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax'
    );

    return novaResposta;
}
