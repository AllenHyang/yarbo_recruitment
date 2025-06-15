import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { requireCandidate } from '@/lib/api-auth'

// 创建服务端Supabase客户端（使用service key）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.***REMOVED***!
)

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限 - 只有候选人可以申请职位
    const authResult = await requireCandidate(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json()
    const { jobId, applicantInfo, coverLetter, useExistingResume, resumeId, resumeFile } = body

    if (!jobId || !applicantInfo) {
      return NextResponse.json(
        { error: '缺少必要的申请信息' },
        { status: 400 }
      )
    }

    const { name, email, phone } = applicantInfo

    // 1. 检查用户是否已存在
    let user = null
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      user = existingUser
      console.log('用户已存在:', user.id)
    } else {
      // 2. 自动注册新用户
      console.log('创建新用户账户...')

      // 使用Supabase Auth创建用户
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generateRandomPassword(), // 生成随机密码
        email_confirm: true, // 自动确认邮箱
        user_metadata: {
          name,
          phone,
          role: 'candidate'
        }
      })

      if (authError) {
        console.error('创建用户失败:', authError)
        throw new Error('用户注册失败: ' + authError.message)
      }

      // 3. 在users表中创建用户记录
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authUser.user.id,
          email,
          role: 'candidate',
          status: 'active'
        })
        .select()
        .single()

      if (userError) {
        console.error('创建用户记录失败:', userError)
        throw new Error('用户记录创建失败')
      }

      user = newUser
      console.log('新用户创建成功:', user.id)
    }

    // 4. 检查或创建申请者记录
    let applicant = null
    const { data: existingApplicant } = await supabaseAdmin
      .from('applicants')
      .select('*')
      .eq('email', email)
      .single()

    if (existingApplicant) {
      applicant = existingApplicant

      // 更新申请者信息
      const { data: updatedApplicant, error: updateError } = await supabaseAdmin
        .from('applicants')
        .update({
          name,
          phone,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicant.id)
        .select()
        .single()

      if (updateError) {
        console.error('更新申请者信息失败:', updateError)
      } else {
        applicant = updatedApplicant
      }
    } else {
      // 创建新的申请者记录
      const { data: newApplicant, error: applicantError } = await supabaseAdmin
        .from('applicants')
        .insert({
          name,
          email,
          phone,
          user_id: user.id
        })
        .select()
        .single()

      if (applicantError) {
        console.error('创建申请者失败:', applicantError)
        throw new Error('申请者记录创建失败')
      }

      applicant = newApplicant
    }

    // 5. 处理简历 - 使用现有简历或上传新简历
    let resume = null

    if (useExistingResume) {
      // 使用用户指定的简历
      if (resumeId) {
        // 使用指定的简历ID
        const { data: existingResume, error: resumeError } = await supabaseAdmin
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .eq('applicant_id', applicant.id) // 确保简历属于该申请者
          .single()

        if (resumeError || !existingResume) {
          console.error('获取指定简历失败:', resumeError)
          throw new Error('未找到指定的简历')
        }

        resume = existingResume
        console.log('使用指定简历:', resume.filename)
      } else {
        // 使用主简历或最新简历（向后兼容）
        const { data: existingResume, error: resumeError } = await supabaseAdmin
          .from('resumes')
          .select('*')
          .eq('applicant_id', applicant.id)
          .order('is_primary', { ascending: false })
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single()

        if (resumeError || !existingResume) {
          console.error('获取用户简历失败:', resumeError)
          throw new Error('未找到用户简历，请先在个人设置中上传简历')
        }

        resume = existingResume
        console.log('使用默认简历:', resume.filename)
      }
    } else if (resumeFile && resumeFile.data) {
      // 上传新简历（保留原有逻辑以支持向后兼容）
      try {
        // 解析base64文件数据
        const base64Data = resumeFile.data.split(',')[1]
        const fileBuffer = Buffer.from(base64Data, 'base64')

        // 生成文件路径
        const fileName = `${applicant.id}_${Date.now()}_${resumeFile.name}`
        const filePath = `resumes/${fileName}`

        // 上传到Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('resumes')
          .upload(filePath, fileBuffer, {
            contentType: resumeFile.type,
            upsert: false
          })

        if (uploadError) {
          console.error('文件上传失败:', uploadError)
          throw new Error('简历文件上传失败')
        }

        // 创建简历记录
        const { data: newResume, error: resumeError } = await supabaseAdmin
          .from('resumes')
          .insert({
            applicant_id: applicant.id,
            filename: resumeFile.name,
            file_path: uploadData.path,
            file_size: resumeFile.size,
            content_type: resumeFile.type
          })
          .select()
          .single()

        if (resumeError) {
          console.error('创建简历记录失败:', resumeError)
          throw new Error('简历记录创建失败')
        }

        resume = newResume
      } catch (fileError) {
        console.error('文件处理失败:', fileError)
        throw new Error('简历处理失败')
      }
    } else {
      throw new Error('请提供简历文件或使用现有简历')
    }

    // 6. 创建申请记录
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id: jobId,
        applicant_id: applicant.id,
        resume_id: resume?.id || null,
        cover_letter: coverLetter || null,
        status: 'submitted'
      })
      .select()
      .single()

    if (applicationError) {
      console.error('创建申请记录失败:', applicationError)
      throw new Error('申请记录创建失败')
    }

    // 7. 返回成功结果
    return NextResponse.json({
      success: true,
      message: '申请提交成功',
      data: {
        user,
        applicant,
        resume,
        application
      }
    })

  } catch (error) {
    console.error('申请提交失败:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '申请提交失败',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// 生成随机密码的辅助函数
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
