// 原生 Cloudflare Pages Function - 职位查询
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fields = url.searchParams.get('fields') || '*';

    // 使用环境变量
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: '环境变量配置错误'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 直接调用 Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?status=eq.active&select=${fields}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('查询职位失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '查询职位失败'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const jobs = await response.json();

    return new Response(JSON.stringify({
      success: true,
      data: jobs,
      message: 'Cloudflare Pages Functions 工作正常！'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
