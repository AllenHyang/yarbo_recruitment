"use client";

import Link from "next/link";
import { MountainIcon, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavigationBar() {
  const { user, userProfile, userRole, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case "admin":
        return "管理员";
      case "hr":
        return "HR";
      case "candidate":
        return "求职者";
      default:
        return "用户";
    }
  };

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center bg-background border-b">
      <Link href="/" className="flex items-center justify-center">
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Yarbo Inc.</span>
      </Link>
      
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="/"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          首页
        </Link>
        <Link
          href="/jobs"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          所有职位
        </Link>
        <Link
          href="/status"
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          申请状态
        </Link>
        <Link
          href="/hr/dashboard"
          className="text-sm font-medium hover:underline underline-offset-4 text-green-600"
        >
          HR管理
        </Link>
        
        {/* 认证相关导航 */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.user_profiles?.first_name || userProfile?.user_profiles?.last_name || user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600">
                    {getRoleDisplayName(userRole)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* 根据角色显示不同的菜单项 */}
              {userRole === "admin" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>管理后台</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              {userRole === "hr" && (
                <DropdownMenuItem asChild>
                  <Link href="/hr/dashboard" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>HR后台</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onSelect={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">登录</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">注册</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}