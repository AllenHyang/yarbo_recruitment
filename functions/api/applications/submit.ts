// 原生 Cloudflare Pages Function - 申请提交
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

    // 使用环境变量
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: '环境变量配置错误'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查是否已经申请过
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/applications?job_id=eq.${jobId}&candidate_id=eq.${candidateId}&select=id`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (checkResponse.ok) {
      const existingApplications = await checkResponse.json();
      if (existingApplications.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: '您已经申请过这个职位了'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 提交申请
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/applications`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        job_id: jobId,
        candidate_id: candidateId,
        cover_letter: coverLetter,
        resume_url: resumeUrl,
        status: 'submitted',
        applied_at: new Date().toISOString()
      })
    });

    if (!insertResponse.ok) {
      console.error('申请提交失败:', insertResponse.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '申请提交失败，请稍后重试'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const applications = await insertResponse.json();
    const application = applications[0];

    return new Response(JSON.stringify({
      success: true,
      message: '申请提交成功！我们会尽快与您联系。',
      data: { applicationId: application.id }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器内部错误',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
