export const config = {
  matcher: '/',
};

export default function middleware(req) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent') || '';
  
  // Vercel injeta a geolocalização nos headers ou no objeto req
  const country = req.geo?.country || 'BR';

  const isFacebookBot = /facebookexternalhit|facebot|FB_IAB|FBAN|FBAV/i.test(ua);

  // Se for bot ou fora do Brasil
  if (country !== 'BR' || isFacebookBot) {
    // Reescreve para o arquivo chinelo.html
    url.pathname = '/chinelo.html';
    return fetch(url); 
  }

  // Caso contrário, deixa passar para o index.html
  return; 
}
