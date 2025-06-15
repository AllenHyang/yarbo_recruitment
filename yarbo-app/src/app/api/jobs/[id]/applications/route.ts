import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireHROrAdmin } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限 - 只有HR和管理员可以查看申请
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: '缺少职位ID' },
        { status: 400 }
      );
    }

    // 获取该职位的申请列表
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        applicants (
          id,
          name,
          email,
          phone
        ),
        resumes (
          id,
          filename,
          file_path
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('获取申请列表失败:', error);
      return NextResponse.json(
        { error: '获取申请列表失败', details: error.message },
        { status: 500 }
      );
    }

    // 获取申请统计
    const { count: totalCount, error: countError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    if (countError) {
      console.error('获取申请数量失败:', countError);
    }

    return NextResponse.json({
      success: true,
      applications: applications || [],
      count: totalCount || 0,
      jobId
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
