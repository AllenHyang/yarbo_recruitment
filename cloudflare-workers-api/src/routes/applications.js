/**
 * 申请 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleApplicationsAPI(request, env, path, method) {
  // 处理申请提交
  if (path === '/api/applications/submit' && method === 'POST') {
    try {
      // 解析请求数据
      const body = await request.json();
      const { jobId, candidateId, coverLetter, resumeUrl } = body;

      // 验证必需字段
      if (!jobId || !candidateId) {
        return new Response(JSON.stringify({
          success: false,
          error: '缺少必需字段',
          required: ['jobId', 'candidateId']
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 验证环境变量
      if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.***REMOVED***) {
        return new Response(JSON.stringify({
          success: false,
          error: '环境变量配置错误'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 检查是否已经申请过
      const checkUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/applications?job_id=eq.${jobId}&candidate_id=eq.${candidateId}&select=id`;
      const checkResponse = await fetch(checkUrl, {
        headers: {
          'apikey': env.***REMOVED***,
          'Authorization': `Bearer ${env.***REMOVED***}`,
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
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // 提交申请
      const insertUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/applications`;
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'apikey': env.***REMOVED***,
          'Authorization': `Bearer ${env.***REMOVED***}`,
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
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const applications = await insertResponse.json();
      const application = applications[0];

      return new Response(JSON.stringify({
        success: true,
        message: '申请提交成功！我们会尽快与您联系。',
        data: { 
          applicationId: application.id,
          submittedAt: application.applied_at
        },
        runtime: 'Cloudflare Workers - 原生实现'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Applications API 错误:', error);
      return new Response(JSON.stringify({
        success: false,
        error: '服务器内部错误',
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }

  return new Response(JSON.stringify({
    success: false,
    error: '方法不支持或路径错误'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
