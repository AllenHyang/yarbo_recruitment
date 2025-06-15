/**
 * 文件上传 API 路由
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleUploadAPI(request, env, path, method) {
  // 上传简历
  if (path === '/api/upload/resume' && method === 'POST') {
    return await handleResumeUpload(request, env);
  }
  
  // 上传头像
  if (path === '/api/upload/avatar' && method === 'POST') {
    return await handleAvatarUpload(request, env);
  }
  
  // 获取上传签名 URL
  if (path === '/api/upload/signed-url' && method === 'POST') {
    return await handleGetSignedUrl(request, env);
  }
  
  // 删除文件
  if (path.startsWith('/api/upload/delete/') && method === 'DELETE') {
    const fileName = path.split('/').pop();
    return await handleDeleteFile(request, env, fileName);
  }

  return new Response(JSON.stringify({
    success: false,
    error: '上传端点不存在或方法不支持'
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

// 简历上传处理
async function handleResumeUpload(request, env) {
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

    const formData = await request.formData();
    const file = formData.get('file');
    const fileName = formData.get('fileName') || file.name;

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: '未找到上传文件'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 验证文件类型
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: '只支持 PDF、DOC、DOCX 格式的简历文件'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({
        success: false,
        error: '文件大小不能超过 5MB'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const uniqueFileName = `resumes/${user.id}/${timestamp}_${fileName}`;

    // 上传到 Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/resumes/${uniqueFileName}`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('文件上传失败:', errorData);
      return new Response(JSON.stringify({
        success: false,
        error: '文件上传失败',
        details: errorData
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 生成文件访问 URL
    const fileUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resumes/${uniqueFileName}`;

    // 保存文件记录到数据库
    const recordResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_files`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        file_name: fileName,
        file_path: uniqueFileName,
        file_url: fileUrl,
        file_type: 'resume',
        file_size: file.size,
        mime_type: file.type
      })
    });

    let fileRecord = null;
    if (recordResponse.ok) {
      const records = await recordResponse.json();
      fileRecord = records[0];
    }

    return new Response(JSON.stringify({
      success: true,
      message: '简历上传成功',
      data: {
        fileName: fileName,
        filePath: uniqueFileName,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        fileId: fileRecord?.id
      },
      runtime: 'Cloudflare Workers - 文件上传服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('简历上传错误:', error);
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

// 头像上传处理
async function handleAvatarUpload(request, env) {
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

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: '未找到上传文件'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        error: '只支持 JPEG、PNG、GIF、WebP 格式的图片文件'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 验证文件大小 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return new Response(JSON.stringify({
        success: false,
        error: '图片大小不能超过 2MB'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFileName = `avatars/${user.id}/${timestamp}.${extension}`;

    // 上传到 Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/${uniqueFileName}`, {
      method: 'POST',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': file.type,
        'x-upsert': 'true'
      },
      body: fileBuffer
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('头像上传失败:', errorData);
      return new Response(JSON.stringify({
        success: false,
        error: '头像上传失败',
        details: errorData
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 生成文件访问 URL
    const avatarUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${uniqueFileName}`;

    // 更新用户头像 URL
    const updateResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?user_id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatar_url: avatarUrl
      })
    });

    return new Response(JSON.stringify({
      success: true,
      message: '头像上传成功',
      data: {
        avatarUrl: avatarUrl,
        fileName: uniqueFileName,
        fileSize: file.size
      },
      runtime: 'Cloudflare Workers - 文件上传服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('头像上传错误:', error);
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

// 获取签名 URL
async function handleGetSignedUrl(request, env) {
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
    const { fileName, fileType, bucket = 'resumes' } = body;

    if (!fileName || !fileType) {
      return new Response(JSON.stringify({
        success: false,
        error: '文件名和文件类型不能为空'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 生成唯一文件路径
    const timestamp = Date.now();
    const uniqueFileName = `${bucket}/${user.id}/${timestamp}_${fileName}`;

    // 生成签名 URL（这里简化处理，实际应该调用 Supabase Storage API）
    const signedUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${uniqueFileName}`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        signedUrl: signedUrl,
        filePath: uniqueFileName,
        expiresIn: 3600 // 1小时
      },
      runtime: 'Cloudflare Workers - 文件上传服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('获取签名URL错误:', error);
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

// 删除文件
async function handleDeleteFile(request, env, fileName) {
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

    // 删除 Supabase Storage 中的文件
    const deleteResponse = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${fileName}`, {
      method: 'DELETE',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`
      }
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.text();
      console.error('文件删除失败:', errorData);
      return new Response(JSON.stringify({
        success: false,
        error: '文件删除失败',
        details: errorData
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // 删除数据库中的文件记录
    await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_files?file_path=eq.${fileName}&user_id=eq.${user.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': env.***REMOVED***,
        'Authorization': `Bearer ${env.***REMOVED***}`
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: '文件删除成功',
      runtime: 'Cloudflare Workers - 文件上传服务'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('文件删除错误:', error);
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
