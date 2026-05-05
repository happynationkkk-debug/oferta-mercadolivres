import { NextResponse } from 'next/server';

export const config = {
    // Atualizei o matcher para proteger o site todo, 
    // ignorando apenas os arquivos de sistema e imagens para não pesar.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], 
};

export default function middleware(req) {
    const ua = req.headers.get('user-agent') || '';
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const url = req.nextUrl ? req.nextUrl.clone() : new URL(req.url);

    // 0. VERIFICA A PULSEIRA VIP (COOKIE)
    // Se o cliente já passou pela verificação antes, ele tem esse cookie.
    if (req.cookies.has('passaporte_liberado')) {
        return NextResponse.next(); // Deixa o cliente navegar livremente pelo site
    }

    // 1. Barrar robôs conhecidos
    const isBot = /facebookexternalhit|facebot|meta-externalads|HeadlessChrome/i.test(ua);

    // 2. Verifica se é celular
    const isMobile = /Mobile|iPhone|Android/i.test(ua);

    // 3. Verifica a assinatura do Facebook (só é exigida na porta de entrada agora)
    const hasFbclid = url.searchParams.has('fbclid');

    // 4. A Lógica de Bloqueio Suprema
    if (country !== 'BR' || isBot || !hasFbclid || !isMobile) {
        url.pathname = '/chinelo.html';
        return NextResponse.rewrite(url);
    }

    // 5. LIBERAÇÃO E CRIAÇÃO DO COOKIE
    // Se chegou aqui, é o primeiro acesso válido do cliente real vindo do anúncio.
    const response = NextResponse.next();
    
    // Cria o cookie liberando o acesso em todo o site por 24 horas
    response.cookies.set('passaporte_liberado', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas em segundos
        httpOnly: true, // Protege contra scripts maliciosos
        sameSite: 'lax'
    });

    return response;
}
