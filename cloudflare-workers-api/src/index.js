/**
 * Yarbo Recruitment API - Cloudflare Workers
 * 完全原生的 Cloudflare Workers 实现，避免 Next.js 兼容性问题
 */

// 导入路由处理器
import { handleJobsAPI } from './routes/jobs.js';
import { handleApplicationsAPI } from './routes/applications.js';
import { handleTestAPI } from './routes/test.js';
import { handleAuthAPI } from './routes/auth.js';
import { handleUploadAPI } from './routes/upload.js';
import { handleNotificationsAPI } from './routes/notifications.js';
import { handleMessagesAPI } from './routes/messages.js';
import { handleCaptchaAPI } from './routes/captcha.js';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 主要的请求处理器
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // 处理 CORS 预检请求
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: corsHeaders
        });
      }

      // 路由分发
      if (path.startsWith('/api/jobs')) {
        return await handleJobsAPI(request, env, path, method);
      }

      if (path.startsWith('/api/applications')) {
        return await handleApplicationsAPI(request, env, path, method);
      }

      if (path.startsWith('/api/auth')) {
        return await handleAuthAPI(request, env, path, method);
      }

      if (path.startsWith('/api/upload')) {
        return await handleUploadAPI(request, env, path, method);
      }

      if (path.startsWith('/api/notifications')) {
        return await handleNotificationsAPI(request, env, path, method);
      }

      if (path.startsWith('/api/messages')) {
        return await handleMessagesAPI(request, env, path, method);
      }

      if (path.startsWith('/api/captcha')) {
        return await handleCaptchaAPI(request, env, path, method);
      }

      if (path.startsWith('/api/test')) {
        return await handleTestAPI(request, env, path, method);
      }

      // 根路径 - API 信息
      if (path === '/' || path === '/api') {
        return new Response(JSON.stringify({
          success: true,
          message: '🎉 Yarbo Recruitment API',
          version: '1.0.0',
          runtime: 'Cloudflare Workers',
          timestamp: new Date().toISOString(),
          endpoints: [
            'GET /api/test - 测试端点',
            'GET /api/jobs - 获取职位列表',
            'POST /api/applications/submit - 提交申请',
            'POST /api/auth/login - 用户登录',
            'POST /api/auth/register - 用户注册',
            'GET /api/auth/user - 获取用户信息',
            'POST /api/upload/resume - 上传简历',
            'POST /api/upload/avatar - 上传头像',
            'GET /api/notifications - 获取通知列表',
            'PATCH /api/notifications/{id}/read - 标记通知已读',
            'GET /api/messages - 获取消息列表',
            'POST /api/messages - 创建消息'
          ]
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 404 处理
      return new Response(JSON.stringify({
        success: false,
        error: 'API 端点未找到',
        path: path
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker 错误:', error);
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
};
