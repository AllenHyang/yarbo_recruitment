"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  Building,
  GraduationCap,
  Share2,
  Copy
} from "lucide-react";

import type { JobWithDepartment } from "@/lib/database.types";

interface JobDetail extends JobWithDepartment {
  salary_display?: string;
}


function JobDetailContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('职位ID不能为空');
      setIsLoading(false);
      return;
    }

    // 从Supabase获取真实数据
    const fetchJobData = async () => {
      try {
        
        // 获取职位详情，包含部门信息
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            departments!inner (
              id,
              name,
              color_theme
            )
          `)
          .eq('id', jobId)
          .single();

        if (error) {
          console.error('获取职位详情失败:', error);
          setError('获取职位信息失败');
          return;
        }

        if (data) {
          // 格式化薪资显示
          const formatSalary = (min?: number | null, max?: number | null) => {
            if (min && max) {
              return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`;
            }
            return '面议';
          };

          // 转换数据格式
          const jobDetail: JobDetail = {
            ...data,
            department: data.departments?.name || '未知部门',
            salary_display: formatSalary(data.salary_min, data.salary_max),
            requirements: data.requirements || [],
            benefits: data.benefits || []
          };
          
          setJob(jobDetail);
        } else {
          setError('职位不存在或已下线');
        }
      } catch (err) {
        console.error('获取职位数据异常:', err);
        setError('获取职位信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="h-10 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">职位未找到</h1>
            <p className="text-red-600 mb-6">{error || '抱歉，您查看的职位不存在或已下线。'}</p>
            <Link href="/jobs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回职位列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回职位列表
        </Link>

        {/* 职位标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            {job.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                推荐职位
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {job.department}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              {job.type || '全职'}
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              {job.level || '不限'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="md:col-span-2 space-y-6">
            {/* 职位描述 */}
            <Card>
              <CardHeader>
                <CardTitle>职位描述</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 职位要求 */}
            <Card>
              <CardHeader>
                <CardTitle>职位要求</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 福利待遇 */}
            <Card>
              <CardHeader>
                <CardTitle>福利待遇</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">薪资范围</span>
                  <span className="font-semibold text-green-600">{job.salary_display || '面议'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">发布时间</span>
                  <span className="text-gray-900">
                    {new Date(job.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">职位状态</span>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status === 'active' ? '招聘中' : '已暂停'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 申请按钮 */}
            <Card>
              <CardContent className="pt-6">
                <Link href={`/apply?jobId=${job.id}`} className="w-full">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={job.status !== 'active'}
                  >
                    {job.status === 'active' ? '立即申请' : '暂停招聘'}
                  </Button>
                </Link>
                {!user && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    需要先 <Link href="/auth/login" className="text-blue-600 hover:underline">登录</Link> 才能申请
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 分享 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">分享职位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制链接
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-3 w-3 mr-1" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="h-10 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <JobDetailContent />
    </Suspense>
  );
}