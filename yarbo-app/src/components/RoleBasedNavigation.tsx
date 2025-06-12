"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPageAccess, getRoleDisplayName, getRoleColorTheme } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Briefcase,
  FileText,
  BarChart3,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  Calendar,
  GraduationCap,
  UserCheck,
  Shield,
  Database,
  MessageSquare
} from 'lucide-react';
import { UnreadMessageBadge } from './UnreadMessageBadge';
import { NotificationCenter } from './NotificationCenter';
import type { UserRole } from '@/lib/database.types';

// 导航项配置
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: '首页',
    href: '/',
    icon: Home,
    roles: ['admin', 'hr', 'candidate']
  },
  {
    label: '职位',
    href: '/jobs',
    icon: Briefcase,
    roles: ['admin', 'hr', 'candidate']
  },
  {
    label: '申请状态',
    href: '/status',
    icon: FileText,
    roles: ['candidate']
  },
  {
    label: '消息中心',
    href: '/messages',
    icon: MessageSquare,
    roles: ['admin', 'hr', 'candidate']
  },
  {
    label: 'HR管理',
    href: '/hr/dashboard',
    icon: BarChart3,
    roles: ['admin', 'hr'],
    children: [
      {
        label: 'HR仪表板',
        href: '/hr/dashboard',
        icon: BarChart3,
        roles: ['admin', 'hr']
      },
      {
        label: '职位管理',
        href: '/hr/jobs',
        icon: Briefcase,
        roles: ['admin', 'hr']
      },
      {
        label: '申请管理',
        href: '/hr/applications',
        icon: FileText,
        roles: ['admin', 'hr']
      },
      {
        label: '候选人管理',
        href: '/hr/candidates',
        icon: Users,
        roles: ['admin', 'hr']
      },
      {
        label: '面试管理',
        href: '/hr/interviews',
        icon: Calendar,
        roles: ['admin', 'hr']
      },
      {
        label: '数据分析',
        href: '/hr/analytics',
        icon: BarChart3,
        roles: ['admin', 'hr']
      },
      {
        label: '报告中心',
        href: '/hr/reports',
        icon: FileText,
        roles: ['admin', 'hr']
      },
      {
        label: '校园招聘',
        href: '/hr/campus',
        icon: GraduationCap,
        roles: ['admin', 'hr']
      },
      {
        label: '实习管理',
        href: '/hr/internship',
        icon: UserCheck,
        roles: ['admin', 'hr']
      }
    ]
  },
  {
    label: '系统管理',
    href: '/admin/dashboard',
    icon: Shield,
    roles: ['admin'],
    children: [
      {
        label: '管理仪表板',
        href: '/admin/dashboard',
        icon: BarChart3,
        roles: ['admin']
      },
      {
        label: '用户管理',
        href: '/admin/users',
        icon: Users,
        roles: ['admin']
      },
      {
        label: '部门管理',
        href: '/admin/departments',
        icon: Building2,
        roles: ['admin']
      },
      {
        label: '系统设置',
        href: '/admin/settings',
        icon: Settings,
        roles: ['admin']
      },
      {
        label: '系统日志',
        href: '/admin/logs',
        icon: FileText,
        roles: ['admin']
      }
    ]
  }
];

// 开发环境测试导航
const devNavigationItems: NavItem[] = [
  {
    label: '测试页面',
    href: '/test/realtime',
    icon: Database,
    roles: ['admin'],
    badge: 'DEV'
  }
];

export function RoleBasedNavigation() {
  const { user, userRole, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 过滤用户可访问的导航项
  const getAccessibleNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!userRole) return false;
      return item.roles.includes(userRole) && hasPageAccess(userRole, item.href);
    }).map(item => ({
      ...item,
      children: item.children ? getAccessibleNavItems(item.children) : undefined
    }));
  };

  const accessibleItems = getAccessibleNavItems(navigationItems);
  const accessibleDevItems = process.env.NODE_ENV === 'development'
    ? getAccessibleNavItems(devNavigationItems)
    : [];

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Y</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Yarbo Inc.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {accessibleItems.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-1 ${isActivePath(item.href) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            href={child.href}
                            className={`flex items-center space-x-2 ${isActivePath(child.href) ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                          >
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                )}
              </div>
            ))}

            {/* 开发环境测试链接 */}
            {accessibleDevItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActivePath(item.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <NotificationCenter />
                <UnreadMessageBadge userId={user.email} />
              </>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                    {userRole && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${getRoleColorTheme(userRole) === 'red' ? 'border-red-200 text-red-700' :
                          getRoleColorTheme(userRole) === 'blue' ? 'border-blue-200 text-blue-700' :
                            'border-green-200 text-green-700'
                          }`}
                      >
                        {getRoleDisplayName(userRole)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>个人资料</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost">登录</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>注册</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {accessibleItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActivePath(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                  {item.children && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3 py-2 rounded-md text-sm ${isActivePath(child.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-2">
                            <child.icon className="w-4 h-4" />
                            <span>{child.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
