// 校园招聘职位 API - 兼容 Edge Runtime
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    // 使用环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: '环境变量配置错误'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 构建查询参数
    const queryParams = new URLSearchParams({
      select: '*',
      status: 'eq.active',
      job_category: 'eq.campus' // 筛选校园招聘职位
    });

    // 添加筛选条件
    if (department && department !== 'all') {
      queryParams.append('department', `eq.${department}`);
    }
    if (location && location !== 'all') {
      queryParams.append('location', `eq.${location}`);
    }
    if (search) {
      queryParams.append('or', `title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 调用 Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/jobs?${queryParams}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('查询校园招聘职位失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '查询校园招聘职位失败'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const jobs = await response.json();

    return new Response(JSON.stringify({
      success: true,
      jobs: jobs,
      count: jobs.length,
      message: `获取到 ${jobs.length} 个校园招聘职位`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('校园招聘职位 API 错误:', error);
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

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
