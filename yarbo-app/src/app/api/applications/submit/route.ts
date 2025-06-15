// 完全兼容 Edge Runtime 的简化版本
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.***REMOVED***;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: '环境变量配置错误'
      }, { status: 500 });
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
        return NextResponse.json({
          success: false,
          error: '您已经申请过这个职位了'
        }, { status: 400 });
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
      return NextResponse.json({
        success: false,
        error: '申请提交失败，请稍后重试'
      }, { status: 500 });
    }

    const applications = await insertResponse.json();
    const application = applications[0];

    return NextResponse.json({
      success: true,
      message: '申请提交成功！我们会尽快与您联系。',
      data: { applicationId: application.id }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
