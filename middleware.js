import { NextResponse } from 'next/server';

export const config = {
  matcher: '/',
};

export function middleware(req) {
  const userAgent = req.headers.get('user-agent') || '';
  const country = req.geo?.country || 'BR';

  const isFacebookBot = /facebookexternalhit|Facebot|FB_IAB|FBAN|FBAV/i.test(userAgent);

  // Se for bot da Meta ou fora do Brasil, mostra o blog de chinelo
  if (country !== 'BR' || isFacebookBot) {
    // Certifique-se que o arquivo chinelo.html está na pasta /public
    return NextResponse.rewrite(new URL('/chinelo.html', req.url));
  }

  return NextResponse.next();
}
