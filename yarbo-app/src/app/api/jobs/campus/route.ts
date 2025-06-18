import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误',
        details: 'Supabase 配置缺失'
      }, { status: 500 });
    }

    // 构建查询 - 根据标题筛选校园招聘
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .or('title.ilike.%校园%,title.ilike.%应届%,title.ilike.%校招%,title.ilike.%2025届%')
      .order('created_at', { ascending: false })
      .limit(50);

    // 添加筛选条件
    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    if (location && location !== 'all') {
      query = query.eq('location', location);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Supabase 查询失败:', error);
      return NextResponse.json({
        success: false,
        error: '查询校园招聘职位失败',
        details: error.message
      }, { status: 500 });
    }

    // 处理职位数据
    const processedJobs = (jobs || []).map(job => ({
      ...job,
      requirements: Array.isArray(job.requirements) ? job.requirements : 
        (job.requirements ? [job.requirements] : ['待补充']),
      benefits: Array.isArray(job.benefits) ? job.benefits : 
        (job.benefits ? [job.benefits] : ['待补充']),
      salary_display: job.salary_display || '面议',
      campus_specific: true
    }));

    return NextResponse.json({
      success: true,
      jobs: processedJobs,
      count: processedJobs.length,
      message: '校园招聘职位获取成功',
      filters: { department, location, search }
    });

  } catch (error) {
    console.error('Campus Jobs API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 