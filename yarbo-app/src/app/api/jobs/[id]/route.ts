import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误',
        details: 'Supabase 配置缺失'
      }, { status: 500 });
    }

    // 验证jobId
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: '职位ID不能为空'
      }, { status: 400 });
    }

    // 查询职位详情
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Supabase 查询失败:', error);
      return NextResponse.json({
        success: false,
        error: '职位不存在或已下线',
        details: error.message
      }, { status: 404 });
    }

    if (!job) {
      return NextResponse.json({
        success: false,
        error: '职位不存在或已下线'
      }, { status: 404 });
    }

    // 处理数组字段
    const processedJob = {
      ...job,
      requirements: Array.isArray(job.requirements) ? job.requirements : 
        (job.requirements ? [job.requirements] : ['待补充']),
      benefits: Array.isArray(job.benefits) ? job.benefits : 
        (job.benefits ? [job.benefits] : ['待补充']),
      salary_display: job.salary_display || '面议'
    };

    return NextResponse.json({
      success: true,
      job: processedJob,
      message: '职位详情获取成功'
    });

  } catch (error) {
    console.error('Jobs Detail API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 