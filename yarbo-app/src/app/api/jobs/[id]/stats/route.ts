import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireHROrAdmin } from '@/lib/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限 - 只有HR和管理员可以查看统计
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

    // 获取申请总数
    const { count: totalApplications, error: totalError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    if (totalError) {
      console.error('获取申请总数失败:', totalError);
      return NextResponse.json(
        { error: '获取申请统计失败', details: totalError.message },
        { status: 500 }
      );
    }

    // 获取各状态的申请数量
    const { data: statusStats, error: statusError } = await supabase
      .from('applications')
      .select('status')
      .eq('job_id', jobId);

    if (statusError) {
      console.error('获取状态统计失败:', statusError);
      return NextResponse.json(
        { error: '获取状态统计失败', details: statusError.message },
        { status: 500 }
      );
    }

    // 统计各状态数量
    const statusCounts = statusStats?.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      success: true,
      jobId,
      stats: {
        total: totalApplications || 0,
        submitted: statusCounts.submitted || 0,
        reviewing: statusCounts.reviewing || 0,
        interview: statusCounts.interview || 0,
        hired: statusCounts.hired || 0,
        rejected: statusCounts.rejected || 0
      }
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
