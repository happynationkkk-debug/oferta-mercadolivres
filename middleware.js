import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { nextUrl: url, geo, headers } = request
  
  // 1. Identifica o país (Vercel detecta automaticamente)
  const country = geo?.country || 'BR'
  
  // 2. Identifica o User-Agent (Robô da Meta/Facebook)
  const userAgent = headers.get('user-agent') || ''
  const isFacebookBot = userAgent.includes('facebookexternalhit') || userAgent.includes('Facebot')

  // 3. Lógica de Bloqueio: Se NÃO for do Brasil OU for Robô da Meta
  if (country !== 'BR' || isFacebookBot) {
    // Faz o REWRITE para o chinelo.html (o usuário/bot vê o blog, mas a URL não muda)
    return NextResponse.rewrite(new URL('/chinelo.html', request.url))
  }

  // Se for um usuário real do Brasil, segue para a página de vendas original
  return NextResponse.next()
}

// Configura para que o middleware rode em todas as rotas ou na principal
export const config = {
  matcher: '/',
}
