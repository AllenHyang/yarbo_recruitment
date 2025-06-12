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
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  priority: number;
  salary_min: number;
  salary_max: number;
  application_count: number;
  views_count: number;
  created_at: string;
  expires_at: string;
  is_remote: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // 模拟数据
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: '🚀 资深全栈工程师',
        department: '技术部',
        location: '北京',
        status: 'published',
        priority: 1,
        salary_min: 25000,
        salary_max: 40000,
        application_count: 28,
        views_count: 342,
        created_at: '2025-06-01',
        expires_at: '2025-07-24',
        is_remote: true
      },
      {
        id: '2',
        title: '💡 产品经理（AI方向）',
        department: '产品部',
        location: '上海',
        status: 'published',
        priority: 2,
        salary_min: 20000,
        salary_max: 35000,
        application_count: 15,
        views_count: 198,
        created_at: '2025-06-02',
        expires_at: '2025-07-09',
        is_remote: false
      },
      {
        id: '3',
        title: '🎨 资深UI/UX设计师',
        department: '设计部',
        location: '深圳',
        status: 'published',
        priority: 2,
        salary_min: 18000,
        salary_max: 30000,
        application_count: 12,
        views_count: 156,
        created_at: '2025-06-03',
        expires_at: '2025-08-08',
        is_remote: true
      },
      {
        id: '4',
        title: '⚡ DevOps工程师',
        department: '技术部',
        location: '成都',
        status: 'draft',
        priority: 3,
        salary_min: 18000,
        salary_max: 32000,
        application_count: 0,
        views_count: 0,
        created_at: '2025-06-04',
        expires_at: '2025-09-07',
        is_remote: true
      }
    ];
    setJobs(mockJobs);
  }, []);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const totalApplications = jobs.reduce((sum, job) => sum + job.application_count, 0);
  const publishedJobs = jobs.filter(job => job.status === 'published').length;
  const draftJobs = jobs.filter(job => job.status === 'draft').length;

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
            
            <Link href="/hr/jobs/create">
              <Button className="btn-hover shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                发布新职位
              </Button>
            </Link>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-hover border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">总职位数</p>
                    <p className="text-3xl font-bold text-gray-900">{jobs.length}</p>
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
                    <p className="text-3xl font-bold text-green-600">{publishedJobs}</p>
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
                    <p className="text-3xl font-bold text-blue-600">{totalApplications}</p>
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
                    <p className="text-3xl font-bold text-orange-600">{draftJobs}</p>
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
                            <span>{job.salary_min.toLocaleString()}-{job.salary_max.toLocaleString()}</span>
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

              {filteredJobs.length === 0 && (
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