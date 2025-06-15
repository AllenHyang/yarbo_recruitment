// 原生 Cloudflare Pages Function - 测试端点
export async function onRequestGet(context: any) {
  const { env } = context;
  
  return new Response(JSON.stringify({
    success: true,
    message: '🎉 Cloudflare Pages Functions 测试成功！',
    timestamp: new Date().toISOString(),
    environment: {
      supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置',
      serviceKey: env.***REMOVED*** ? '✅ 已配置' : '❌ 未配置',
      appUrl: env.NEXT_PUBLIC_APP_URL || 'http://localhost:8788'
    },
    cloudflare: {
      runtime: 'Cloudflare Pages Functions',
      location: 'Edge Network'
    }
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
