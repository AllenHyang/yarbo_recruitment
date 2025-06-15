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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限 - 只有HR和管理员可以查看
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少部门ID' },
        { status: 400 }
      );
    }

    const supabase = createAuthenticatedSupabaseClient(request);

    // 获取部门详情
    const { data: department, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        description,
        color_theme,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取部门详情失败:', error);
      return NextResponse.json(
        { error: '获取部门详情失败', details: error.message },
        { status: 500 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: '部门不存在' },
        { status: 404 }
      );
    }

    // 获取关联的职位数量
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    // 获取员工数量
    const { count: employeeCount } = await supabase
      .from('hr_departments')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    // 获取关联的职位列表
    const { data: jobs } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        status,
        created_at,
        salary_display
      `)
      .eq('department_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      department: {
        ...department,
        jobs_count: jobsCount || 0,
        employee_count: employeeCount || 0,
        recent_jobs: jobs || []
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限 - 只有HR和管理员可以更新
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, color_theme } = body;

    if (!id) {
      return NextResponse.json(
        { error: '缺少部门ID' },
        { status: 400 }
      );
    }

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: '部门名称不能为空' },
        { status: 400 }
      );
    }

    // 检查部门是否存在
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingDepartment) {
      return NextResponse.json(
        { error: '部门不存在' },
        { status: 404 }
      );
    }

    // 检查部门名称是否与其他部门冲突
    const { data: nameConflict } = await supabase
      .from('departments')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();

    if (nameConflict) {
      return NextResponse.json(
        { error: '部门名称已存在' },
        { status: 400 }
      );
    }

    // 更新部门
    const { data: department, error } = await supabase
      .from('departments')
      .update({
        name,
        description: description || null,
        color_theme: color_theme || 'blue',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新部门失败:', error);
      return NextResponse.json(
        { error: '更新部门失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      department,
      message: '部门更新成功'
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户权限 - 只有HR和管理员可以删除
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少部门ID' },
        { status: 400 }
      );
    }

    // 检查部门是否存在
    const { data: department } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', id)
      .single();

    if (!department) {
      return NextResponse.json(
        { error: '部门不存在' },
        { status: 404 }
      );
    }

    // 检查是否有关联的职位
    const { count: jobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    if (jobsCount && jobsCount > 0) {
      return NextResponse.json(
        { error: `无法删除部门，该部门下还有 ${jobsCount} 个职位` },
        { status: 400 }
      );
    }

    // 检查是否有关联的员工
    const { count: employeeCount } = await supabase
      .from('hr_departments')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);

    if (employeeCount && employeeCount > 0) {
      return NextResponse.json(
        { error: `无法删除部门，该部门下还有 ${employeeCount} 名员工` },
        { status: 400 }
      );
    }

    // 删除部门
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除部门失败:', error);
      return NextResponse.json(
        { error: '删除部门失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '部门删除成功'
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
