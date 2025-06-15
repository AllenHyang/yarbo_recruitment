import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建服务端Supabase客户端（使用service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

// POST - 取消申请
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id
    const body = await request.json()
    const { userId, reason } = body

    if (!userId) {
      return NextResponse.json(
        { error: '需要提供用户ID' },
        { status: 400 }
      )
    }

    // 获取申请信息并验证权限
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        status,
        applicants (
          user_id
        )
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '申请不存在' },
        { status: 404 }
      )
    }

    // 验证用户权限 - 只有申请人可以取消自己的申请
    if (application.applicants.user_id !== userId) {
      return NextResponse.json(
        { error: '无权限取消此申请' },
        { status: 403 }
      )
    }

    // 检查申请状态 - 只有特定状态的申请可以取消
    const cancellableStatuses = ['submitted', 'reviewing', 'interview_scheduled']
    if (!cancellableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: '当前状态的申请无法取消' },
        { status: 400 }
      )
    }

    // 更新申请状态为已取消
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
        // 可以添加取消原因字段
        ...(reason && { cancellation_reason: reason })
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (updateError) {
      console.error('更新申请状态失败:', updateError)
      return NextResponse.json(
        { error: '取消申请失败' },
        { status: 500 }
      )
    }

    // 记录操作日志（可选）
    try {
      await supabaseAdmin
        .from('application_logs')
        .insert({
          application_id: applicationId,
          action: 'cancelled',
          performed_by: userId,
          details: reason ? { reason } : null,
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      // 日志记录失败不影响主要操作
      console.warn('记录操作日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: '申请已成功取消'
    })

  } catch (error) {
    console.error('取消申请失败:', error)
    return NextResponse.json(
      { error: '取消申请失败' },
      { status: 500 }
    )
  }
}

// GET - 检查申请是否可以取消
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '需要提供用户ID' },
        { status: 400 }
      )
    }

    // 获取申请信息
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        status,
        applicants (
          user_id
        )
      `)
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '申请不存在' },
        { status: 404 }
      )
    }

    // 验证用户权限
    if (application.applicants.user_id !== userId) {
      return NextResponse.json(
        { error: '无权限访问此申请' },
        { status: 403 }
      )
    }

    // 检查是否可以取消
    const cancellableStatuses = ['submitted', 'reviewing', 'interview_scheduled']
    const canCancel = cancellableStatuses.includes(application.status)

    return NextResponse.json({
      success: true,
      data: {
        canCancel,
        status: application.status,
        reason: canCancel ? null : '当前状态的申请无法取消'
      }
    })

  } catch (error) {
    console.error('检查申请状态失败:', error)
    return NextResponse.json(
      { error: '检查申请状态失败' },
      { status: 500 }
    )
  }
}
