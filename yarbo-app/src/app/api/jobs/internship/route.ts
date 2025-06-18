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
    const duration = searchParams.get('duration');

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误',
        details: 'Supabase 配置缺失'
      }, { status: 500 });
    }

    // 构建查询 - 根据标题筛选实习职位
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .ilike('title', '%实习%')
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
        error: '查询实习职位失败',
        details: error.message
      }, { status: 500 });
    }

    // 处理职位数据 - 添加实习特有信息
    const processedJobs = (jobs || []).map(job => ({
      ...job,
      requirements: Array.isArray(job.requirements) ? job.requirements : 
        (job.requirements ? [job.requirements] : ['待补充']),
      benefits: Array.isArray(job.benefits) ? job.benefits : 
        (job.benefits ? [job.benefits] : ['待补充']),
      salary_display: job.salary_display || '面议',
      internship_duration: job.internship_duration || '3-6个月',
      mentor_available: job.mentor_available || true,
      skills_development: job.skills_development || ['专业技能提升', '团队协作', '项目经验']
    }));

    return NextResponse.json({
      success: true,
      jobs: processedJobs,
      count: processedJobs.length,
      message: '实习职位获取成功',
      filters: { department, location, search, duration }
    });

  } catch (error) {
    console.error('Internship Jobs API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 