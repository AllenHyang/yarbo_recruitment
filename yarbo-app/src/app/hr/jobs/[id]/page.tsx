'use client';

import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, Eye, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { withRoleBasedAccess } from "@/components/withProtected";
import type { JobWithDepartment } from "@/lib/database.types";

interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  interview: number;
  hired: number;
  rejected: number;
}

function JobDetailsPage() {
  const { id } = useParams();
  const { user, session } = useAuth();
  const [job, setJob] = useState<JobWithDepartment | null>(null);
  const [applicationStats, setApplicationStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user || !session) return;

    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取职位详情
        const jobResponse = await fetch(`/api/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData);
        } else {
          const errorData = await jobResponse.json();
          setError(errorData.error || '获取职位信息失败');
        }

        // 获取申请统计
        const statsResponse = await fetch(`/api/jobs/${id}/stats`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setApplicationStats(statsData.stats);
        } else {
          console.error('获取申请统计失败');
          setApplicationStats({
            total: 0,
            submitted: 0,
            reviewing: 0,
            interview: 0,
            hired: 0,
            rejected: 0
          });
        }

      } catch (error) {
        console.error('获取数据失败:', error);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id, user, session]);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">加载职位信息中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h1>
                <p className="text-gray-600 mb-4">{error || '职位不存在'}</p>
                <Link href="/hr/jobs">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回职位列表
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 格式化职位数据
  const formatSalary = (min?: number, max?: number) => {
    if (min && max) {
      return `${(min / 1000).toFixed(0)}k-${(max / 1000).toFixed(0)}k`;
    }
    return '面议';
  };

  const parseRequirements = (requirements?: string | string[]) => {
    if (Array.isArray(requirements)) {
      return requirements;
    }
    if (typeof requirements === 'string') {
      return requirements.split('\n').filter(req => req.trim().length > 0);
    }
    return ['相关专业本科及以上学历', '具备良好的沟通能力和团队合作精神'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/hr/jobs">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{job.title}</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Link href={`/hr/jobs/${id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>职位信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{job.departments?.name || job.department || '未知部门'}</Badge>
                      <Badge variant="outline">{job.location || '待定'}</Badge>
                      <Badge variant="outline">{formatSalary(job.salary_min, job.salary_max)}</Badge>
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{job.views_count || 0} 次浏览</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{applicationStats?.total || 0} 份申请</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>发布于 {new Date(job.created_at).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>

                    {/* 申请状态统计 */}
                    {applicationStats && applicationStats.total > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">申请状态分布</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{applicationStats.submitted}</div>
                            <div className="text-gray-600">待审核</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{applicationStats.reviewing}</div>
                            <div className="text-gray-600">审核中</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{applicationStats.interview}</div>
                            <div className="text-gray-600">面试中</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{applicationStats.hired}</div>
                            <div className="text-gray-600">已录用</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-red-600">{applicationStats.rejected}</div>
                            <div className="text-gray-600">已拒绝</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>职位描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {job.description || '我们正在寻找优秀的人才加入我们的团队。'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>任职要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parseRequirements(job.requirements).map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 福利待遇 */}
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>福利待遇</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/hr/jobs/${id}/applications`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      查看申请 ({applicationStats?.total || 0})
                    </Button>
                  </Link>

                  <Link href={`/hr/jobs/${id}/edit`}>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      编辑职位
                    </Button>
                  </Link>

                  <Link href={`/jobs/${id}`}>
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      预览职位页面
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* 职位统计卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>职位统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">浏览次数</span>
                      <span className="font-semibold">{job.views_count || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">申请人数</span>
                      <span className="font-semibold text-blue-600">{applicationStats?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">发布状态</span>
                      <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                        {job.status === 'published' ? '已发布' : '草稿'}
                      </Badge>
                    </div>
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

// 使用权限保护包装组件，只允许HR和管理员访问
export default withRoleBasedAccess(JobDetailsPage, ['hr', 'admin']);
