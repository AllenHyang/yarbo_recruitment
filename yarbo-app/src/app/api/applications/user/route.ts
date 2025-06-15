import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// 创建服务端Supabase客户端（使用service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // 验证JWT token并获取用户信息
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: '身份验证失败' },
        { status: 401 }
      )
    }

    // 只允许查询当前登录用户的申请
    const userEmail = user.email

    // 查找当前用户的申请记录
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        notes,
        jobs (
          id,
          title,
          department,
          location,
          salary_min,
          salary_max,
          salary_display
        ),
        applicants (
          id,
          name,
          email,
          phone
        ),
        resumes (
          id,
          filename,
          uploaded_at
        )
      `)
      .eq('applicants.email', userEmail)
      .order('applied_at', { ascending: false })



    if (error) {
      console.error('查询申请记录失败:', error)
      return NextResponse.json(
        { error: '查询申请记录失败' },
        { status: 500 }
      )
    }

    // 转换数据格式以匹配前端期望的格式
    const formattedApplications = applications?.map(app => ({
      id: app.id,
      jobTitle: app.jobs?.title || '未知职位',
      department: app.jobs?.department || '未知部门',
      location: app.jobs?.location || '未知地点',
      salary: formatSalary(app.jobs),
      appliedDate: new Date(app.applied_at).toISOString().split('T')[0],
      status: app.status,
      statusText: getStatusText(app.status),
      progress: getStatusProgress(app.status),
      estimatedDays: getEstimatedDays(app.status),
      hrName: "HR团队",
      interviewDate: null, // TODO: 从面试安排表获取
      feedback: null, // TODO: 从反馈表获取
      timeline: generateTimeline(app.status, app.applied_at),
      resumeFilename: app.resumes?.filename,
      coverLetter: app.cover_letter
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedApplications
    })

  } catch (error) {
    console.error('获取用户申请失败:', error)
    return NextResponse.json(
      { error: '获取用户申请失败' },
      { status: 500 }
    )
  }
}

// 辅助函数
function formatSalary(job: any) {
  // 如果有salary_display，直接使用
  if (job?.salary_display) return job.salary_display

  // 否则根据salary_min和salary_max计算
  if (!job?.salary_min && !job?.salary_max) return '面议'
  if (job.salary_min && job.salary_max) {
    return `${job.salary_min / 1000}K-${job.salary_max / 1000}K CNY`
  }
  if (job.salary_min) return `${job.salary_min / 1000}K+ CNY`
  return `<${job.salary_max / 1000}K CNY`
}

function getStatusText(status: string) {
  const statusMap: { [key: string]: string } = {
    'submitted': '已提交',
    'reviewing': '审核中',
    'interview': '面试中',
    'hired': '已录用',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

function getStatusProgress(status: string) {
  const progressMap: { [key: string]: number } = {
    'submitted': 20,
    'reviewing': 40,
    'interview': 70,
    'hired': 100,
    'rejected': 100
  }
  return progressMap[status] || 0
}

function getEstimatedDays(status: string) {
  const daysMap: { [key: string]: number } = {
    'submitted': 3,
    'reviewing': 5,
    'interview': 7,
    'hired': 0,
    'rejected': 0
  }
  return daysMap[status] || 0
}

function generateTimeline(currentStatus: string, appliedDate: string) {
  const baseTimeline = [
    {
      status: "submitted",
      title: "投递成功",
      description: "我们已收到您的简历，Yarbo之旅，即刻启程！",
      date: new Date(appliedDate).toISOString().split('T')[0],
      completed: true
    },
    {
      status: "reviewing",
      title: "简历评估中",
      description: "我们的HR正在仔细阅读您的简历，请耐心等待，预计需要3-5个工作日。",
      date: null,
      completed: false,
      current: false
    },
    {
      status: "interview",
      title: "面试安排",
      description: "若通过评估，我们的招聘专员将与您联系安排面试事宜。",
      date: null,
      completed: false
    },
    {
      status: "decision",
      title: "最终决定",
      description: "面试结束后，我们会在5个工作日内给出最终回复。",
      date: null,
      completed: false
    }
  ]

  // 根据当前状态更新时间线
  const statusOrder = ['submitted', 'reviewing', 'interview', 'hired', 'rejected']
  const currentIndex = statusOrder.indexOf(currentStatus)

  return baseTimeline.map((item, index) => {
    if (index < currentIndex || (currentStatus === 'hired' && item.status === 'interview')) {
      return { ...item, completed: true }
    } else if (index === currentIndex || (currentStatus === 'reviewing' && item.status === 'reviewing')) {
      return { ...item, current: true, completed: false }
    }
    return item
  })
}
