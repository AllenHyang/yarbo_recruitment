import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: '缺少职位ID' },
        { status: 400 }
      );
    }

    // 获取职位详情，包括新增的分类字段
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        job_category,
        graduation_year,
        is_featured,
        campus_specific,
        internship_duration,
        internship_type,
        start_date,
        stipend_amount,
        stipend_period,
        skills_gained,
        is_remote_internship,
        expires_at
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('获取职位详情失败:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '职位不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: '获取职位详情失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ...job
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
