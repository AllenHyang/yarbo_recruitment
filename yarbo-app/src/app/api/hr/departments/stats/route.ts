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

    // 并行获取各种统计数据
    const [
      totalDepartmentsResult,
      activeDepartmentsResult,
      totalJobsResult,
      totalEmployeesResult
    ] = await Promise.all([
      // 总部门数
      supabase
        .from('departments')
        .select('*', { count: 'exact', head: true }),

      // 活跃部门数（有职位的部门）
      supabase
        .from('departments')
        .select(`
          id,
          jobs!inner(id)
        `, { count: 'exact', head: true }),

      // 总职位数
      supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true }),

      // 总员工数
      supabase
        .from('hr_departments')
        .select('*', { count: 'exact', head: true })
    ]);

    // 获取部门职位分布
    const { data: departmentJobStats } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        jobs(id)
      `);

    // 计算部门职位分布
    const departmentDistribution = departmentJobStats?.map(dept => ({
      department: dept.name,
      jobs_count: dept.jobs?.length || 0
    })) || [];

    // 获取最近创建的部门
    const { data: recentDepartments } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const stats = {
      totalDepartments: totalDepartmentsResult.count || 0,
      activeDepartments: activeDepartmentsResult.count || 0,
      totalJobs: totalJobsResult.count || 0,
      totalEmployees: totalEmployeesResult.count || 0,
      departmentDistribution,
      recentDepartments: recentDepartments || []
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
