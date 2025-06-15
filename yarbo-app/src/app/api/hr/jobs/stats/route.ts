import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireHROrAdmin } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限 - 只有HR和管理员可以查看统计
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // 并行获取各种统计数据
    const [
      totalJobsResult,
      publishedJobsResult,
      draftJobsResult,
      pausedJobsResult,
      closedJobsResult,
      totalApplicationsResult,
      totalViewsResult
    ] = await Promise.all([
      // 总职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true }),

      // 已发布职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'published']),

      // 草稿职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft'),

      // 暂停职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paused'),

      // 关闭职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'closed'),

      // 总申请数
      supabase
        .from('applications')
        .select('*', { count: 'exact', head: true }),

      // 总浏览数 (从job_views表获取，如果没有则返回0)
      supabase
        .from('job_views')
        .select('*', { count: 'exact', head: true })
    ]);

    // 检查是否有错误
    const errors = [
      totalJobsResult.error,
      publishedJobsResult.error,
      draftJobsResult.error,
      pausedJobsResult.error,
      closedJobsResult.error,
      totalApplicationsResult.error,
      totalViewsResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error('获取统计数据时出错:', errors);
      return NextResponse.json(
        { error: '获取统计数据失败', details: errors },
        { status: 500 }
      );
    }

    const stats = {
      totalJobs: totalJobsResult.count || 0,
      publishedJobs: publishedJobsResult.count || 0,
      draftJobs: draftJobsResult.count || 0,
      pausedJobs: pausedJobsResult.count || 0,
      closedJobs: closedJobsResult.count || 0,
      totalApplications: totalApplicationsResult.count || 0,
      totalViews: totalViewsResult.count || 0
    };

    return NextResponse.json({
      success: true,
      stats
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
