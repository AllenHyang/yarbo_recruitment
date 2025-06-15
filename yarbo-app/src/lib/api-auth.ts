import { NextRequest } from 'next/server';
import { supabase } from './supabase';
import { getUserRole } from './api';
import { hasFeatureAccess } from './permissions';
import type { UserRole } from './database.types';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * 验证API请求的用户身份和权限
 */
export async function authenticateApiRequest(
  request: NextRequest,
  requiredFeature?: string
): Promise<{ success: true; user: AuthenticatedUser } | { success: false; error: string; status: number }> {
  try {
    // 从请求头获取Authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: '缺少认证令牌',
        status: 401
      };
    }

    const token = authHeader.substring(7);

    // 验证JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return {
        success: false,
        error: '无效的认证令牌',
        status: 401
      };
    }

    // 临时：为测试用户分配角色
    let userRole: UserRole = 'candidate'; // 默认角色

    if (user.email === 'hr@yarbo.com') {
      userRole = 'hr';
    } else if (user.email === 'admin@yarbo.com') {
      userRole = 'admin';
    }

    // 检查功能权限（如果指定了）
    if (requiredFeature && !hasFeatureAccess(userRole, requiredFeature)) {
      return {
        success: false,
        error: '权限不足',
        status: 403
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email!,
        role: userRole
      }
    };

  } catch (error) {
    console.error('API认证错误:', error);
    return {
      success: false,
      error: '认证服务错误',
      status: 500
    };
  }
}

/**
 * 验证用户是否为HR或管理员
 */
export async function requireHROrAdmin(request: NextRequest) {
  const authResult = await authenticateApiRequest(request, 'create_jobs');

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  if (!['hr', 'admin'].includes(user.role)) {
    return {
      success: false,
      error: '需要HR或管理员权限',
      status: 403
    };
  }

  return authResult;
}

/**
 * 验证用户是否为管理员
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  if (user.role !== 'admin') {
    return {
      success: false,
      error: '需要管理员权限',
      status: 403
    };
  }

  return authResult;
}

/**
 * 验证用户是否为候选人
 */
export async function requireCandidate(request: NextRequest) {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  if (user.role !== 'candidate') {
    return {
      success: false,
      error: '只有候选人可以申请职位',
      status: 403
    };
  }

  return authResult;
}

/**
 * 验证用户是否可以访问特定资源
 */
export async function requireResourceAccess(
  request: NextRequest,
  resourceOwnerId: string,
  allowedRoles: UserRole[] = ['admin']
) {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.success) {
    return authResult;
  }

  const { user } = authResult;

  // 用户可以访问自己的资源，或者具有特定角色
  if (user.id === resourceOwnerId || allowedRoles.includes(user.role)) {
    return authResult;
  }

  return {
    success: false,
    error: '无权限访问此资源',
    status: 403
  };
}
