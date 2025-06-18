import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 配置为静态路由 - AWS Amplify静态托管必需
export const dynamic = 'auto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const fields = '*';
    const limit = 50;
    const jobId = req.nextUrl.searchParams.get("id");

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误',
        details: 'Supabase 配置缺失'
      }, { status: 500 });
    }

    let query = supabase.from('jobs').select(fields);

    if (jobId) {
      const { data: job, error } = await query.eq('id', jobId).single();

      if (error) {
        console.error('Supabase 单个职位查询失败:', error);
        if (error.code === 'PGRST116') { // PGRST116 typically means "Not Found" for .single()
          return NextResponse.json({
            success: false,
            error: '查询职位失败',
            details: `Job with ID ${jobId} not found.`
          }, { status: 404 });
        }
        return NextResponse.json({
          success: false,
          error: '查询职位失败',
          details: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: job,
        message: `✅ Job with ID ${jobId} fetched successfully!`,
        runtime: 'Next.js API Routes'
      });

    } else {
      const { data: jobs, error } = await query.eq('status', 'active').limit(limit);

      if (error) {
        console.error('Supabase 批量职位查询失败:', error);
        return NextResponse.json({
          success: false,
          error: '查询职位列表失败',
          details: error.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: jobs,
        count: jobs?.length || 0,
        message: '✅ Job list fetched successfully!',
        runtime: 'Next.js API Routes'
      });
    }

  } catch (error) {
    console.error('Jobs API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 