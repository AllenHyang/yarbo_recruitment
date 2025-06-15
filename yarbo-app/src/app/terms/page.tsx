"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TermsOfServicePage() {
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
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">使用条款</h1>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>最后更新：2024年6月15日</span>
          </div>
        </div>

        {/* 重要提示 */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">重要提示</h3>
                <p className="text-yellow-700 text-sm">
                  请仔细阅读本使用条款。使用我们的服务即表示您同意遵守这些条款。
                  如果您不同意这些条款，请不要使用我们的服务。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 条款内容 */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">1.</span>
                服务条款的接受
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                欢迎使用Yarbo（以下简称"我们"、"公司"）提供的招聘服务平台。
                通过访问或使用我们的网站和服务，您同意受本使用条款的约束。
              </p>
              <p className="text-gray-700">
                本条款构成您与Yarbo之间具有法律约束力的协议。
                我们保留随时修改这些条款的权利，修改后的条款将在网站上公布后生效。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">2.</span>
                服务描述
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们的招聘平台为求职者和雇主提供以下服务：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>职位发布和搜索功能</li>
                <li>简历上传和管理</li>
                <li>在线申请和跟踪</li>
                <li>面试安排和管理</li>
                <li>消息通知服务</li>
                <li>数据分析和报告</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">3.</span>
                用户责任
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                作为我们服务的用户，您同意：
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>提供真实、准确、完整的个人信息</li>
                <li>保护您的账户安全，不与他人共享登录凭据</li>
                <li>不发布虚假、误导性或非法内容</li>
                <li>尊重其他用户的隐私和权利</li>
                <li>遵守所有适用的法律法规</li>
                <li>不进行任何可能损害系统安全的行为</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">4.</span>
                知识产权
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                本网站及其内容（包括但不限于文本、图像、软件、商标、标识）的知识产权归Yarbo所有，
                受版权法和其他知识产权法律保护。
              </p>
              <p className="text-gray-700">
                未经我们明确书面许可，您不得复制、修改、分发、传播或以其他方式使用本网站的任何内容。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">5.</span>
                隐私保护
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们重视您的隐私。我们收集、使用和保护您个人信息的方式详见我们的
                <Link href="/privacy" className="text-blue-600 hover:underline">隐私政策</Link>。
                使用我们的服务即表示您同意我们按照隐私政策处理您的个人信息。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">6.</span>
                服务可用性
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们努力确保服务的持续可用性，但不保证服务不会中断。
                我们可能因维护、升级或其他原因暂时中断服务。
              </p>
              <p className="text-gray-700">
                我们保留随时修改、暂停或终止服务的权利，恕不另行通知。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">7.</span>
                免责声明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                我们的服务按"现状"提供，不提供任何明示或暗示的保证。
                我们不保证服务的准确性、完整性、可靠性或适用性。
              </p>
              <p className="text-gray-700">
                在法律允许的最大范围内，我们不对因使用或无法使用我们的服务而造成的任何直接、间接、
                偶然、特殊或后果性损害承担责任。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">8.</span>
                争议解决
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                本使用条款受中华人民共和国法律管辖。
                因本条款引起的任何争议应通过友好协商解决。
              </p>
              <p className="text-gray-700">
                如协商不成，争议应提交至公司所在地有管辖权的人民法院解决。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-blue-600 mr-2">9.</span>
                联系我们
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                如果您对本使用条款有任何疑问或建议，请通过以下方式联系我们：
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>公司名称：</strong>Yarbo</p>
                <p className="text-gray-700"><strong>邮箱：</strong>legal@yarbo.com</p>
                <p className="text-gray-700"><strong>电话：</strong>400-123-4567</p>
                <p className="text-gray-700"><strong>地址：</strong>深圳市华南数字谷L栋</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 底部操作 */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">
              本条款自2024年6月15日起生效
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
