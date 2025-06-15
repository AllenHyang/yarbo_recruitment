import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 创建服务端Supabase客户端（使用service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

// GET - 获取单个offer详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json(
        { error: '需要提供用户ID和角色' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('offers')
      .select(`
        *,
        applications (
          id,
          status,
          applied_at,
          cover_letter
        ),
        jobs (
          id,
          title,
          department,
          location,
          description,
          requirements
        ),
        applicants (
          id,
          name,
          email,
          phone,
          user_id
        )
      `)
      .eq('id', offerId)

    // 权限检查
    if (role === 'candidate') {
      query = query.eq('applicants.user_id', userId)
    }

    const { data: offer, error } = await query.single()

    if (error) {
      console.error('查询offer失败:', error)
      return NextResponse.json(
        { error: '查询offer失败' },
        { status: 500 }
      )
    }

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer不存在或无权限访问' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: offer
    })

  } catch (error) {
    console.error('获取offer详情失败:', error)
    return NextResponse.json(
      { error: '获取offer详情失败' },
      { status: 500 }
    )
  }
}

// PATCH - 更新offer状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id
    const body = await request.json()
    const { status, userId, role, notes } = body

    if (!userId || !role || !status) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证状态值
    const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn', 'expired']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      )
    }

    // 获取当前offer信息
    const { data: currentOffer, error: fetchError } = await supabaseAdmin
      .from('offers')
      .select(`
        *,
        applicants (user_id),
        applications (id)
      `)
      .eq('id', offerId)
      .single()

    if (fetchError || !currentOffer) {
      return NextResponse.json(
        { error: 'Offer不存在' },
        { status: 404 }
      )
    }

    // 权限检查
    if (role === 'candidate') {
      // 候选人只能接受或拒绝自己的offer
      if (currentOffer.applicants.user_id !== userId) {
        return NextResponse.json(
          { error: '无权限操作此offer' },
          { status: 403 }
        )
      }
      if (!['accepted', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: '候选人只能接受或拒绝offer' },
          { status: 400 }
        )
      }
    } else if (role === 'hr') {
      // HR可以撤回自己发出的offer
      if (currentOffer.offered_by !== userId && status === 'withdrawn') {
        return NextResponse.json(
          { error: '只能撤回自己发出的offer' },
          { status: 403 }
        )
      }
    }
    // admin可以操作所有offer

    // 更新offer
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (['accepted', 'rejected'].includes(status)) {
      updateData.responded_at = new Date().toISOString()
    }

    if (notes) {
      updateData.notes = notes
    }

    const { data: updatedOffer, error: updateError } = await supabaseAdmin
      .from('offers')
      .update(updateData)
      .eq('id', offerId)
      .select()
      .single()

    if (updateError) {
      console.error('更新offer失败:', updateError)
      return NextResponse.json(
        { error: '更新offer失败' },
        { status: 500 }
      )
    }

    // 根据offer状态更新申请状态
    let applicationStatus = 'offered'
    if (status === 'accepted') {
      applicationStatus = 'hired'
    } else if (status === 'rejected') {
      applicationStatus = 'rejected'
    } else if (status === 'withdrawn') {
      applicationStatus = 'reviewing'
    }

    await supabaseAdmin
      .from('applications')
      .update({ status: applicationStatus })
      .eq('id', currentOffer.applications.id)

    return NextResponse.json({
      success: true,
      data: updatedOffer
    })

  } catch (error) {
    console.error('更新offer失败:', error)
    return NextResponse.json(
      { error: '更新offer失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除offer (仅Admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (role !== 'admin') {
      return NextResponse.json(
        { error: '只有管理员可以删除offer' },
        { status: 403 }
      )
    }

    const { error } = await supabaseAdmin
      .from('offers')
      .delete()
      .eq('id', offerId)

    if (error) {
      console.error('删除offer失败:', error)
      return NextResponse.json(
        { error: '删除offer失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Offer已删除'
    })

  } catch (error) {
    console.error('删除offer失败:', error)
    return NextResponse.json(
      { error: '删除offer失败' },
      { status: 500 }
    )
  }
}
