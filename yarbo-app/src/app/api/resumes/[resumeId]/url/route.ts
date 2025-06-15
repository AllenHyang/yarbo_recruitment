import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.***REMOVED***!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const { resumeId } = await params

    // 从请求头获取认证信息
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供认证信息' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // 验证用户认证
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { error: '认证失败' },
        { status: 401 }
      )
    }

    // 获取简历信息
    const { data: resume, error: resumeError } = await supabaseAdmin
      .from('resumes')
      .select(`
        id,
        file_path,
        filename,
        applicant_id,
        applicants!inner (
          user_id,
          name,
          email
        )
      `)
      .eq('id', resumeId)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: '简历不存在' },
        { status: 404 }
      )
    }

    // 权限检查：用户只能访问自己的简历，或者HR/管理员可以访问所有简历
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !currentUser) {
      return NextResponse.json(
        { error: '用户信息获取失败' },
        { status: 500 }
      )
    }

    const isOwner = resume.applicants.user_id === user.id
    const isHROrAdmin = ['hr', 'admin'].includes(currentUser.role)

    if (!isOwner && !isHROrAdmin) {
      return NextResponse.json(
        { error: '没有权限访问此简历' },
        { status: 403 }
      )
    }

    // 创建签名URL
    const { data: signedUrlData, error: urlError } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(resume.file_path, 3600) // 1小时有效期

    if (urlError) {
      console.error('创建签名URL失败:', urlError)
      return NextResponse.json(
        { error: '无法生成文件访问链接' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: signedUrlData.signedUrl,
        filename: resume.filename,
        expiresIn: 3600
      }
    })

  } catch (error) {
    console.error('获取简历URL失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
