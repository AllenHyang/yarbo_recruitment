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

    const supabase = createAuthenticatedSupabaseClient(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少地点ID' },
        { status: 400 }
      );
    }

    const { data: location, error } = await supabase
      .from('office_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取办公地点详情失败:', error);
      return NextResponse.json(
        { error: '获取办公地点详情失败', details: error.message },
        { status: 500 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: '办公地点不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: location
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

    const supabase = createAuthenticatedSupabaseClient(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少地点ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      address, 
      city, 
      province, 
      country, 
      postal_code, 
      phone, 
      email, 
      capacity, 
      facilities, 
      timezone, 
      is_active, 
      is_remote, 
      description 
    } = body;

    // 验证必填字段
    if (!name || !city) {
      return NextResponse.json(
        { error: '地点名称和城市不能为空' },
        { status: 400 }
      );
    }

    // 检查地点名称是否已存在（排除当前地点）
    const { data: existingLocation } = await supabase
      .from('office_locations')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .single();

    if (existingLocation) {
      return NextResponse.json(
        { error: '地点名称已存在' },
        { status: 400 }
      );
    }

    // 更新地点
    const { data: updatedLocation, error } = await supabase
      .from('office_locations')
      .update({
        name,
        address,
        city,
        province,
        country,
        postal_code,
        phone,
        email,
        capacity,
        facilities,
        timezone,
        is_active,
        is_remote,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新办公地点失败:', error);
      return NextResponse.json(
        { error: '更新办公地点失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLocation
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

    const supabase = createAuthenticatedSupabaseClient(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '缺少地点ID' },
        { status: 400 }
      );
    }

    // 检查是否有职位使用此地点
    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', id);

    if (jobCount && jobCount > 0) {
      return NextResponse.json(
        { error: '无法删除：该地点正在被职位使用' },
        { status: 400 }
      );
    }

    // 删除地点
    const { error } = await supabase
      .from('office_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除办公地点失败:', error);
      return NextResponse.json(
        { error: '删除办公地点失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '办公地点已删除'
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
