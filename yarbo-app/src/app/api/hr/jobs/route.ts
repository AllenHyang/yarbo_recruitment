import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireHROrAdmin } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  try {
    // 验证用户权限 - 只有HR和管理员可以查看
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search');

    // 构建查询
    let query = supabase
      .from('jobs')
      .select(`
        id,
        title,
        department,
        location,
        status,
        salary_min,
        salary_max,
        salary_display,
        created_at,
        updated_at,
        description,
        requirements
      `)
      .order('created_at', { ascending: false });

    // 应用筛选条件
    if (status && status !== 'all') {
      if (status === 'published') {
        query = query.in('status', ['active', 'published']);
      } else {
        query = query.eq('status', status);
      }
    }

    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('获取职位列表失败:', error);
      return NextResponse.json(
        { error: '获取职位列表失败', details: error.message },
        { status: 500 }
      );
    }

    // 为每个职位获取申请数量和浏览数量
    const jobsWithStats = await Promise.all(
      (jobs || []).map(async (job) => {
        // 获取申请数量
        const { count: applicationCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id);

        // 获取浏览数量 (如果job_views表不存在，则返回0)
        let viewsCount = 0;
        try {
          const { count } = await supabase
            .from('job_views')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id);
          viewsCount = count || 0;
        } catch (error) {
          // job_views表可能不存在，忽略错误
          viewsCount = 0;
        }

        return {
          ...job,
          application_count: applicationCount || 0,
          views_count: viewsCount,
          // 添加一些计算字段
          priority: job.status === 'draft' ? 3 :
            job.status === 'paused' ? 2 : 1,
          is_remote: job.location?.includes('远程') || false,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30天后过期
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithStats,
      count: jobsWithStats.length
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
