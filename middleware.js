export const config = {
    matcher: ['/'], 
};

export default function middleware(req) {
    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const url = req.nextUrl ? req.nextUrl.clone() : new URL(req.url);

    // 1. Barrar robôs conhecidos (incluindo o HeadlessChrome que você achou)
    const isBot = /facebookexternalhit|facebot|meta-externalads|HeadlessChrome/i.test(ua);

    // 2. EXCLUSIVO PARA SMARTPHONES: Verifica se o acesso é de um dispositivo móvel
    // Procura por "Mobile", "iPhone" ou "Android" na identidade do dispositivo.
    const isMobile = /Mobile|iPhone|Android/i.test(ua);

    // 3. Verifica a assinatura do Facebook
    const hasFbclid = url.searchParams.has('fbclid');

    // 4. A Lógica de Bloqueio Suprema:
    // Se for gringo, OU for robô, OU NÃO tiver a assinatura do face, OU NÃO for celular -> CHINELO!
    if (country !== 'BR' || isBot || !hasFbclid || !isMobile) {
        url.pathname = '/chinelo.html';
        return Response.rewrite ? Response.rewrite(url) : fetch(url);
    }

    // Passaporte liberado APENAS para: Brasileiros + Celular + Clicou no Anúncio + Humanos.
    return;
}
