export const config = {
  matcher: ['/'], // Só roda na home, não mexe nas suas APIs
};

export default function middleware(req) {
  const ua = req.headers.get('user-agent') || '';
  const country = req.headers.get('x-vercel-ip-country') || 'BR';

  const isFacebookBot = /facebookexternalhit|facebot|FB_IAB|FBAN|FBAV/i.test(ua);

  // Se for bot ou fora do Brasil, mostra o chinelo.html
  if (country !== 'BR' || isFacebookBot) {
    const url = req.nextUrl ? req.nextUrl.clone() : new URL(req.url);
    url.pathname = '/chinelo.html';
    return Response.rewrite ? Response.rewrite(url) : fetch(url);
  }

  // Deixa passar para o index.html original
  return;
}
