import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, applicantInfo, coverLetter, resumeId, useExistingResume } = body;

    // 验证必填字段
    if (!jobId || !applicantInfo || !applicantInfo.name || !applicantInfo.email || !applicantInfo.phone) {
      return NextResponse.json(
        { error: '缺少必填信息' },
        { status: 400 }
      );
    }

    if (useExistingResume && !resumeId) {
      return NextResponse.json(
        { error: '请选择要使用的简历' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '未登录或登录已过期' },
        { status: 401 }
      );
    }

    // 检查是否已经申请过这个职位
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: '您已经申请过这个职位了' },
        { status: 400 }
      );
    }

    // 验证简历是否属于当前用户
    if (useExistingResume && resumeId) {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('id')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();

      if (resumeError || !resume) {
        return NextResponse.json(
          { error: '简历不存在或无权使用' },
          { status: 400 }
        );
      }
    }

    // 创建申请记录
    const applicationData = {
      user_id: user.id,
      job_id: jobId,
      resume_id: resumeId,
      cover_letter: coverLetter,
      status: 'pending',
      applicant_name: applicantInfo.name,
      applicant_email: applicantInfo.email,
      applicant_phone: applicantInfo.phone,
      applied_at: new Date().toISOString()
    };

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single();

    if (insertError) {
      console.error('创建申请记录失败:', insertError);
      return NextResponse.json(
        { error: '申请提交失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 获取职位信息用于通知
    const { data: job } = await supabase
      .from('jobs')
      .select('title, department')
      .eq('id', jobId)
      .single();

    // 创建站内通知
    if (job) {
      // 给候选人的通知
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'application_submitted',
        title: '申请提交成功',
        message: `您的${job.title}职位申请已成功提交，我们会尽快审核。`,
        data: {
          application_id: application.id,
          job_id: jobId,
          job_title: job.title
        }
      });

      // 给HR的通知 - 获取所有HR用户
      const { data: hrUsers } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'hr');

      if (hrUsers && hrUsers.length > 0) {
        const hrNotifications = hrUsers.map(hr => ({
          user_id: hr.id,
          type: 'new_application',
          title: '新的职位申请',
          message: `${applicantInfo.name} 申请了 ${job.title} 职位`,
          data: {
            application_id: application.id,
            job_id: jobId,
            job_title: job.title,
            applicant_name: applicantInfo.name
          }
        }));

        await supabase.from('notifications').insert(hrNotifications);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        application: {
          id: application.id,
          status: application.status,
          applied_at: application.applied_at
        }
      }
    });

  } catch (error) {
    console.error('申请提交处理失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}