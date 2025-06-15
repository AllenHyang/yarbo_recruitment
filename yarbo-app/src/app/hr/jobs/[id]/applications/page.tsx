'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, FileText, Calendar, Eye, Download } from "lucide-react";
import { withRoleBasedAccess } from "@/components/withProtected";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Application {
  id: string;
  status: string;
  applied_at: string;
  applicants: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  resumes: {
    id: string;
    filename: string;
    file_path: string;
  } | null;
}

function JobApplicationsPage() {
  const { user, session } = useAuth();
  const params = useParams();
  const jobId = params.id as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !user) return;

    const fetchApplications = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/applications`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token || ''}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || '获取申请列表失败');
        }
      } catch (error) {
        console.error('获取申请列表失败:', error);
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId, user, session]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      submitted: { label: '已提交', variant: 'default' as const },
      reviewing: { label: '审核中', variant: 'secondary' as const },
      interview: { label: '面试中', variant: 'outline' as const },
      hired: { label: '已录用', variant: 'default' as const },
      rejected: { label: '已拒绝', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <p className="text-gray-600">加载申请列表中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">加载失败</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link href="/hr/jobs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回职位列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* 返回导航 */}
        <div className="mb-8">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回职位详情</span>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">职位申请管理</h1>
            <p className="text-gray-600">
              共 {applications.length} 份申请
            </p>
          </div>

          {/* 申请列表 */}
          <div className="space-y-6">
            {applications.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无申请</h3>
                  <p className="text-gray-600">该职位还没有收到任何申请</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{application.applicants.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{application.applicants.email}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{application.applicants.phone}</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(application.status)}
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(application.applied_at)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {application.resumes && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{application.resumes.filename}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          查看详情
                        </Button>
                        {application.resumes && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            下载简历
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 使用权限保护包装组件，只允许HR和管理员访问
// 为静态导出生成参数
export async function generateStaticParams() {
  return [];
}
export default withRoleBasedAccess(JobApplicationsPage, ['hr', 'admin']);
