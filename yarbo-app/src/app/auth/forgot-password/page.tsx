"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMessage("密码重置邮件已发送，请检查您的邮箱");
      setIsSubmitted(true);
    } catch (err) {
      console.error("密码重置错误:", err);
      setError("发送重置邮件时发生错误，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  邮件已发送
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  我们已向您的邮箱发送了密码重置链接
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  请检查您的邮箱 <strong>{email}</strong> 并点击重置链接来设置新密码。
                </p>
                <p className="text-xs text-gray-500">
                  如果您没有收到邮件，请检查垃圾邮件文件夹或稍后重试。
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                    setMessage(null);
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  重新发送
                </Button>
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="w-full"
                >
                  返回登录
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 左侧信息 */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              忘记密码？
            </h1>
            <p className="text-xl text-gray-600">
              不用担心，我们会帮您找回账号访问权限
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">输入邮箱地址</h3>
                <p className="text-sm text-gray-600">输入您注册时使用的邮箱地址</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">检查邮箱</h3>
                <p className="text-sm text-gray-600">我们会发送重置链接到您的邮箱</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">设置新密码</h3>
                <p className="text-sm text-gray-600">点击链接并设置新的安全密码</p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧表单 */}
        <div className="max-w-md mx-auto w-full">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  重置密码
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  输入您的邮箱地址，我们将发送重置链接
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 错误提示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* 成功提示 */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 text-sm">{message}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入您的邮箱地址"
                    required
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>发送中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>发送重置邮件</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>返回登录</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
