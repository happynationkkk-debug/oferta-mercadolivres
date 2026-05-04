export const config = {
    matcher: ['/'], // Só roda na home, não mexe nas suas APIs
};

export default function middleware(req) {
    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const url = req.nextUrl ? req.nextUrl.clone() : new URL(req.url);

    // 1. CORREÇÃO: Removemos FB_IAB, FBAN e FBAV daqui. 
    // Agora bloqueia APENAS os robôs reais do Facebook e ferramentas de espionagem.
    const isFacebookBot = /facebookexternalhit|facebot|meta-externalads/i.test(ua);

    // 2. Verifica se a URL tem a assinatura de clique do Facebook (fbclid)
    const hasFbclid = url.searchParams.has('fbclid');

    // 3. A Lógica de Bloqueio:
    if (country !== 'BR' || isFacebookBot || !hasFbclid) {
        url.pathname = '/chinelo.html';
        return Response.rewrite ? Response.rewrite(url) : fetch(url);
    }

    // Passaporte liberado para clientes reais (inclusive os que usam o app do Facebook!)
    return;
}
