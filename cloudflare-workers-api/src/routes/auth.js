/**
 * 用户认证 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleAuthAPI(request, env, path, method) {
  // 登录
  if (path === '/api/auth/login' && method === 'POST') {
    return await handleLogin(request, env);
  }
  
  // 注册
  if (path === '/api/auth/register' && method === 'POST') {
    return await handleRegister(request, env);
  }
  
  // 获取用户信息
  if (path === '/api/auth/user' && method === 'GET') {
    return await handleGetUser(request, env);
  }
  
  // 刷新令牌
  if (path === '/api/auth/refresh' && method === 'POST') {
    return await handleRefreshToken(request, env);
  }
  
  // 登出
  if (path === '/api/auth/logout' && method === 'POST') {
    return await handleLogout(request, env);
  }

  return new Response(JSON.stringify({
    success: false,
    error: '认证端点不存在或方法不支持'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 登录处理
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: '邮箱和密码不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 调用 Supabase Auth API
    const authResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: '登录失败，请检查邮箱和密码',
        details: authData.error_description || authData.msg
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '登录成功',
      data: {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        user: authData.user
      },
      runtime: 'Cloudflare Workers - 认证服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
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

// 注册处理
async function handleRegister(request, env) {
  try {
    const body = await request.json();
    const { email, password, fullName, role = 'candidate' } = body;

    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({
        success: false,
        error: '邮箱、密码和姓名不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 调用 Supabase Auth API 注册
    const authResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        data: {
          full_name: fullName,
          role: role
        }
      })
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: '注册失败',
        details: authData.error_description || authData.msg
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '注册成功，请检查邮箱验证链接',
      data: {
        user: authData.user,
        session: authData.session
      },
      runtime: 'Cloudflare Workers - 认证服务'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
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

// 获取用户信息
async function handleGetUser(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: '未提供有效的认证令牌'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const token = authHeader.substring(7);

    // 调用 Supabase Auth API 获取用户信息
    const userResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的认证令牌'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const userData = await userResponse.json();

    return new Response(JSON.stringify({
      success: true,
      data: userData,
      runtime: 'Cloudflare Workers - 认证服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
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

// 刷新令牌
async function handleRefreshToken(request, env) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return new Response(JSON.stringify({
        success: false,
        error: '刷新令牌不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 调用 Supabase Auth API 刷新令牌
    const refreshResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refresh_token
      })
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: '刷新令牌失败',
        details: refreshData.error_description || refreshData.msg
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '令牌刷新成功',
      data: {
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_in: refreshData.expires_in
      },
      runtime: 'Cloudflare Workers - 认证服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('刷新令牌错误:', error);
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

// 登出处理
async function handleLogout(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: '未提供有效的认证令牌'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const token = authHeader.substring(7);

    // 调用 Supabase Auth API 登出
    const logoutResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${token}`
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: '登出成功',
      runtime: 'Cloudflare Workers - 认证服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('登出错误:', error);
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
