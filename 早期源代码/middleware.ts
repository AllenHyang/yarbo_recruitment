import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路径 - 不需要认证
const publicPaths = [
  '/',
  '/jobs',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/about',
  '/contact',
  '/api/auth/callback'
];

// 动态路径匹配
const publicPatterns = [
  /^\/jobs\/[^\/]+$/, // /jobs/[id]
  /^\/api\//, // API路由
  /^\/_next\//, // Next.js 静态资源
  /^\/favicon\.ico$/, // favicon
  /^\/.*\.(png|jpg|jpeg|gif|svg|ico|css|js)$/ // 静态资源
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 检查是否为公开路径
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 临时禁用严格的中间件检查，让客户端组件处理权限
  console.log(`[Middleware] 临时允许访问: ${pathname}`);
  return NextResponse.next();
}

// 检查是否为公开路径
function isPublicPath(pathname: string): boolean {
  // 检查精确匹配
  if (publicPaths.includes(pathname)) {
    return true;
  }

  // 检查模式匹配
  return publicPatterns.some(pattern => pattern.test(pathname));
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
