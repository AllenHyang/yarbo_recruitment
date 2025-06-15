"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Star,
  Building,
  BookOpen,
  CheckCircle,
  Wifi,
  Target
} from "lucide-react";

interface InternshipJobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  duration: string;
  type: string;
  salary_display: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills_gained: string[];
  posted_at: string;
  deadline: string;
  start_date: string;
  is_featured: boolean;
  is_remote: boolean;
}

// 为静态导出生成参数
export async function generateStaticParams() {
  return [];
}
export default function InternshipJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<InternshipJobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!params.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (!response.ok) {
          throw new Error('获取职位详情失败');
        }

        const data = await response.json();
        if (data.success) {
          // 检查是否为实习职位
          if (data.job_category !== 'internship') {
            setError('该职位不是实习职位');
            return;
          }

          // 转换数据格式
          const jobDetail: InternshipJobDetail = {
            id: data.id,
            title: data.title,
            department: data.department,
            location: data.location,
            duration: data.internship_duration || '',
            type: data.internship_type || '实习',
            salary_display: data.salary_display || `${data.stipend_amount || 0}/${data.stipend_period === 'daily' ? '天' : data.stipend_period === 'weekly' ? '周' : '月'}`,
            description: data.description,
            requirements: data.requirements || [],
            benefits: [], // 可以从其他表获取
            skills_gained: data.skills_gained || [],
            posted_at: data.created_at?.split('T')[0] || '',
            deadline: data.expires_at?.split('T')[0] || '',
            start_date: data.start_date || '',
            is_featured: data.is_featured || false,
            is_remote: data.is_remote_internship || false
          };

          setJob(jobDetail);
        } else {
          setError(data.error || '获取职位详情失败');
        }
      } catch (error) {
        console.error('获取职位详情失败:', error);
        setError('获取职位详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">职位不存在</h1>
            <p className="text-gray-600 mb-6">{error || '未找到该实习职位'}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回实习招聘
          </Button>

          {/* 职位标题卡片 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    {job.is_featured && (
                      <Badge className="bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" />
                        热门
                      </Badge>
                    )}
                    {job.is_remote && (
                      <Badge variant="outline">
                        <Wifi className="w-3 h-3 mr-1" />
                        远程
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {job.salary_display}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {job.duration}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Button size="lg" className="mb-2">
                    立即申请
                  </Button>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      截止：{job.deadline}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主要内容 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 职位描述 */}
              <Card>
                <CardHeader>
                  <CardTitle>实习描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{job.description}</p>
                </CardContent>
              </Card>

              {/* 任职要求 */}
              <Card>
                <CardHeader>
                  <CardTitle>申请要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 技能收获 */}
              {job.skills_gained.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      技能收获
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {job.skills_gained.map((skill, index) => (
                        <div key={index} className="flex items-center">
                          <BookOpen className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 实习信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>实习信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">发布时间</span>
                    <span>{job.posted_at}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">申请截止</span>
                    <span>{job.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">开始时间</span>
                    <span>{job.start_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">实习时长</span>
                    <span>{job.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">实习类型</span>
                    <span>{job.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">远程支持</span>
                    <span>{job.is_remote ? '支持' : '不支持'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 申请提示 */}
              <Card>
                <CardHeader>
                  <CardTitle>申请提示</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>• 请确保简历信息完整准确</p>
                    <p>• 建议提前准备相关作品集</p>
                    <p>• 实习期间将有导师指导</p>
                    <p>• 表现优秀者有转正机会</p>
                    <p>• 如有疑问可联系HR部门</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
