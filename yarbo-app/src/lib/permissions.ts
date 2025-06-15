import type { UserRole } from './database.types';

// 权限配置
export const PERMISSIONS = {
  // 页面访问权限
  PAGES: {
    // 公开页面 - 所有人可访问
    PUBLIC: [
      '/',
      '/jobs',
      '/jobs/[id]',
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/about',
      '/contact',
      '/campus-recruitment',
      '/internship-recruitment'
    ],

    // 候选人页面
    CANDIDATE: [
      '/profile',
      '/applications',
      '/applications/[id]',
      '/status',
      '/apply',
      '/apply/[id]',
      '/offers',
      '/offers/[id]',
      '/campus-recruitment',
      '/internship-recruitment'
    ],

    // HR页面
    HR: [
      '/hr/dashboard',
      '/hr/jobs',
      '/hr/jobs/create',
      '/hr/jobs/[id]',
      '/hr/jobs/[id]/edit',
      '/hr/applications',
      '/hr/applications/[id]',
      '/hr/candidates',
      '/hr/candidates/[id]',
      '/hr/interviews',
      '/hr/interviews/create',
      '/hr/interviews/[id]',
      '/hr/departments',
      '/hr/departments/[id]',
      '/hr/reports',
      '/hr/analytics',
      '/hr/campus',
      '/hr/internship',
      '/hr/offers',
      '/hr/offers/[id]'
    ],

    // 管理员页面
    ADMIN: [
      '/admin/dashboard',
      '/admin/users',
      '/admin/users/[id]',
      '/admin/departments',
      '/admin/departments/[id]',
      '/admin/settings',
      '/admin/system',
      '/admin/logs',
      '/admin/backup',
      '/admin/offers',
      '/admin/offers/[id]'
    ],

    // 测试页面 - 仅开发环境
    TEST: [
      '/test/realtime',
      '/test/components',
      '/test/api'
    ]
  },

  // 功能权限
  FEATURES: {
    // 候选人权限
    CANDIDATE: [
      'view_public_jobs',
      'apply_for_jobs',
      'view_own_applications',
      'edit_own_profile',
      'upload_resume',
      'view_application_status'
    ],

    // HR权限
    HR: [
      'view_all_jobs',
      'create_jobs',
      'edit_jobs',
      'delete_jobs',
      'view_applications',
      'review_applications',
      'schedule_interviews',
      'view_candidates',
      'contact_candidates',
      'manage_departments',
      'view_departments',
      'create_departments',
      'edit_departments',
      'delete_departments',
      'generate_reports',
      'view_analytics',
      'manage_campus_recruitment',
      'manage_internships'
    ],

    // 管理员权限
    ADMIN: [
      'manage_users',
      'manage_departments',
      'manage_hr_assignments',
      'view_system_logs',
      'manage_system_settings',
      'backup_restore',
      'view_all_data',
      'delete_sensitive_data'
    ]
  }
} as const;

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, {
  pages: string[];
  features: string[];
}> = {
  candidate: {
    pages: [
      ...PERMISSIONS.PAGES.PUBLIC,
      ...PERMISSIONS.PAGES.CANDIDATE
    ],
    features: PERMISSIONS.FEATURES.CANDIDATE
  },
  hr: {
    pages: [
      ...PERMISSIONS.PAGES.PUBLIC,
      ...PERMISSIONS.PAGES.CANDIDATE,
      ...PERMISSIONS.PAGES.HR
    ],
    features: [
      ...PERMISSIONS.FEATURES.CANDIDATE,
      ...PERMISSIONS.FEATURES.HR
    ]
  },
  admin: {
    pages: [
      ...PERMISSIONS.PAGES.PUBLIC,
      ...PERMISSIONS.PAGES.CANDIDATE,
      ...PERMISSIONS.PAGES.HR,
      ...PERMISSIONS.PAGES.ADMIN,
      ...(process.env.NODE_ENV === 'development' ? PERMISSIONS.PAGES.TEST : [])
    ],
    features: [
      ...PERMISSIONS.FEATURES.CANDIDATE,
      ...PERMISSIONS.FEATURES.HR,
      ...PERMISSIONS.FEATURES.ADMIN
    ]
  }
};

// 权限检查函数
export function hasPageAccess(userRole: UserRole | null, pathname: string): boolean {
  // 未登录用户只能访问公开页面
  if (!userRole) {
    return PERMISSIONS.PAGES.PUBLIC.some(page =>
      matchRoute(page, pathname)
    );
  }

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.pages.some(page =>
    matchRoute(page, pathname)
  );
}

export function hasFeatureAccess(userRole: UserRole | null, feature: string): boolean {
  if (!userRole) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.features.includes(feature);
}

// 路由匹配函数
function matchRoute(pattern: string, pathname: string): boolean {
  // 精确匹配
  if (pattern === pathname) return true;

  // 动态路由匹配 [id]
  const patternParts = pattern.split('/');
  const pathnameParts = pathname.split('/');

  if (patternParts.length !== pathnameParts.length) return false;

  return patternParts.every((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      // 动态路由段，匹配任何值
      return true;
    }
    return part === pathnameParts[index];
  });
}

// 获取用户默认首页
export function getDefaultHomePage(userRole: UserRole | null): string {
  switch (userRole) {
    case 'admin':
      return '/admin/dashboard';
    case 'hr':
      return '/hr/dashboard';
    case 'candidate':
      return '/jobs';
    default:
      return '/';
  }
}

// 获取角色显示名称
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: '系统管理员',
    hr: 'HR专员',
    candidate: '求职者'
  };
  return roleNames[role];
}

// 获取角色颜色主题
export function getRoleColorTheme(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    admin: 'red',
    hr: 'blue',
    candidate: 'green'
  };
  return roleColors[role];
}

// 检查是否为受保护的路由
export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ['/hr/', '/admin/', '/profile', '/applications', '/offers'];
  return protectedPrefixes.some(prefix => pathname.startsWith(prefix));
}

// 检查是否为管理员路由
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin/');
}

// 检查是否为HR路由
export function isHRRoute(pathname: string): boolean {
  return pathname.startsWith('/hr/');
}

// 检查是否为候选人路由
export function isCandidateRoute(pathname: string): boolean {
  const candidateRoutes = ['/profile', '/applications', '/status', '/apply', '/offers'];
  return candidateRoutes.some(route => pathname.startsWith(route));
}
