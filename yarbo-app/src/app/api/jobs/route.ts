// 完全兼容 Edge Runtime 的简化版本
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields') || '*';

    // 使用环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.***REMOVED***;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: '环境变量配置错误'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 直接调用 Supabase REST API（兼容边缘环境）
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
      message: '✅ Cloudflare Pages Functions 工作正常！'
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
