import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建服务端Supabase客户端（使用service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

// GET - 获取offer列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!userId || !role) {
      return NextResponse.json(
        { error: '需要提供用户ID和角色' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('offers')
      .select(`
        id,
        salary_amount,
        salary_currency,
        start_date,
        status,
        expires_at,
        offered_at,
        responded_at,
        notes,
        benefits,
        applications (
          id,
          status,
          applied_at
        ),
        jobs (
          id,
          title,
          department,
          location
        ),
        applicants (
          id,
          name,
          email,
          phone
        )
      `)
      .order('offered_at', { ascending: false })

    // 根据角色过滤数据
    if (role === 'candidate') {
      // 候选人只能看到自己的offer
      // 需要通过applicants表关联到user_id
      const { data: applicantData } = await supabaseAdmin
        .from('applicants')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (applicantData) {
        query = query.eq('applicant_id', applicantData.id)
      } else {
        // 如果没有找到applicant记录，返回空结果
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        })
      }
    } else if (role === 'hr') {
      // HR可以看到自己发出的offer或自己部门的offer
      // TODO: 添加部门过滤逻辑
    }
    // admin可以看到所有offer

    // 状态过滤
    if (status) {
      query = query.eq('status', status)
    }

    // 分页
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: offers, error } = await query

    if (error) {
      console.error('查询offer失败:', error)
      return NextResponse.json(
        { error: '查询offer失败' },
        { status: 500 }
      )
    }

    // 获取总数
    let countQuery = supabaseAdmin
      .from('offers')
      .select('id', { count: 'exact', head: true })

    if (role === 'candidate') {
      // 使用相同的applicant_id过滤
      const { data: applicantData } = await supabaseAdmin
        .from('applicants')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (applicantData) {
        countQuery = countQuery.eq('applicant_id', applicantData.id)
      }
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count } = await countQuery

    return NextResponse.json({
      success: true,
      data: offers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取offer列表失败:', error)
    return NextResponse.json(
      { error: '获取offer列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新offer (仅HR和Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      applicationId,
      jobId,
      applicantId,
      offeredBy,
      salaryAmount,
      salaryCurrency = 'CNY',
      startDate,
      expiresAt,
      notes,
      benefits
    } = body

    // 验证必填字段
    if (!applicationId || !jobId || !applicantId || !offeredBy || !salaryAmount) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 检查是否已经有pending的offer
    const { data: existingOffer } = await supabaseAdmin
      .from('offers')
      .select('id')
      .eq('application_id', applicationId)
      .eq('status', 'pending')
      .single()

    if (existingOffer) {
      return NextResponse.json(
        { error: '该申请已有待处理的offer' },
        { status: 400 }
      )
    }

    // 创建offer
    const { data: offer, error } = await supabaseAdmin
      .from('offers')
      .insert({
        application_id: applicationId,
        job_id: jobId,
        applicant_id: applicantId,
        offered_by: offeredBy,
        salary_amount: salaryAmount,
        salary_currency: salaryCurrency,
        start_date: startDate,
        expires_at: expiresAt,
        notes,
        benefits
      })
      .select()
      .single()

    if (error) {
      console.error('创建offer失败:', error)
      return NextResponse.json(
        { error: '创建offer失败' },
        { status: 500 }
      )
    }

    // 更新申请状态为offered
    await supabaseAdmin
      .from('applications')
      .update({ status: 'offered' })
      .eq('id', applicationId)

    return NextResponse.json({
      success: true,
      data: offer
    })

  } catch (error) {
    console.error('创建offer失败:', error)
    return NextResponse.json(
      { error: '创建offer失败' },
      { status: 500 }
    )
  }
}
