import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 公开API - 获取活跃的办公地点列表（用于职位申请等公开页面）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRemote = searchParams.get('include_remote') === 'true';

    // 构建查询
    let query = supabase
      .from('office_locations')
      .select(`
        id,
        name,
        city,
        province,
        country,
        is_remote,
        description
      `)
      .eq('is_active', true)
      .order('name');

    // 是否包含远程办公选项
    if (!includeRemote) {
      query = query.eq('is_remote', false);
    }

    const { data: locations, error } = await query;

    if (error) {
      console.error('获取办公地点列表失败:', error);
      return NextResponse.json(
        { error: '获取办公地点列表失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: locations || []
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
