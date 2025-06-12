"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasPageAccess, getDefaultHomePage, getRoleDisplayName } from "@/lib/permissions";
import type { UserRole } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

// 原有的简单权限检查组件（向后兼容）
export function withProtected(
  WrappedComponent: React.ComponentType,
  allowedRoles: UserRole[]
) {
  return function ProtectedRoute(props: any) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace("/auth/login");
        } else if (userRole && !allowedRoles.includes(userRole)) {
          router.replace("/unauthorized");
        }
      }
    }, [user, userRole, loading, router]);

    if (loading || !user || (userRole && !allowedRoles.includes(userRole))) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// 新的基于路径的权限检查组件
export function withRoleBasedAccess(WrappedComponent: React.ComponentType) {
  return function RoleBasedRoute(props: any) {
    const { user, userRole, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
      if (!loading) {
        // 检查页面访问权限
        const hasAccess = hasPageAccess(userRole, pathname);

        if (!hasAccess) {
          if (!user) {
            // 未登录，跳转到登录页
            router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
          } else {
            // 已登录但无权限，显示权限不足页面
            setAccessDenied(true);
          }
        } else {
          setAccessDenied(false);
        }
      }
    }, [user, userRole, loading, pathname, router]);

    // 加载中
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    // 权限不足
    if (accessDenied) {
      return <AccessDeniedPage userRole={userRole} />;
    }

    return <WrappedComponent {...props} />;
  };
}

// 权限不足页面组件
function AccessDeniedPage({ userRole }: { userRole: UserRole | null }) {
  const router = useRouter();

  const handleGoHome = () => {
    const homePage = getDefaultHomePage(userRole);
    router.push(homePage);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            访问被拒绝
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            抱歉，您当前的权限级别
            {userRole && (
              <span className="font-medium text-blue-600">
                （{getRoleDisplayName(userRole)}）
              </span>
            )}
            无法访问此页面。
          </p>

          <p className="text-sm text-gray-500">
            如果您认为这是一个错误，请联系系统管理员。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回上页</span>
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>回到首页</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}