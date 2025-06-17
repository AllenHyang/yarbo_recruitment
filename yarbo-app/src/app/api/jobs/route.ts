import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fields = searchParams.get('fields') || '*';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误',
        details: 'Supabase 配置缺失'
      }, { status: 500 });
    }

    // 查询职位数据
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(fields)
      .eq('status', 'active')
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase 查询失败:', error);
      return NextResponse.json({
        success: false,
        error: '查询职位失败',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs?.length || 0,
      message: '✅ Next.js API Routes 工作正常！',
      runtime: 'Next.js API Routes'
    });

  } catch (error) {
    console.error('Jobs API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 