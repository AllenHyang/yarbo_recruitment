/*
 * @Author: Allen
 * @Date: 2025-06-08 23:42:26
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 00:11:18
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/auth/login/page.tsx
 * @Description: 
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogIn, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserRole } from "@/lib/api";
import { getDefaultHomePage } from "@/lib/permissions";
import { AdvancedCaptcha } from "@/components/ui/advanced-captcha";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaSessionToken, setCaptchaSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    // 验证验证码
    if (!isCaptchaValid || !captchaSessionToken) {
      setError("请输入正确的验证码");
      setIsLoading(false);
      return;
    }

    try {
      // 先验证验证码是否仍然有效
      const captchaResponse = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: captchaSessionToken,
          captchaCode: 'VERIFY_ONLY' // 特殊标记，只验证会话是否有效
        }),
      });

      if (!captchaResponse.ok) {
        setError("验证码已失效，请重新验证");
        setIsCaptchaValid(false);
        setCaptchaSessionToken(null);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setMessage("登录成功！正在跳转...");

        // 立即跳转，不等待角色获取
        if (redirectTo) {
          // 如果有重定向参数，跳转到指定页面
          console.log("重定向到:", redirectTo);
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        } else {
          // 根据邮箱简单判断角色并跳转
          let targetPage = "/";

          if (email.includes("admin")) {
            targetPage = "/admin/dashboard";
          } else if (email.includes("hr")) {
            targetPage = "/hr/dashboard";
          } else {
            targetPage = "/jobs";
          }

          console.log("根据邮箱判断跳转到:", targetPage);

          // 同时尝试获取准确的用户角色
          getUserRole(email).then((userRole) => {
            console.log("获取到准确用户角色:", userRole);
            if (userRole) {
              const accuratePage = getDefaultHomePage(userRole);
              console.log("准确的默认页面:", accuratePage);
              // 如果准确页面与简单判断不同，再次跳转
              if (accuratePage !== targetPage) {
                setTimeout(() => {
                  router.push(accuratePage);
                }, 500);
              }
            }
          }).catch((roleError) => {
            console.error("获取用户角色失败，使用简单判断:", roleError);
          });

          // 立即跳转到简单判断的页面
          setTimeout(() => {
            router.push(targetPage);
          }, 1000);
        }
      }
    } catch (err) {
      console.error("登录错误:", err);
      setError("登录过程中发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* 返回导航 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回首页</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mx-auto">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  登录 Yarbo 招聘
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  欢迎回来！请输入您的账号信息
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              {/* 状态提示 */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-700">{message}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Mail className="h-4 w-4" />
                    <span>邮箱</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入您的邮箱"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Lock className="h-4 w-4" />
                    <span>密码</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入您的密码"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 安全验证 */}
                <AdvancedCaptcha
                  onValidationChange={(isValid, sessionToken) => {
                    setIsCaptchaValid(isValid);
                    setCaptchaSessionToken(sessionToken || null);
                  }}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>登录中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>登录</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* 链接区域 */}
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <Link
                    href="/auth/register"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    还没有账号？立即注册
                  </Link>
                </div>

                <div className="text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    忘记密码？
                  </Link>
                </div>
              </div>

              {/* 演示账号 */}
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">演示账号</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div><strong>管理员:</strong> admin@yarbo.com / password123</div>
                  <div><strong>HR:</strong> hr@yarbo.com / password123</div>
                  <div><strong>候选人:</strong> test.candidate@gmail.com / password123</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
