"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  status: string;
  priority: number;
  created_at: string;
  deadline?: string;
  application_count: number;
  is_remote_allowed: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
}

const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'bg-gray-100 text-gray-800' },
  published: { label: '已发布', color: 'bg-green-100 text-green-800' },
  closed: { label: '已关闭', color: 'bg-red-100 text-red-800' },
  paused: { label: '已暂停', color: 'bg-yellow-100 text-yellow-800' }
};

const PRIORITY_CONFIG = {
  1: { label: '极紧急', color: 'text-red-600', icon: '🔴' },
  2: { label: '紧急', color: 'text-orange-600', icon: '🟠' },
  3: { label: '正常', color: 'text-yellow-600', icon: '🟡' },
  4: { label: '不急', color: 'text-green-600', icon: '🟢' },
  5: { label: '储备', color: 'text-gray-600', icon: '⚪' }
};

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    search: ''
  });

  const fetchJobs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.department !== 'all') params.append('department', filters.department);
      
      const response = await fetch(`/api/hr/jobs?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('获取职位列表失败');
      }

      const result = await response.json();
      setJobs(result.data || []);
      setError(null);
    } catch (err) {
      console.error('获取职位失败:', err);
      setError('加载职位列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user, filters.status, filters.department]);

  // 搜索过滤
  const filteredJobs = jobs.filter(job => 
    filters.search === '' || 
    job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    job.department.toLowerCase().includes(filters.search.toLowerCase())
  );

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return '面议';
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min/1000}k-${job.salary_max/1000}k ${job.salary_currency}`;
    }
    if (job.salary_min) return `${job.salary_min/1000}k+ ${job.salary_currency}`;
    return `<${job.salary_max/1000}k ${job.salary_currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">职位管理</h1>
              <p className="text-gray-600">管理和发布招聘职位</p>
            </div>
          </div>
          
          <Link href="/hr/jobs/create">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              发布职位
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总职位数</p>
                  <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已发布</p>
                  <p className="text-3xl font-bold text-green-600">
                    {jobs.filter(job => job.status === 'published').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总申请数</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {jobs.reduce((sum, job) => sum + job.application_count, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">草稿数</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {jobs.filter(job => job.status === 'draft').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索 */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索职位名称或部门..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 border-gray-200"
                  />
                </div>
              </div>
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="closed">已关闭</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.department} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="部门筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有部门</SelectItem>
                  <SelectItem value="技术部">技术部</SelectItem>
                  <SelectItem value="产品部">产品部</SelectItem>
                  <SelectItem value="设计部">设计部</SelectItem>
                  <SelectItem value="市场部">市场部</SelectItem>
                  <SelectItem value="销售部">销售部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 职位列表 */}
        {error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-red-600">{error}</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          <Link href={`/hr/jobs/${job.id}`}>
                            {job.title}
                          </Link>
                        </h3>
                        
                        <Badge className={STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG]?.color}>
                          {STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG]?.label}
                        </Badge>
                        
                        <div className="flex items-center space-x-1">
                          <span>{PRIORITY_CONFIG[job.priority as keyof typeof PRIORITY_CONFIG]?.icon}</span>
                          <span className={`text-xs font-medium ${PRIORITY_CONFIG[job.priority as keyof typeof PRIORITY_CONFIG]?.color}`}>
                            {PRIORITY_CONFIG[job.priority as keyof typeof PRIORITY_CONFIG]?.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                          {job.is_remote_allowed && <span className="ml-1 text-blue-600">| 远程</span>}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {job.application_count} 人申请
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(job.created_at)}
                        </div>
                        {job.deadline && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className={getDaysLeft(job.deadline)! < 7 ? 'text-red-600' : ''}>
                              {getDaysLeft(job.deadline)! > 0 
                                ? `${getDaysLeft(job.deadline)}天后截止` 
                                : '已截止'
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-medium text-green-600">
                          {formatSalary(job)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link href={`/hr/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                          </Link>
                          <Link href={`/hr/jobs/${job.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredJobs.length === 0 && (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无职位</h3>
                    <p className="text-gray-600 mb-6">还没有创建任何职位，立即发布第一个职位吧！</p>
                    <Link href="/hr/jobs/create">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        发布职位
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 