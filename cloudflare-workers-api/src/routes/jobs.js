/**
 * 职位 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleJobsAPI(request, env, path, method) {
  if (method === 'GET') {
    try {
      const url = new URL(request.url);
      const fields = url.searchParams.get('fields') || '*';
      const limit = url.searchParams.get('limit') || '50';
      const offset = url.searchParams.get('offset') || '0';

      // 验证环境变量
      if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.***REMOVED***) {
        return new Response(JSON.stringify({
          success: false,
          error: '环境变量配置错误',
          details: 'Supabase 配置缺失'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 构建 Supabase 查询 URL
      const supabaseUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/jobs`;
      const queryParams = new URLSearchParams({
        select: fields,
        status: 'eq.active',
        limit: limit,
        offset: offset
      });

      // 调用 Supabase REST API
      const response = await fetch(`${supabaseUrl}?${queryParams}`, {
        headers: {
          'apikey': env.***REMOVED***,
          'Authorization': `Bearer ${env.***REMOVED***}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Supabase 查询失败:', response.statusText);
        return new Response(JSON.stringify({
          success: false,
          error: '查询职位失败',
          details: response.statusText
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const jobs = await response.json();

      return new Response(JSON.stringify({
        success: true,
        data: jobs,
        count: jobs.length,
        message: '✅ Cloudflare Workers API 工作正常！',
        runtime: 'Cloudflare Workers - 原生实现'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Jobs API 错误:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '服务器内部错误',
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
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
