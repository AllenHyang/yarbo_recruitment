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
    const includeInactive = searchParams.get('include_inactive') === 'true';
    const offset = (page - 1) * limit;

    // 构建查询
    let query = supabase
      .from('office_locations')
      .select(`
        id,
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
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // 应用搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`);
    }

    // 是否包含非活跃地点
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    // 获取总数
    const { count: totalCount } = await supabase
      .from('office_locations')
      .select('*', { count: 'exact', head: true });

    // 应用分页
    query = query.range(offset, offset + limit - 1);

    const { data: locations, error } = await query;

    if (error) {
      console.error('获取办公地点列表失败:', error);
      return NextResponse.json(
        { error: '获取办公地点列表失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        locations: locations || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
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

    // 检查地点名称是否已存在
    const { data: existingLocation } = await supabase
      .from('office_locations')
      .select('id')
      .eq('name', name)
      .single();

    if (existingLocation) {
      return NextResponse.json(
        { error: '地点名称已存在' },
        { status: 400 }
      );
    }

    // 创建新地点
    const { data: newLocation, error } = await supabase
      .from('office_locations')
      .insert({
        name,
        address,
        city,
        province,
        country: country || '中国',
        postal_code,
        phone,
        email,
        capacity,
        facilities: facilities || [],
        timezone: timezone || 'Asia/Shanghai',
        is_active: is_active !== undefined ? is_active : true,
        is_remote: is_remote || false,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('创建办公地点失败:', error);
      return NextResponse.json(
        { error: '创建办公地点失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newLocation
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
