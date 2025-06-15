// Cloudflare Pages Function for job application submission
export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    
    // 解析请求数据
    const body = await request.json();
    const { jobId, candidateId, coverLetter, resumeUrl } = body;

    // 验证必需字段
    if (!jobId || !candidateId) {
      return new Response(JSON.stringify({
        success: false,
        error: '缺少必需字段'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建 Supabase 客户端
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.***REMOVED***
    );

    // 检查是否已经申请过
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .single();

    if (existingApplication) {
      return new Response(JSON.stringify({
        success: false,
        error: '您已经申请过这个职位了'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 提交申请
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        candidate_id: candidateId,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        status: 'submitted',
        applied_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('申请提交失败:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '申请提交失败，请稍后重试'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '申请提交成功！我们会尽快与您联系。',
      data: { applicationId: application.id }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
