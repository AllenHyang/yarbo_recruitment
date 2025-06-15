import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 简单的内存缓存
let campusJobsCache: { data: any[], timestamp: number, key: string } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const graduationYear = searchParams.get('graduation_year');
    const featured = searchParams.get('featured');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 生成缓存键
    const cacheKey = `${department || 'all'}-${location || 'all'}-${search || ''}-${graduationYear || 'all'}-${featured || 'false'}`;

    // 检查缓存
    if (!forceRefresh && campusJobsCache &&
      campusJobsCache.key === cacheKey &&
      (Date.now() - campusJobsCache.timestamp) < CACHE_DURATION) {
      console.log('使用缓存的校园招聘数据');
      return NextResponse.json({
        success: true,
        jobs: campusJobsCache.data,
        count: campusJobsCache.data.length,
        cached: true
      });
    }

    // 构建查询
    let query = supabase
      .from('jobs')
      .select(`
        id,
        title,
        department,
        location,
        job_category,
        graduation_year,
        is_featured,
        campus_specific,
        salary_min,
        salary_max,
        salary_display,
        description,
        requirements,
        status,
        employment_type,
        experience_level,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('job_category', 'campus')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // 应用筛选条件
    if (department && department !== 'all') {
      query = query.eq('department', department);
    }

    if (location && location !== 'all') {
      query = query.eq('location', location);
    }

    if (graduationYear && graduationYear !== 'all') {
      query = query.eq('graduation_year', graduationYear);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('获取校园招聘职位失败:', error);
      return NextResponse.json(
        { error: '获取校园招聘职位失败', details: error.message },
        { status: 500 }
      );
    }

    // 转换数据格式以匹配前端期望的格式
    const campusJobs = (jobs || []).map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.employment_type || '全职',
      level: job.experience_level === 'entry' ? '应届生' : job.experience_level,
      salary_display: job.salary_display || `${job.salary_min || 0}-${job.salary_max || 0}K`,
      description: job.description,
      requirements: job.requirements || [],
      benefits: [], // 可以从其他表获取或添加到jobs表
      posted_at: job.created_at?.split('T')[0] || '',
      deadline: job.expires_at?.split('T')[0] || '',
      is_featured: job.is_featured || false,
      campus_specific: job.campus_specific || false,
      graduation_year: job.graduation_year
    }));

    // 更新缓存
    campusJobsCache = { data: campusJobs, timestamp: Date.now(), key: cacheKey };

    return NextResponse.json({
      success: true,
      jobs: campusJobs,
      count: campusJobs.length,
      cached: false
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
    // 这里可以添加创建校园招聘职位的逻辑
    // 需要验证用户权限（HR或管理员）

    const body = await request.json();
    const {
      title,
      department,
      location,
      graduation_year,
      is_featured,
      campus_specific,
      salary_min,
      salary_max,
      salary_display,
      description,
      requirements,
      deadline
    } = body;

    // 验证必要字段
    if (!title || !department || !description || !graduation_year) {
      return NextResponse.json(
        { error: '缺少必要字段：title, department, description, graduation_year' },
        { status: 400 }
      );
    }

    // 创建校园招聘职位
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        department,
        location,
        job_category: 'campus',
        graduation_year,
        is_featured: is_featured || false,
        campus_specific: campus_specific || true,
        salary_min,
        salary_max,
        salary_display,
        description,
        requirements,
        expires_at: deadline,
        status: 'active',
        employment_type: 'full_time',
        experience_level: 'entry'
      })
      .select()
      .single();

    if (error) {
      console.error('创建校园招聘职位失败:', error);
      return NextResponse.json(
        { error: '创建校园招聘职位失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '校园招聘职位创建成功',
      job
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
