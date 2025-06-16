"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdvancedCaptcha } from "@/components/ui/advanced-captcha";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "candidate" as "candidate" | "hr"
  });
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [captchaSessionToken, setCaptchaSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
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

    // 表单验证
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("密码长度至少需要6位");
      setIsLoading(false);
      return;
    }

    try {
      // 先验证验证码是否仍然有效
      // 使用 Cloudflare Workers API
      const workersApiUrl = process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
        : 'http://localhost:8787';

      const captchaResponse = await fetch(`${workersApiUrl}/api/captcha/verify`, {
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

      // 1. 注册用户
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
          }
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setMessage("注册成功！请检查您的邮箱以验证账号。");

        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    } catch (err) {
      console.error("注册错误:", err);
      setError("注册过程中发生错误，请重试");
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
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回登录</span>
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center mx-auto">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  注册 Yarbo 账号
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  加入我们，开启职业新篇章
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

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <User className="h-4 w-4" />
                    <span>姓名</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="请输入您的姓名"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Mail className="h-4 w-4" />
                    <span>邮箱</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="请输入您的邮箱"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">角色</Label>
                  <Select value={formData.role} onValueChange={(value: string) => handleInputChange("role", value)}>
                    <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="选择您的角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">求职者</SelectItem>
                      <SelectItem value="hr">HR人事</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Lock className="h-4 w-4" />
                    <span>密码</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="请输入密码（至少6位）"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center space-x-2 text-gray-700 font-medium">
                    <Lock className="h-4 w-4" />
                    <span>确认密码</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="请再次输入密码"
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
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>注册中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="h-4 w-4" />
                      <span>注册</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* 链接区域 */}
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  已有账号？立即登录
                </Link>
              </div>

              {/* 注册说明 */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs text-blue-700 space-y-1">
                  <div>• 求职者可以浏览和申请职位</div>
                  <div>• HR可以管理招聘流程</div>
                  <div>• 注册后需要邮箱验证</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 