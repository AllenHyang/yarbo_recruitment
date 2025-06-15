/**
 * 通知 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleNotificationsAPI(request, env, path, method) {
  // 获取通知列表
  if (path === '/api/notifications' && method === 'GET') {
    return await handleGetNotifications(request, env);
  }
  
  // 创建通知
  if (path === '/api/notifications' && method === 'POST') {
    return await handleCreateNotification(request, env);
  }
  
  // 标记通知为已读
  if (path.startsWith('/api/notifications/') && path.endsWith('/read') && method === 'PATCH') {
    const notificationId = path.split('/')[3];
    return await handleMarkAsRead(request, env, notificationId);
  }
  
  // 删除通知
  if (path.startsWith('/api/notifications/') && method === 'DELETE') {
    const notificationId = path.split('/')[3];
    return await handleDeleteNotification(request, env, notificationId);
  }
  
  // 批量标记为已读
  if (path === '/api/notifications/mark-all-read' && method === 'PATCH') {
    return await handleMarkAllAsRead(request, env);
  }
  
  // 获取未读通知数量
  if (path === '/api/notifications/unread-count' && method === 'GET') {
    return await handleGetUnreadCount(request, env);
  }

  return new Response(JSON.stringify({
    success: false,
    error: '通知端点不存在或方法不支持'
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
        'apikey': env.***REMOVED***,
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

// 获取通知列表
async function handleGetNotifications(request, env) {
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
    const limit = url.searchParams.get('limit') || '20';
    const offset = url.searchParams.get('offset') || '0';
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    // 构建查询条件
    let queryParams = `user_id=eq.${user.id}&limit=${limit}&offset=${offset}&order=created_at.desc`;
    if (unreadOnly) {
      queryParams += '&is_read=eq.false';
    }

    // 查询通知
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?${queryParams}`, {
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('查询通知失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '查询通知失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const notifications = await response.json();

    return new Response(JSON.stringify({
      success: true,
      data: notifications,
      count: notifications.length,
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取通知错误:', error);
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

// 创建通知
async function handleCreateNotification(request, env) {
  try {
    // 验证用户认证（这里可能需要管理员权限）
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
    const { userId, title, message, type = 'info', actionUrl } = body;

    if (!userId || !title || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: '用户ID、标题和消息内容不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 创建通知
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        action_url: actionUrl,
        is_read: false,
        created_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('创建通知失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '创建通知失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const notifications = await response.json();
    const notification = notifications[0];

    return new Response(JSON.stringify({
      success: true,
      message: '通知创建成功',
      data: notification,
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('创建通知错误:', error);
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

// 标记通知为已读
async function handleMarkAsRead(request, env, notificationId) {
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

    // 更新通知状态
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?id=eq.${notificationId}&user_id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_read: true,
        read_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('标记通知已读失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '标记通知已读失败'
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
      message: '通知已标记为已读',
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('标记通知已读错误:', error);
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

// 删除通知
async function handleDeleteNotification(request, env, notificationId) {
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

    // 删除通知
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?id=eq.${notificationId}&user_id=eq.${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`
      }
    });

    if (!response.ok) {
      console.error('删除通知失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '删除通知失败'
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
      message: '通知删除成功',
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('删除通知错误:', error);
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

// 批量标记为已读
async function handleMarkAllAsRead(request, env) {
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

    // 批量更新通知状态
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?user_id=eq.${user.id}&is_read=eq.false`, {
      method: 'PATCH',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_read: true,
        read_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('批量标记已读失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '批量标记已读失败'
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
      message: '所有通知已标记为已读',
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('批量标记已读错误:', error);
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

// 获取未读通知数量
async function handleGetUnreadCount(request, env) {
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

    // 查询未读通知数量
    const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/notifications?user_id=eq.${user.id}&is_read=eq.false&select=count`, {
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });

    if (!response.ok) {
      console.error('查询未读通知数量失败:', response.statusText);
      return new Response(JSON.stringify({
        success: false,
        error: '查询未读通知数量失败'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    const countHeader = response.headers.get('Content-Range');
    const count = countHeader ? parseInt(countHeader.split('/')[1]) : 0;

    return new Response(JSON.stringify({
      success: true,
      data: { unreadCount: count },
      runtime: 'Cloudflare Workers - 通知服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取未读通知数量错误:', error);
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
