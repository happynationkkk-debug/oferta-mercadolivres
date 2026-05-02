import { NextResponse } from 'next/server';

export default function middleware(req) {
  const ua = req.headers.get('user-agent') || '';
  const country = req.geo?.country || 'BR';

  // Se for robô da Meta ou fora do BR
  if (country !== 'BR' || /facebookexternalhit|facebot/i.test(ua)) {
    return NextResponse.rewrite(new URL('/chinelo.html', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/',
};
