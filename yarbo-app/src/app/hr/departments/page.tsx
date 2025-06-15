'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Briefcase,
  Loader2,
  RefreshCw,
  Eye
} from "lucide-react";
import Link from "next/link";
import { withProtected } from "@/components/withProtected";
import type { Department } from "@/lib/database.types";
import { DepartmentModal } from "./_components/DepartmentModal";
import { DeleteDepartmentDialog } from "./_components/DeleteDepartmentDialog";
import { departmentApi } from "@/lib/api-client";

interface DepartmentWithStats extends Department {
  jobs_count: number;
  employee_count: number;
}

interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  totalJobs: number;
  totalEmployees: number;
}

function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 获取部门列表
  const fetchDepartments = async () => {
    try {
      const result = await departmentApi.getDepartments();

      if (result.success) {
        setDepartments(result.data?.departments || []);
        setError(null);
      } else {
        throw new Error(result.error || '获取部门列表失败');
      }
    } catch (error) {
      console.error('获取部门列表失败:', error);
      setError(error instanceof Error ? error.message : '获取部门列表失败');
    }
  };

  // 获取统计数据
  const fetchStats = async () => {
    try {
      const result = await departmentApi.getDepartmentStats();

      if (result.success) {
        setStats(result.data?.stats);
      } else {
        console.error('获取统计数据失败:', result.error);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDepartments(), fetchStats()]);
    setRefreshing(false);
  };

  // 处理创建部门
  const handleCreateDepartment = () => {
    setModalMode('create');
    setSelectedDepartment(null);
    setModalOpen(true);
  };

  // 处理编辑部门
  const handleEditDepartment = (department: DepartmentWithStats) => {
    setModalMode('edit');
    setSelectedDepartment(department);
    setModalOpen(true);
  };

  // 处理删除部门
  const handleDeleteDepartment = (department: DepartmentWithStats) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  // 模态框成功回调
  const handleModalSuccess = () => {
    handleRefresh();
  };

  // 删除成功回调
  const handleDeleteSuccess = () => {
    handleRefresh();
  };

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchDepartments(), fetchStats()]);
      setLoading(false);
    };

    initData();
  }, []);

  // 筛选部门
  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.description && department.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 获取部门颜色主题
  const getDepartmentColor = (colorTheme: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    };
    return colors[colorTheme as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto fade-in">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">
                部门管理
              </h1>
              <p className="text-gray-600 text-lg">管理组织架构和部门信息</p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="btn-hover"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>

              <Button
                onClick={handleCreateDepartment}
                className="btn-hover bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建部门
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">总部门数</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalDepartments}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-1">活跃部门</p>
                      <p className="text-3xl font-bold text-green-900">{stats.activeDepartments}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 mb-1">总职位数</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.totalJobs}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">总员工数</p>
                      <p className="text-3xl font-bold text-orange-900">{stats.totalEmployees}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 搜索和筛选 */}
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="搜索部门名称或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 错误提示 */}
          {error && (
            <Card className="border-0 shadow-lg mb-6 border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="text-red-600 font-medium">错误:</div>
                  <div className="ml-2 text-red-600">{error}</div>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    重试
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 部门列表 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-semibold text-gray-900">
                部门列表 ({filteredDepartments.length})
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
                        <th className="text-left p-4 font-medium text-gray-700">部门信息</th>
                        <th className="text-left p-4 font-medium text-gray-700">描述</th>
                        <th className="text-left p-4 font-medium text-gray-700">职位数</th>
                        <th className="text-left p-4 font-medium text-gray-700">员工数</th>
                        <th className="text-left p-4 font-medium text-gray-700">创建时间</th>
                        <th className="text-left p-4 font-medium text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredDepartments.map((department) => {
                        const colors = getDepartmentColor(department.color_theme);
                        return (
                          <tr key={department.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                                  <Building2 className={`w-5 h-5 ${colors.text}`} />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{department.name}</div>
                                  <div className="text-sm text-gray-500">ID: {department.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-600 max-w-xs truncate">
                                {department.description || '暂无描述'}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {department.jobs_count} 个职位
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-green-50 text-green-700">
                                {department.employee_count} 名员工
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-gray-600">
                                {new Date(department.created_at || '').toLocaleDateString('zh-CN')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Link href={`/hr/departments/${department.id}`}>
                                  <Button variant="outline" size="sm" className="btn-hover">
                                    <Eye className="w-3 h-3 mr-1" />
                                    查看
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="btn-hover"
                                  onClick={() => handleEditDepartment(department)}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  编辑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="btn-hover text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteDepartment(department)}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  删除
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && filteredDepartments.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Building2 className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的部门</h3>
                  <p className="text-gray-600 mb-4">
                    尝试调整搜索条件或创建新部门
                  </p>
                  <Button
                    onClick={handleCreateDepartment}
                    className="btn-hover"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    创建部门
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 部门创建/编辑模态框 */}
      <DepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        department={selectedDepartment}
        mode={modalMode}
      />

      {/* 删除确认对话框 */}
      <DeleteDepartmentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        department={selectedDepartment}
      />
    </div>
  );
}

// 使用权限保护，只允许HR和管理员访问
export default withProtected(DepartmentsPage, ['hr', 'admin']);
