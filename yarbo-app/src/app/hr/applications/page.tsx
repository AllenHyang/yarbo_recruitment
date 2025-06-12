'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Star,
  RefreshCw,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Download
} from "lucide-react";
import Link from "next/link";
import { BulkActionToolbar } from "@/components/hr/BulkActionToolbar";
import { DataExport } from "@/components/hr/DataExport";

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  applied_at: string;
  rating: number;
  resume_url: string;
}

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [applications] = useState<Application[]>([
    {
      id: '1',
      candidate_name: '张三',
      candidate_email: 'zhangsan@example.com',
      job_title: '资深全栈工程师',
      status: 'pending',
      applied_at: '2025-06-08',
      rating: 4,
      resume_url: '#'
    },
    {
      id: '2',
      candidate_name: '李四',
      candidate_email: 'lisi@example.com',
      job_title: '前端工程师',
      status: 'reviewing',
      applied_at: '2025-06-07',
      rating: 5,
      resume_url: '#'
    },
    {
      id: '3',
      candidate_name: '王五',
      candidate_email: 'wangwu@example.com',
      job_title: 'UI设计师',
      status: 'interview',
      applied_at: '2025-06-06',
      rating: 3,
      resume_url: '#'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'reviewing': return '审核中';
      case 'interview': return '面试中';
      case 'hired': return '已录用';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 批量操作处理函数
  const handleBulkAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hr/applications/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          application_ids: selectedApplications,
          data,
          operator_id: 'current_user' // 实际项目中应该从认证上下文获取
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ 批量操作成功:', result.data);
        alert(`批量操作成功！处理了 ${result.data.total_processed} 条记录`);
        setSelectedApplications([]);
        // 这里应该刷新数据
      } else {
        throw new Error(result.error || '批量操作失败');
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('批量操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 选择处理函数
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId: string, checked: boolean) => {
    if (checked) {
      setSelectedApplications(prev => [...prev, applicationId]);
    } else {
      setSelectedApplications(prev => prev.filter(id => id !== applicationId));
    }
  };

  const isAllSelected = filteredApplications.length > 0 &&
    selectedApplications.length === filteredApplications.length;
  const isIndeterminate = selectedApplications.length > 0 &&
    selectedApplications.length < filteredApplications.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                申请管理
              </h1>
              <p className="text-gray-600 mt-1">查看和管理求职申请</p>
            </div>

            <div className="flex items-center space-x-2">
              <DataExport
                type="applications"
                trigger={
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出数据
                  </Button>
                }
              />
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待处理</p>
                    <p className="text-2xl font-bold text-yellow-600">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">审核中</p>
                    <p className="text-2xl font-bold text-blue-600">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">面试中</p>
                    <p className="text-2xl font-bold text-purple-600">5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">本月录用</p>
                    <p className="text-2xl font-bold text-green-600">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索候选人姓名、邮箱或职位..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">待处理</SelectItem>
                      <SelectItem value="reviewing">审核中</SelectItem>
                      <SelectItem value="interview">面试中</SelectItem>
                      <SelectItem value="hired">已录用</SelectItem>
                      <SelectItem value="rejected">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作工具栏 */}
          <BulkActionToolbar
            selectedItems={selectedApplications}
            onClearSelection={() => setSelectedApplications([])}
            onBulkAction={handleBulkAction}
            isLoading={isLoading}
          />

          {/* 申请列表 */}
          <Card>
            <CardHeader>
              <CardTitle>申请列表 ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="选择全部"
                      />
                    </TableHead>
                    <TableHead>候选人</TableHead>
                    <TableHead>申请职位</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>申请时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedApplications.includes(application.id)}
                          onCheckedChange={(checked) =>
                            handleSelectApplication(application.id, checked as boolean)
                          }
                          aria-label={`选择 ${application.candidate_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.candidate_name}</div>
                          <div className="text-sm text-gray-500">{application.candidate_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.job_title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusText(application.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < application.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">
                            {application.rating}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{application.applied_at}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/hr/applications/${application.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到申请</h3>
                  <p className="text-gray-600">尝试调整搜索条件或筛选器</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 