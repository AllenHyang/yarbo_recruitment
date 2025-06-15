// 完全兼容 Edge Runtime 的简化版本
export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({
    success: true,
    message: '🎉 Cloudflare Pages Functions 测试成功！',
    timestamp: new Date().toISOString(),
    runtime: 'Edge Runtime',
    platform: 'Cloudflare Pages'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
