"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getJobStats } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { hasFeatureAccess } from "@/lib/permissions";
import Link from "next/link";
import {
  Users,
  Building2,
  TrendingUp,
  // Award,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Star,
  MapPin,
  ThumbsUp,
  GraduationCap,
  BookOpen
} from "lucide-react";

export default function Home() {
  const { userRole, loading } = useAuth();
  const [stats, setStats] = useState<any[]>([]);
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 获取动态统计数据 (优化版 - 添加缓存)
  useEffect(() => {
    async function fetchStats() {
      // 先显示静态数据，提升感知性能
      const fallbackStats = [
        {
          icon: Briefcase,
          label: "开放职位",
          value: "37+",
          desc: "涵盖多个领域",
          color: "text-blue-600",
          bgColor: "bg-blue-50"
        },
        {
          icon: Building2,
          label: "活跃部门",
          value: "12",
          desc: "多样化团队",
          color: "text-green-600",
          bgColor: "bg-green-50"
        },
        {
          icon: MapPin,
          label: "办公地点",
          value: "1",
          desc: "深圳总部",
          color: "text-purple-600",
          bgColor: "bg-purple-50"
        },
        {
          icon: ThumbsUp,
          label: "员工满意度",
          value: "95%",
          desc: "优质工作环境",
          color: "text-orange-600",
          bgColor: "bg-orange-50"
        }
      ];

      // 立即显示静态数据
      setStats(fallbackStats);
      setIsLoading(false);
      setIsUsingFallbackData(true);

      // 后台获取真实数据
      try {
        const jobStats = await getJobStats();
        const statsData = [
          {
            icon: Briefcase,
            label: "开放职位",
            value: `${jobStats.totalJobs}+`,
            desc: "涵盖多个领域",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
          },
          {
            icon: Building2,
            label: "活跃部门",
            value: `${jobStats.totalDepartments}`,
            desc: "多样化团队",
            color: "text-green-600",
            bgColor: "bg-green-50"
          },
          {
            icon: MapPin,
            label: "办公地点",
            value: `${jobStats.totalLocations}`,
            desc: "全球化布局",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
          },
          {
            icon: ThumbsUp,
            label: "员工满意度",
            value: `${jobStats.satisfactionRate}%`,
            desc: "优质工作环境",
            color: "text-orange-600",
            bgColor: "bg-orange-50"
          }
        ];
        setStats(statsData);
        setIsUsingFallbackData(false);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 保持静态数据，不再重新设置
      }
    }

    fetchStats();
  }, []);

  const features = [
    {
      icon: Briefcase,
      title: "技术职位",
      description: "前端、后端、全栈开发工程师",
      href: "/jobs",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Users,
      title: "产品设计",
      description: "产品经理、UI/UX设计师",
      href: "/jobs",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Building2,
      title: "商务拓展",
      description: "销售、市场营销、商务合作",
      href: "/jobs",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      title: "数据分析",
      description: "数据科学家、业务分析师",
      href: "/jobs",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];



  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            🚀 加入 Yarbo International 团队
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            寻找优秀的人才，与我们一起构建未来。在这里，您将与最优秀的团队合作，
            参与创新项目，实现职业发展的新突破。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs">
              <Button size="lg" className="min-w-[200px] bg-blue-600 hover:bg-blue-700">
                浏览职位
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/apply">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                快速申请
              </Button>
            </Link>
          </div>

          {/* HR管理入口 - 仅HR和管理员可见 */}
          {!loading && userRole && (userRole === 'hr' || userRole === 'admin') && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-green-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">👨‍💼 HR管理人员入口</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link href="/hr/dashboard">
                    <Button variant="outline" className="bg-white hover:bg-green-50 border-green-300 min-w-[140px]">
                      <Building2 className="mr-2 w-4 h-4" />
                      管理后台
                    </Button>
                  </Link>
                  <Link href="/hr/campus">
                    <Button variant="outline" className="bg-white hover:bg-blue-50 border-blue-300 min-w-[140px]">
                      <GraduationCap className="mr-2 w-4 h-4" />
                      校园招聘
                    </Button>
                  </Link>
                  <Link href="/hr/internship">
                    <Button variant="outline" className="bg-white hover:bg-purple-50 border-purple-300 min-w-[140px]">
                      <BookOpen className="mr-2 w-4 h-4" />
                      实习管理
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 数据源提示 */}
        {isUsingFallbackData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-600 text-sm">
                ⚠️ 正在显示演示数据，实际统计数据可能略有差异
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.desc}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Job Categories */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">热门职位类别</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们提供多种职业发展机会，无论您是技术专家还是业务高手，都能在这里找到合适的位置
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={feature.href}>
                      <Button variant="outline" className="w-full group-hover:bg-blue-50 group-hover:border-blue-200">
                        查看职位
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Company Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    优秀的工作环境
                  </h3>
                  <p className="text-blue-800 text-sm">
                    灵活的工作时间、现代化的办公设施、完善的福利体系，让您在舒适的环境中发挥最大潜力。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    快速成长机会
                  </h3>
                  <p className="text-green-800 text-sm">
                    完善的培训体系、导师制度、内部转岗机会，助力您的职业发展和技能提升。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-blue-100" />
              <h3 className="text-2xl font-semibold mb-3">
                准备好加入我们了吗？
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                浏览我们的开放职位，找到最适合您的机会。我们期待优秀的您加入 Yarbo International 大家庭！
              </p>
              <Link href="/jobs">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  立即申请
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 