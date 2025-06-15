'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  Edit,
  MapPin,
  Calendar,
  Users,
  Building2,
  DollarSign,
  Filter,
  Briefcase,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  Upload,
  Download,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { withProtected } from "@/components/withProtected";
import { useAuth } from "@/contexts/AuthContext";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  priority: number;
  salary_min: number;
  salary_max: number;
  salary_display?: string;
  application_count: number;
  views_count: number;
  created_at: string;
  updated_at?: string;
  expires_at: string;
  is_remote: boolean;
  description?: string;
  requirements?: string[];
}

interface JobStats {
  totalJobs: number;
  publishedJobs: number;
  draftJobs: number;
  pausedJobs: number;
  closedJobs: number;
  totalApplications: number;
  totalViews: number;
}

function JobsPage() {
  const { session } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // 获取职位统计数据
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/hr/jobs/stats', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || '获取统计数据失败');
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError(err instanceof Error ? err.message : '获取统计数据失败');
    }
  };

  // 获取职位列表数据
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/hr/jobs?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('获取职位列表失败');
      }

      const data = await response.json();
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        throw new Error(data.error || '获取职位列表失败');
      }
    } catch (err) {
      console.error('获取职位列表失败:', err);
      setError(err instanceof Error ? err.message : '获取职位列表失败');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (session?.access_token) {
      fetchStats();
      fetchJobs();
    }
  }, [session?.access_token]);

  // 筛选条件变化时重新获取数据
  useEffect(() => {
    if (session?.access_token) {
      fetchJobs();
    }
  }, [statusFilter, departmentFilter, searchTerm, session?.access_token]);

  // 刷新数据
  const handleRefresh = () => {
    fetchStats();
    fetchJobs();
  };

  // 下载Excel模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/hr/jobs/template', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error('下载模板失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'job_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('下载模板失败:', err);
      setError(err instanceof Error ? err.message : '下载模板失败');
    }
  };

  // 处理Excel文件上传
  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('请选择Excel文件 (.xlsx 或 .xls)');
      return;
    }

    // 验证文件大小 (最大10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress('正在上传文件...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/hr/jobs/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const result = await response.json();

      if (result.success) {
        setUploadProgress(`成功创建 ${result.created} 个职位，跳过 ${result.skipped} 个重复职位`);

        // 刷新职位列表
        setTimeout(() => {
          fetchStats();
          fetchJobs();
          setUploadProgress(null);
        }, 2000);
      } else {
        throw new Error(result.error || '处理文件失败');
      }
    } catch (err) {
      console.error('Excel上传失败:', err);
      setError(err instanceof Error ? err.message : 'Excel上传失败');
      setUploadProgress(null);
    } finally {
      setUploading(false);
      // 清空文件输入
      event.target.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    switch (status) {
      case 'published': return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case 'draft': return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
      case 'paused': return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case 'closed': return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'paused': return '已暂停';
      case 'closed': return '已关闭';
      default: return status;
    }
  };

  const getPriorityBadge = (priority: number) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    switch (priority) {
      case 1: return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      case 2: return `${baseClasses} bg-orange-100 text-orange-800 border-orange-200`;
      case 3: return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
      case 4: return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case 5: return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
      default: return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return '🔥 极紧急';
      case 2: return '⚡ 紧急';
      case 3: return '📋 普通';
      case 4: return '⏰ 不急';
      case 5: return '📦 储备';
      default: return '📋 普通';
    }
  };

  // 由于我们已经在API层面进行了筛选，这里直接使用jobs
  const filteredJobs = jobs;

  // 如果有统计数据就使用，否则从当前数据计算
  const displayStats = stats || {
    totalJobs: jobs.length,
    publishedJobs: jobs.filter(job => ['active', 'published'].includes(job.status)).length,
    draftJobs: jobs.filter(job => job.status === 'draft').length,
    pausedJobs: jobs.filter(job => job.status === 'paused').length,
    closedJobs: jobs.filter(job => job.status === 'closed').length,
    totalApplications: jobs.reduce((sum, job) => sum + job.application_count, 0),
    totalViews: jobs.reduce((sum, job) => sum + job.views_count, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto fade-in">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                职位管理
              </h1>
              <p className="text-gray-600 text-lg">管理和发布招聘职位</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="btn-hover"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                刷新
              </Button>

              {/* Excel批量上传功能 */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="btn-hover"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载模板
                </Button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="excel-upload"
                  />
                  <Button
                    variant="outline"
                    disabled={uploading}
                    className="btn-hover"
                    asChild
                  >
                    <label htmlFor="excel-upload" className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      批量上传
                    </label>
                  </Button>
                </div>
              </div>

              <Link href="/hr/jobs/create">
                <Button className="btn-hover shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  发布新职位
                </Button>
              </Link>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <span className="text-sm font-medium">错误:</span>
                  <span className="text-sm">{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="ml-auto"
                  >
                    重试
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 上传进度提示 */}
          {uploadProgress && (
            <Card className="border-blue-200 bg-blue-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-sm font-medium">Excel上传:</span>
                  <span className="text-sm">{uploadProgress}</span>
                  {uploading && (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">总职位数</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        displayStats.totalJobs
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">已发布</p>
                    <p className="text-3xl font-bold text-green-600">
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        displayStats.publishedJobs
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">总申请数</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        displayStats.totalApplications
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">草稿</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {loading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        displayStats.draftJobs
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Edit className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索职位或部门..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40 border-gray-200">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="paused">已暂停</SelectItem>
                    <SelectItem value="closed">已关闭</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-40 border-gray-200">
                    <SelectValue placeholder="部门筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有部门</SelectItem>
                    <SelectItem value="技术部">技术部</SelectItem>
                    <SelectItem value="产品部">产品部</SelectItem>
                    <SelectItem value="设计部">设计部</SelectItem>
                    <SelectItem value="运营部">运营部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 职位列表 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">
                职位列表 ({filteredJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">加载中...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">职位信息</th>
                        <th className="text-left p-4 font-medium text-gray-700">部门</th>
                        <th className="text-left p-4 font-medium text-gray-700">薪资范围</th>
                        <th className="text-left p-4 font-medium text-gray-700">状态</th>
                        <th className="text-left p-4 font-medium text-gray-700">优先级</th>
                        <th className="text-left p-4 font-medium text-gray-700">申请/浏览</th>
                        <th className="text-left p-4 font-medium text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr key={job.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">{job.title}</div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                  {job.is_remote && (
                                    <span className="text-blue-600 ml-1">· 远程</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {job.expires_at}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">{job.department}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 text-gray-700">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>
                                {job.salary_display ||
                                  (job.salary_min && job.salary_max
                                    ? `${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()}`
                                    : '面议'
                                  )
                                }
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={getStatusBadge(job.status)}>
                              {getStatusText(job.status)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={getPriorityBadge(job.priority)}>
                              {getPriorityText(job.priority)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Users className="w-3 h-3" />
                                {job.application_count}
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Eye className="w-3 h-3" />
                                {job.views_count}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/hr/jobs/${job.id}`}>
                                <Button variant="outline" size="sm" className="btn-hover">
                                  <Eye className="w-3 h-3 mr-1" />
                                  查看
                                </Button>
                              </Link>
                              <Link href={`/hr/jobs/${job.id}/edit`}>
                                <Button variant="outline" size="sm" className="btn-hover">
                                  <Edit className="w-3 h-3 mr-1" />
                                  编辑
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredJobs.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的职位</h3>
                  <p className="text-gray-600 mb-4">
                    尝试调整搜索条件或筛选器
                  </p>
                  <Link href="/hr/jobs/create">
                    <Button className="btn-hover">
                      <Plus className="w-4 h-4 mr-2" />
                      发布新职位
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 使用权限保护，只允许HR和管理员访问
export default withProtected(JobsPage, ['hr', 'admin']);