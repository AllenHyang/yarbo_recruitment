"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Calendar, Eye, Lock, Database, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">隐私政策</h1>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>最后更新：2024年6月15日</span>
          </div>
        </div>

        {/* 重要提示 */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">隐私承诺</h3>
                <p className="text-green-700 text-sm">
                  我们承诺保护您的隐私。本政策说明我们如何收集、使用、存储和保护您的个人信息。
                  我们严格遵守相关法律法规，确保您的个人信息安全。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 政策内容 */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">1.</span>
                信息收集
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们可能收集以下类型的个人信息：
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">基本信息</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>姓名、邮箱地址、电话号码</li>
                    <li>教育背景、工作经历</li>
                    <li>简历和求职相关文档</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">技术信息</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>IP地址、浏览器类型和版本</li>
                    <li>设备信息、操作系统</li>
                    <li>访问时间、页面浏览记录</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">2.</span>
                信息使用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们使用收集的信息用于以下目的：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>提供和改进我们的招聘服务</li>
                <li>处理您的求职申请和面试安排</li>
                <li>与您沟通招聘相关事宜</li>
                <li>发送服务通知和更新</li>
                <li>分析网站使用情况以改善用户体验</li>
                <li>遵守法律法规要求</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">3.</span>
                信息共享
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们不会出售、交易或转让您的个人信息给第三方，除非：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>获得您的明确同意</li>
                <li>为提供服务所必需（如与招聘相关的内部部门）</li>
                <li>法律法规要求或政府部门要求</li>
                <li>保护我们的权利、财产或安全</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>注意：</strong>在招聘过程中，您的简历和申请信息可能会在公司内部相关部门间共享，
                  以便更好地评估您的申请。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">4.</span>
                数据安全
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们采取多种安全措施保护您的个人信息：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Lock className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">技术保护</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• SSL加密传输</li>
                    <li>• 数据库加密存储</li>
                    <li>• 防火墙保护</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">访问控制</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 权限分级管理</li>
                    <li>• 员工培训</li>
                    <li>• 定期安全审计</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">5.</span>
                数据保留
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们会根据以下原则保留您的个人信息：
              </p>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">保留期限</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>简历和申请信息：2年（除非您要求删除）</li>
                    <li>面试记录：1年</li>
                    <li>系统日志：6个月</li>
                  </ul>
                </div>
                <p className="text-gray-700 text-sm">
                  超过保留期限的数据将被安全删除，除非法律要求我们保留更长时间。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">6.</span>
                您的权利
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                您对自己的个人信息享有以下权利：
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">访问权</h4>
                  <p className="text-sm text-gray-700">查看我们持有的您的个人信息</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">更正权</h4>
                  <p className="text-sm text-gray-700">要求更正不准确的个人信息</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">删除权</h4>
                  <p className="text-sm text-gray-700">要求删除您的个人信息</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">撤回同意</h4>
                  <p className="text-sm text-gray-700">撤回之前给予的处理同意</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  如需行使这些权利，请通过页面底部的联系方式与我们联系。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">7.</span>
                Cookie使用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们使用Cookie和类似技术来：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>记住您的登录状态和偏好设置</li>
                <li>分析网站流量和使用模式</li>
                <li>提供个性化的用户体验</li>
                <li>确保网站安全</li>
              </ul>
              <p className="text-gray-700 text-sm">
                您可以通过浏览器设置管理Cookie偏好，但这可能影响网站的某些功能。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">8.</span>
                政策更新
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们可能会不时更新本隐私政策。重大变更时，我们会：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>在网站上发布更新通知</li>
                <li>通过邮件通知注册用户</li>
                <li>在政策生效前提供合理的通知期</li>
              </ul>
              <p className="text-gray-700">
                继续使用我们的服务即表示您接受更新后的政策。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-green-600 mr-2">9.</span>
                联系我们
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                如果您对本隐私政策有任何疑问或需要行使您的权利，请联系我们：
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>数据保护官：</strong>privacy@yarbo.com</p>
                <p className="text-gray-700"><strong>客服邮箱：</strong>support@yarbo.com</p>
                <p className="text-gray-700"><strong>客服电话：</strong>400-123-4567</p>
                <p className="text-gray-700"><strong>办公地址：</strong>深圳市华南数字谷L栋</p>
                <p className="text-gray-700"><strong>工作时间：</strong>周一至周五 9:00-18:00</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部操作 */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">
              本政策自2024年6月15日起生效
            </span>
          </div>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
