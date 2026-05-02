import { NextResponse } from 'next/server'

export function middleware(request) {
  const url = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  
  // Vercel detecta o país automaticamente pelo cabeçalho
  const country = request.geo?.country || 'BR'
  
  // Lista de robôs conhecidos da Meta/Facebook
  const isFacebookBot = userAgent.includes('facebookexternalhit') || 
                        userAgent.includes('Facebot') || 
                        userAgent.includes('FB_IAB') ||
                        userAgent.includes('FBAN') ||
                        userAgent.includes('FBAV');

  // Lógica: Se NÃO for do Brasil OU for Robô da Meta, mostra o blog de chinelo
  if (country !== 'BR' || isFacebookBot) {
    // IMPORTANTE: O arquivo chinelo.html deve estar na pasta /public
    return NextResponse.rewrite(new URL('/chinelo.html', request.url))
  }

  return NextResponse.next()
}

// Faz o middleware rodar apenas na página inicial (ou em todas, se preferir)
export const config = {
  matcher: '/',
}
