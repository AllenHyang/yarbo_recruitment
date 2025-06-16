/**
 * 消息 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleMessagesAPI(request, env, path, method) {
  // 获取消息列表
  if (path === '/api/messages' && method === 'GET') {
    return await handleGetMessages(request, env);
  }
  
  // 创建消息
  if (path === '/api/messages' && method === 'POST') {
    return await handleCreateMessage(request, env);
  }
  
  // 更新消息状态
  if (path.startsWith('/api/messages/') && method === 'PATCH') {
    const messageId = path.split('/')[3];
    return await handleUpdateMessage(request, env, messageId);
  }
  
  // 删除消息
  if (path.startsWith('/api/messages/') && method === 'DELETE') {
    const messageId = path.split('/')[3];
    return await handleDeleteMessage(request, env, messageId);
  }

  return new Response(JSON.stringify({
    success: false,
    error: '消息端点不存在或方法不支持'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 验证用户认证
async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const userResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return null;
    }

    return await userResponse.json();
  } catch (error) {
    console.error('认证验证错误:', error);
    return null;
  }
}

// 获取消息列表
async function handleGetMessages(request, env) {
  try {
    // 验证用户认证
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: '未授权访问，请先登录'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const limit = url.searchParams.get('limit') || '20';
    const page = url.searchParams.get('page') || '1';

    // 构建查询条件
    let queryParams = `receiver_id=eq.${userId}&limit=${limit}&offset=${(parseInt(page) - 1) * parseInt(limit)}&order=created_at.desc`;
    
    if (status) {
      queryParams += `&status=eq.${status}`;
    }
    
    if (type) {
      queryParams += `&type=eq.${type}`;
    }

    // 查询消息
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?${queryParams}`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('查询消息失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '查询消息失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const messages = await response.json();

    // 查询未读消息数量
    const unreadResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?receiver_id=eq.${userId}&status=eq.unread&select=count`, {
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    let unreadCount = 0;
    if (unreadResponse.ok) {
      const countHeader = unreadResponse.headers.get('Content-Range');
      unreadCount = countHeader ? parseInt(countHeader.split('/')[1]) : 0;
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        messages: messages,
        unreadCount: unreadCount
      },
      runtime: 'Cloudflare Workers - 消息服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取消息错误:', error);
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

// 创建消息
async function handleCreateMessage(request, env) {
  try {
    // 验证用户认证
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: '未授权访问，请先登录'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const body = await request.json();
    const { receiverId, title, content, type = 'general', priority = 'normal', metadata } = body;

    if (!receiverId || !title || !content) {
      return new Response(JSON.stringify({
        success: false,
        error: '接收者ID、标题和内容不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 创建消息
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sender_id: user.id,
        receiver_id: receiverId,
        title: title,
        content: content,
        type: type,
        priority: priority,
        status: 'unread',
        metadata: metadata,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('创建消息失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '创建消息失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const messages = await response.json();
    const message = messages[0];

    return new Response(JSON.stringify({
      success: true,
      message: '消息创建成功',
      data: message,
      runtime: 'Cloudflare Workers - 消息服务'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('创建消息错误:', error);
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

// 更新消息状态
async function handleUpdateMessage(request, env, messageId) {
  try {
    // 验证用户认证
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: '未授权访问，请先登录'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const body = await request.json();
    const { status, userId } = body;

    // 更新消息状态
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}&receiver_id=eq.${userId || user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status,
        read_at: status === 'read' ? new Date().toISOString() : null
      })
    });

    if (!response.ok) {
      console.error('更新消息状态失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '更新消息状态失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '消息状态更新成功',
      runtime: 'Cloudflare Workers - 消息服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('更新消息状态错误:', error);
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

// 删除消息
async function handleDeleteMessage(request, env, messageId) {
  try {
    // 验证用户认证
    const user = await verifyAuth(request, env);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: '未授权访问，请先登录'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    // 删除消息
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}&receiver_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });

    if (!response.ok) {
      console.error('删除消息失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '删除消息失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: '消息删除成功',
      runtime: 'Cloudflare Workers - 消息服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('删除消息错误:', error);
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
