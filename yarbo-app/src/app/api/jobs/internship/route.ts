import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 简单的内存缓存
let internshipJobsCache: { data: any[], timestamp: number, key: string } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const duration = searchParams.get('duration');
    const internshipType = searchParams.get('internship_type');
    const featured = searchParams.get('featured');
    const remote = searchParams.get('remote');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // 生成缓存键
    const cacheKey = `${department || 'all'}-${location || 'all'}-${search || ''}-${duration || 'all'}-${internshipType || 'all'}-${featured || 'false'}-${remote || 'false'}`;

    // 检查缓存
    if (!forceRefresh && internshipJobsCache &&
      internshipJobsCache.key === cacheKey &&
      (Date.now() - internshipJobsCache.timestamp) < CACHE_DURATION) {
      console.log('使用缓存的实习招聘数据');
      return NextResponse.json({
        success: true,
        jobs: internshipJobsCache.data,
        count: internshipJobsCache.data.length,
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
        internship_duration,
        internship_type,
        start_date,
        stipend_amount,
        stipend_period,
        is_featured,
        is_remote_internship,
        salary_display,
        description,
        requirements,
        skills_gained,
        status,
        employment_type,
        expires_at,
        created_at,
        updated_at
      `)
      .eq('job_category', 'internship')
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

    if (duration && duration !== 'all') {
      query = query.eq('internship_duration', duration);
    }

    if (internshipType && internshipType !== 'all') {
      query = query.eq('internship_type', internshipType);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (remote === 'true') {
      query = query.eq('is_remote_internship', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('获取实习职位失败:', error);
      return NextResponse.json(
        { error: '获取实习职位失败', details: error.message },
        { status: 500 }
      );
    }

    // 转换数据格式以匹配前端期望的格式
    const internshipJobs = (jobs || []).map(job => ({
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      duration: job.internship_duration || '',
      type: job.internship_type || '实习',
      salary_display: job.salary_display || `${job.stipend_amount || 0}/${job.stipend_period === 'daily' ? '天' : job.stipend_period === 'weekly' ? '周' : '月'}`,
      description: job.description,
      requirements: job.requirements || [],
      benefits: [], // 可以从其他表获取或添加到jobs表
      skills_gained: job.skills_gained || [],
      posted_at: job.created_at?.split('T')[0] || '',
      deadline: job.expires_at?.split('T')[0] || '',
      start_date: job.start_date || '',
      is_featured: job.is_featured || false,
      is_remote: job.is_remote_internship || false,
      stipend_amount: job.stipend_amount,
      stipend_period: job.stipend_period
    }));

    // 更新缓存
    internshipJobsCache = { data: internshipJobs, timestamp: Date.now(), key: cacheKey };

    return NextResponse.json({
      success: true,
      jobs: internshipJobs,
      count: internshipJobs.length,
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
    // 这里可以添加创建实习职位的逻辑
    // 需要验证用户权限（HR或管理员）

    const body = await request.json();
    const {
      title,
      department,
      location,
      internship_duration,
      internship_type,
      start_date,
      stipend_amount,
      stipend_period,
      is_featured,
      is_remote_internship,
      salary_display,
      description,
      requirements,
      skills_gained,
      deadline
    } = body;

    // 验证必要字段
    if (!title || !department || !description || !internship_duration) {
      return NextResponse.json(
        { error: '缺少必要字段：title, department, description, internship_duration' },
        { status: 400 }
      );
    }

    // 创建实习职位
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title,
        department,
        location,
        job_category: 'internship',
        internship_duration,
        internship_type,
        start_date,
        stipend_amount,
        stipend_period: stipend_period || 'daily',
        is_featured: is_featured || false,
        is_remote_internship: is_remote_internship || false,
        salary_display,
        description,
        requirements,
        skills_gained,
        expires_at: deadline,
        status: 'active',
        employment_type: 'internship'
      })
      .select()
      .single();

    if (error) {
      console.error('创建实习职位失败:', error);
      return NextResponse.json(
        { error: '创建实习职位失败', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '实习职位创建成功',
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
