"use client";

import { useState, useEffect } from "react";
import { withProtected } from "@/components/withProtected";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicationList } from "./_components/ApplicationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Calendar,
  Award,
  PlusCircle,
  BarChart3,
  UserCheck,
  Clock,
  TrendingUp,
  Building2,
  Mail,
  Settings,
  Download,
  Briefcase,
  GraduationCap,
  BookOpen,
  Brain,
  RefreshCw,
  Loader2
} from "lucide-react";
import { getHRDashboardStats } from "@/lib/api";
import { useToastActions } from "@/components/ui/toast";

interface DashboardStats {
  pendingApplications: number;
  monthlyApplications: number;
  interviewsPassed: number;
  monthlyHires: number;
  averageProcessingTime: number;
}

function HRDashboardPage() {
  const { user, userProfile } = useAuth();
  const toast = useToastActions();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardStats = async (refresh = false) => {
    if (!user?.id) return;

    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const stats = await getHRDashboardStats(user.id);
      setDashboardStats(stats);
      setError(null);

      if (refresh) {
        toast.success("数据刷新成功");
      }
    } catch (err) {
      console.error("获取仪表板统计数据失败:", err);
      const errorMessage = "加载统计数据失败";
      setError(errorMessage);

      if (refresh) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [user?.id]);

  // 构建统计卡片数据
  const stats = dashboardStats ? [
    {
      title: "待处理申请",
      value: dashboardStats.pendingApplications.toString(),
      subtitle: "需要审核",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "本月收到",
      value: dashboardStats.monthlyApplications.toString(),
      subtitle: "总申请数",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "已通过面试",
      value: dashboardStats.interviewsPassed.toString(),
      subtitle: "待决定",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "本月录用",
      value: dashboardStats.monthlyHires.toString(),
      subtitle: "新员工",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
  ] : [];

  const quickActions = [
    {
      title: "职位管理",
      description: "查看、编辑和管理所有职位",
      icon: Briefcase,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/hr/jobs"
    },
    {
      title: "校园招聘",
      description: "管理校招职位和校园活动",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/hr/campus-recruitment"
    },
    {
      title: "实习管理",
      description: "管理实习职位和实习生",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/hr/internship"
    },
    {
      title: "心理测评",
      description: "查看候选人心理测评结果",
      icon: Brain,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      href: "/hr/psychological-assessment"
    },
    {
      title: "查看简历库",
      description: "浏览和搜索候选人简历",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/hr/candidates"
    },
    {
      title: "面试安排",
      description: "管理面试时间和面试官",
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/hr/interviews"
    },
    {
      title: "数据报告",
      description: "查看招聘数据和分析报告",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/hr/reports"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-10 fade-in">
          {/* 页面标题区域 */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">HR 管理中心</h1>
                <p className="text-gray-600">欢迎您，{userProfile?.user_profiles?.first_name || user?.email}</p>
              </div>
            </div>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto"></div>
          </header>

          {/* 统计卡片区域 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">数据概览</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDashboardStats(true)}
                  disabled={isRefreshing}
                  className="space-x-2 btn-hover"
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>刷新数据</span>
                </Button>
                <Button variant="outline" size="sm" className="space-x-2 btn-hover">
                  <Download className="w-4 h-4" />
                  <span>导出报告</span>
                </Button>
              </div>
            </div>

            {/* 错误状态 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs">!</span>
                  </div>
                  <span className="text-red-700 text-sm">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchDashboardStats()}
                    className="text-red-600 hover:text-red-700"
                  >
                    重试
                  </Button>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((index) => (
                  <Card key={index} className="text-center border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4 mx-auto animate-pulse">
                        <div className="w-7 h-7 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                    <CardContent className="pt-6">
                      <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                      <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                      <div className="text-sm font-medium text-gray-900 mb-1">{stat.title}</div>
                      <div className="text-xs text-gray-500">{stat.subtitle}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* 快捷操作区域 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">快捷操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border-0 shadow-md"
                  onClick={() => {
                    window.location.href = action.href;
                  }}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-xl ${action.bgColor} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-8 h-8 ${action.color}`} />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* 最近活动 */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">最近活动</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  发送批量邮件
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
              </div>
            </div>

            {/* 近期趋势卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">申请增长</CardTitle>
                      <CardDescription>vs 上月</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <p className="text-sm text-gray-500 mt-2">较上月增加 8 份申请</p>
                </CardContent>
              </Card>

              <Card className="col-span-1 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">通过率</CardTitle>
                      <CardDescription>面试通过</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">67%</div>
                  <p className="text-sm text-gray-500 mt-2">8/12 位候选人通过</p>
                </CardContent>
              </Card>

              <Card className="col-span-1 hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">平均处理</CardTitle>
                      <CardDescription>申请时间</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardStats ? `${dashboardStats.averageProcessingTime}天` : '2.3天'}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">比目标快 0.7天</p>
                </CardContent>
              </Card>
            </div>

            {/* 申请列表 */}
            <ApplicationList />
          </section>
        </div>
      </div>
    </div>
  );
}

// 暂时移除权限保护，方便演示和测试
export default HRDashboardPage;

// 如果需要权限保护，请取消注释下面这行：
// export default withProtected(HRDashboardPage, ["hr", "admin"]); 