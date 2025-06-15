import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireHROrAdmin } from '@/lib/api-auth'

// 简单的内存缓存
let jobsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // 检查缓存
    if (!forceRefresh && jobsCache && (Date.now() - jobsCache.timestamp) < CACHE_DURATION) {
      console.log('使用缓存的职位数据');
      return NextResponse.json({
        success: true,
        jobs: jobsCache.data,
        count: jobsCache.data.length,
        cached: true
      });
    }

    // 获取活跃的职位列表 - 优化查询
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        department,
        location,
        salary_min,
        salary_max,
        salary_display,
        employment_type,
        experience_level,
        description,
        requirements,
        status,
        created_at,
        expires_at,
        job_category,
        graduation_year,
        is_featured,
        campus_specific,
        internship_duration,
        internship_type,
        start_date,
        stipend_amount,
        skills_gained,
        is_remote_internship
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取职位列表失败:', error)
      return NextResponse.json(
        { error: '获取职位列表失败', details: error.message },
        { status: 500 }
      )
    }

    // 更新缓存
    jobsCache = { data: jobs || [], timestamp: Date.now() };

    return NextResponse.json({
      success: true,
      jobs: jobs || [],
      count: jobs?.length || 0,
      cached: false
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const authResult = await requireHROrAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json()
    const { title, department, description, requirements, location_id, employment_type } = body

    // 验证必要字段
    if (!title || !department || !description) {
      return NextResponse.json(
        { error: '缺少必要字段：title, department, description' },
        { status: 400 }
      )
    }

    // 创建新职位
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        department,
        description,
        requirements,
        location_id,
        employment_type,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('创建职位失败:', error)
      return NextResponse.json(
        { error: '创建职位失败', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '职位创建成功',
      job
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
