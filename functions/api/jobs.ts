// Cloudflare Pages Function for jobs API
export async function onRequestGet(context: any) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const fields = url.searchParams.get('fields');

    // 创建 Supabase 客户端
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.***REMOVED***
    );

    // 构建查询
    let query = supabase
      .from('jobs')
      .select(fields || '*')
      .eq('status', 'active');

    const { data: jobs, error } = await query;

    if (error) {
      console.error('查询职位失败:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '查询职位失败'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: jobs
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
