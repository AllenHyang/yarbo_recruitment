import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 解析请求数据
    const body = await request.json();
    const { jobId, candidateId, coverLetter, resumeUrl } = body;

    // 验证必需字段
    if (!jobId || !candidateId) {
      return NextResponse.json({
        success: false,
        error: '缺少必需字段',
        required: ['jobId', 'candidateId']
      }, { status: 400 });
    }

    // 验证环境变量
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误'
      }, { status: 500 });
    }

    // 检查是否已经申请过
    const { data: existingApplications, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId);

    if (checkError) {
      console.error('检查申请失败:', checkError);
      return NextResponse.json({
        success: false,
        error: '检查申请状态失败'
      }, { status: 500 });
    }

    if (existingApplications && existingApplications.length > 0) {
      return NextResponse.json({
        success: false,
        error: '您已经申请过这个职位了'
      }, { status: 400 });
    }

    // 提交申请
    const { data: applications, error: insertError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        status: 'submitted',
        applied_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('申请提交失败:', insertError);
      return NextResponse.json({
        success: false,
        error: '申请提交失败，请稍后重试'
      }, { status: 500 });
    }

    const application = applications[0];

    return NextResponse.json({
      success: true,
      message: '申请提交成功！我们会尽快与您联系。',
      data: { 
        applicationId: application.id,
        submittedAt: application.applied_at
      },
      runtime: 'Next.js API Routes'
    });

  } catch (error) {
    console.error('Applications API 错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
} 