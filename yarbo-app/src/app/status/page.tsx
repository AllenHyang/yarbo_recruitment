/*
 * @Author: Allen
 * @Date: 2025-06-09 08:45:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 08:45:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/status/page.tsx
 * @Description: 申请状态跟踪页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Bell,
  Download,
  Star,
  TrendingUp,
  FileText,
  AlertCircle,
  MessageSquare,
  Video,
  Users,
  Target,
  BookOpen
} from "lucide-react";

// 模拟申请数据
const mockApplications = [
  {
    id: "1",
    jobTitle: "高级前端工程师",
    department: "产品研发部", 
    location: "上海",
    salary: "25K-35K",
    appliedDate: "2025-06-08",
    status: "reviewing",
    statusText: "简历评估中",
    progress: 40,
    estimatedDays: 3,
    hrName: "张HR",
    interviewDate: null,
    feedback: null,
    timeline: [
      { 
        status: "submitted", 
        title: "投递成功", 
        description: "我们已收到您的简历，Yarbo之旅，即刻启程！",
        date: "2025-06-08",
        completed: true 
      },
      { 
        status: "reviewing", 
        title: "简历评估中", 
        description: "我们的HR正在仔细阅读您的简历，请耐心等待，预计需要3-5个工作日。",
        date: null,
        completed: false,
        current: true
      },
      { 
        status: "interview", 
        title: "面试安排", 
        description: "若通过评估，我们的招聘专员将与您联系安排面试事宜。",
        date: null,
        completed: false 
      },
      { 
        status: "decision", 
        title: "最终决定", 
        description: "面试结束后，我们会在5个工作日内给出最终回复。",
        date: null,
        completed: false 
      }
    ]
  },
  {
    id: "2",
    jobTitle: "产品经理",
    department: "产品部", 
    location: "北京",
    salary: "30K-40K",
    appliedDate: "2025-06-05",
    status: "interview",
    statusText: "等待面试",
    progress: 70,
    estimatedDays: 5,
    hrName: "李HR",
    interviewDate: "2025-06-12",
    feedback: "您的简历非常优秀，我们安排了下周的面试。",
    timeline: [
      { 
        status: "submitted", 
        title: "投递成功", 
        description: "我们已收到您的简历。",
        date: "2025-06-05",
        completed: true 
      },
      { 
        status: "reviewing", 
        title: "简历评估", 
        description: "简历评估通过。",
        date: "2025-06-07",
        completed: true
      },
      { 
        status: "interview", 
        title: "面试安排", 
        description: "已安排面试时间：6月12日 14:00，请准时参加。",
        date: "2025-06-09",
        completed: false,
        current: true
      },
      { 
        status: "decision", 
        title: "最终决定", 
        description: "面试结束后，我们会给出最终回复。",
        date: null,
        completed: false 
      }
    ]
  }
];

// 模拟消息通知
const mockNotifications = [
  {
    id: "1",
    type: "interview",
    title: "面试邀请",
    message: "恭喜！产品经理职位面试已安排在6月12日14:00",
    date: "2025-06-09",
    read: false
  },
  {
    id: "2", 
    type: "update",
    title: "申请状态更新",
    message: "您的高级前端工程师申请已进入简历评估阶段",
    date: "2025-06-08",
    read: true
  },
  {
    id: "3",
    type: "reminder",
    title: "简历更新提醒", 
    message: "建议更新您的简历以匹配更多职位",
    date: "2025-06-07",
    read: true
  }
];

// 模拟推荐职位
const mockRecommendedJobs = [
  {
    id: "3",
    title: "资深React开发工程师",
    department: "技术部",
    location: "深圳",
    salary: "28K-38K",
    match: 92,
    tags: ["React", "TypeScript", "Node.js"]
  },
  {
    id: "4", 
    title: "前端架构师",
    department: "技术部",
    location: "上海",
    salary: "35K-50K", 
    match: 88,
    tags: ["Vue.js", "微前端", "团队管理"]
  }
];

// 模拟申请统计
const mockStats = {
  totalApplications: 5,
  inProgress: 2,
  interviews: 1,
  offers: 0,
  responseRate: "80%",
  avgResponseTime: "3天"
};

export default function ApplicationStatusPage() {
  const { user, userProfile } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [recommendedJobs, setRecommendedJobs] = useState(mockRecommendedJobs);
  const [stats, setStats] = useState(mockStats);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'notifications' | 'recommendations'>('overview');

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // 如果用户已登录，自动填充邮箱并搜索
    if (user?.email) {
      setSearchEmail(user.email);
      // 自动执行搜索
      setTimeout(() => {
        if (user.email) {
          handleSearchForUser(user.email);
        }
      }, 500);
    }
  }, [user]);

  const handleSearchForUser = async (email: string) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      // TODO: 实际的API调用
      // const userApplications = await getUserApplications(email);
      
      // 模拟搜索延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 使用模拟数据 - 根据用户邮箱显示相应申请
      if (email === user?.email) {
        setApplications(mockApplications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("搜索申请失败:", error);
      setApplications([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    await handleSearchForUser(searchEmail);
  };

  // 如果用户未登录，显示登录提示界面
  if (!user) {
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

          <div className="max-w-2xl mx-auto text-center">
            {/* 未登录状态提示 */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                申请状态查询
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                为了保护您的隐私和信息安全，查看申请状态需要先登录您的账户
              </p>
            </div>

            {/* 登录提示卡片 */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl text-gray-900">
                  请先登录您的账户
                </CardTitle>
                <CardDescription className="text-gray-600">
                  登录后可以查看您的所有申请记录和实时状态更新
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/auth/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      登录账户
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                      注册新账户
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">登录后您可以：</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>实时查看申请进度和状态更新</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>接收面试邀请和重要通知</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>管理个人简历和求职偏好</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>查看历史申请记录</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 联系信息 */}
            <Card className="mt-8 border-0 shadow-md bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">需要帮助？</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">邮箱咨询</div>
                      <div className="text-sm text-gray-600">hr@yarbo.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">电话咨询</div>
                      <div className="text-sm text-gray-600">021-1234-5678</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  如有任何疑问，请随时联系我们的HR团队，我们会在24小时内回复您。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-500";
      case "reviewing":
        return "bg-yellow-500";
      case "interview":
        return "bg-purple-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-400";
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

        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              申请状态查询
            </h1>
            <p className="text-lg text-gray-600">
              查看您在 Yarbo 的申请进度和状态更新
            </p>
          </div>

          {/* 搜索区域 */}
          <Card className="mb-8 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span>查询申请状态</span>
              </CardTitle>
              <CardDescription>
                请输入您申请时使用的邮箱地址来查看申请进度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="请输入您的邮箱地址"
                    className="mt-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch}
                    disabled={isSearching || !searchEmail.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>查询中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>查询申请</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 申请列表 */}
          {applications.length > 0 && (
            <div className="space-y-6">
              {/* 统计概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                    <div className="text-sm text-gray-600">总申请数</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                    <div className="text-sm text-gray-600">进行中</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Video className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{stats.interviews}</div>
                    <div className="text-sm text-gray-600">面试邀请</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
                    <div className="text-sm text-gray-600">收到Offer</div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                您的申请记录 ({applications.length})
              </h2>
              
              {applications.map((application) => (
                <Card key={application.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-900 flex items-center space-x-3">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <span>{application.jobTitle}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{application.department}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{application.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium text-green-600">{application.salary}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>申请于 {application.appliedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {application.statusText}
                        </Badge>
                        {application.progress && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${application.progress}%` }}
                              ></div>
                            </div>
                            <span>{application.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* HR反馈和面试信息 */}
                    {application.feedback && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-green-800">HR反馈</div>
                            <div className="text-sm text-green-700">{application.feedback}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {application.interviewDate && (
                      <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Video className="h-4 w-4 text-purple-600" />
                            <div>
                              <div className="font-medium text-purple-800">面试安排</div>
                              <div className="text-sm text-purple-700">
                                {application.interviewDate} - 请准时参加
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            加入日历
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* 申请进度时间线 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 mb-4">申请进度</h3>
                      
                      <div className="relative">
                        {application.timeline.map((step: any, index: number) => (
                          <div key={step.status} className="flex items-start space-x-4 pb-6 last:pb-0">
                            {/* 状态图标 */}
                            <div className="relative flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.completed 
                                  ? "bg-green-500" 
                                  : step.current 
                                    ? getStatusColor(step.status)
                                    : "bg-gray-300"
                              }`}>
                                {step.completed ? (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                ) : step.current ? (
                                  <Clock className="h-4 w-4 text-white" />
                                ) : (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              
                              {/* 连接线 */}
                              {index < application.timeline.length - 1 && (
                                <div className={`absolute top-8 left-4 w-0.5 h-6 ${
                                  step.completed ? "bg-green-500" : "bg-gray-300"
                                } transform -translate-x-1/2`} />
                              )}
                            </div>
                            
                            {/* 状态内容 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-medium ${
                                  step.completed || step.current ? "text-gray-900" : "text-gray-500"
                                }`}>
                                  {step.title}
                                </h4>
                                {step.date && (
                                  <span className="text-sm text-gray-500">{step.date}</span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${
                                step.completed || step.current ? "text-gray-600" : "text-gray-400"
                              }`}>
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 联系信息 */}
          <Card className="mt-8 border-0 shadow-md bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">需要帮助？</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">邮箱咨询</div>
                    <div className="text-sm text-gray-600">hr@yarbo.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">电话咨询</div>
                    <div className="text-sm text-gray-600">021-1234-5678</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                如有任何疑问，请随时联系我们的HR团队，我们会在24小时内回复您。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 