import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireHROrAdmin } from '@/lib/api-auth'

// 创建带有用户认证的Supabase客户端的辅助函数
function createAuthenticatedSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.substring(7); // 移除 "Bearer " 前缀

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.***REMOVED***!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

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

    const supabase = createAuthenticatedSupabaseClient(request);

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('departments')
      .select(`
        id,
        name,
        description,
        color_theme,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // 应用搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('departments')
      .select('*', { count: 'exact', head: true });

    // 应用分页
    query = query.range(offset, offset + limit - 1);

    const { data: departments, error } = await query;

    if (error) {
      console.error('获取部门列表失败:', error);
      return NextResponse.json(
        { error: '获取部门列表失败', details: error.message },
        { status: 500 }
      );
    }

    // 为每个部门获取关联的职位数量和员工数量
    const departmentsWithStats = await Promise.all(
      departments.map(async (department) => {
        // 获取职位数量
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', department.id);

        // 获取员工数量（通过hr_departments表）
        const { count: employeeCount } = await supabase
          .from('hr_departments')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', department.id);

        return {
          ...department,
          jobs_count: jobsCount || 0,
          employee_count: employeeCount || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      departments: departmentsWithStats,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
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

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限 - 只有HR和管理员可以创建
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const supabase = createAuthenticatedSupabaseClient(request);

    const body = await request.json();
    const { name, description, color_theme } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: '部门名称不能为空' },
        { status: 400 }
      );
    }

    // 检查部门名称是否已存在
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .single();

    if (existingDepartment) {
      return NextResponse.json(
        { error: '部门名称已存在' },
        { status: 400 }
      );
    }

    // 创建部门
    const { data: department, error } = await supabase
      .from('departments')
      .insert({
        name,
        description: description || null,
        color_theme: color_theme || 'blue'
      })
      .select()
      .single();

    if (error) {
      console.error('创建部门失败:', error);
      return NextResponse.json(
        { error: '创建部门失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      department,
      message: '部门创建成功'
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
