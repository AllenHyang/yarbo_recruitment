/**
 * 验证码 API 路由处理器
 * 提供验证码生成和验证功能
 */

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleCaptchaAPI(request, env, path, method) {
  // 生成验证码
  if (path === '/api/captcha/generate' && method === 'POST') {
    return await handleGenerateCaptcha(request, env);
  }

  // 验证验证码
  if (path === '/api/captcha/verify' && method === 'POST') {
    return await handleVerifyCaptcha(request, env);
  }

  return new Response(JSON.stringify({
    success: false,
    error: '验证码端点不存在或方法不支持'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 生成验证码
async function handleGenerateCaptcha(request, env) {
  try {
    // 生成4位数字验证码
    const captchaCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 生成会话令牌
    const sessionToken = generateSessionToken();

    // 创建验证码数据（在实际应用中，这应该存储在数据库或缓存中）
    const captchaData = {
      sessionToken,
      captchaCode,
      timestamp: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
      verified: false
    };

    // 在实际应用中，这里应该将验证码数据存储到 KV 存储或数据库
    // 为了演示，我们将其编码到 sessionToken 中
    const encodedData = btoa(JSON.stringify(captchaData));

    return new Response(JSON.stringify({
      success: true,
      sessionToken: encodedData,
      captchaCode: captchaCode, // 在生产环境中不应该返回验证码
      expiresIn: 300, // 5分钟
      message: '验证码生成成功'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('生成验证码错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '生成验证码失败',
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

// 验证验证码
async function handleVerifyCaptcha(request, env) {
  try {
    const body = await request.json();
    const { sessionToken, captchaCode } = body;

    if (!sessionToken || !captchaCode) {
      return new Response(JSON.stringify({
        success: false,
        error: '会话令牌和验证码不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    try {
      // 解码验证码数据
      const captchaData = JSON.parse(atob(sessionToken));

      // 检查是否过期
      if (Date.now() > captchaData.expiresAt) {
        return new Response(JSON.stringify({
          success: false,
          error: '验证码已过期，请重新获取'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 检查是否已经验证过
      if (captchaData.verified) {
        return new Response(JSON.stringify({
          success: false,
          error: '验证码已使用，请重新获取'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 验证验证码
      // 特殊处理：如果是 VERIFY_ONLY，只验证会话是否有效，不验证具体验证码
      if (captchaCode !== 'VERIFY_ONLY' && captchaCode !== captchaData.captchaCode) {
        return new Response(JSON.stringify({
          success: false,
          error: '验证码错误，请重新输入'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 验证成功
      return new Response(JSON.stringify({
        success: true,
        message: '验证码验证成功',
        verified: true
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (decodeError) {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的会话令牌'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

  } catch (error) {
    console.error('验证验证码错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '验证验证码失败',
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

// 生成会话令牌
function generateSessionToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
