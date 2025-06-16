/**
 * 测试 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleTestAPI(request, env, path, method) {
  if (method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      message: '🎉 Cloudflare Workers API 测试成功！',
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置',
        serviceKey: env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已配置' : '❌ 未配置',
        environment: env.ENVIRONMENT || 'development'
      },
      runtime: {
        platform: 'Cloudflare Workers',
        version: '1.0.0',
        compatibility: '完全原生，无 async_hooks 依赖'
      },
      features: [
        '✅ 完全兼容 Edge Runtime',
        '✅ 无 Node.js 依赖',
        '✅ 高性能边缘计算',
        '✅ 全球分布式部署'
      ]
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  return new Response(JSON.stringify({
    success: false,
    error: '方法不支持'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
