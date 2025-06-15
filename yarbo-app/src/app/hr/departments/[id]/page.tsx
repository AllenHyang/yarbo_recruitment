'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Edit, 
  Trash2, 
  Users, 
  Briefcase,
  Calendar,
  Loader2,
  Eye
} from "lucide-react";
import Link from "next/link";
import { withProtected } from "@/components/withProtected";
import type { Department } from "@/lib/database.types";
import { DepartmentModal } from "../_components/DepartmentModal";
import { DeleteDepartmentDialog } from "../_components/DeleteDepartmentDialog";

interface DepartmentWithStats extends Department {
  jobs_count: number;
  employee_count: number;
  recent_jobs: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    salary_display: string | null;
  }>;
}

function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<DepartmentWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 获取部门详情
  const fetchDepartment = async () => {
    try {
      const response = await fetch(`/api/hr/departments/${departmentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取部门详情失败');
      }

      setDepartment(data.department);
      setError(null);
    } catch (error) {
      console.error('获取部门详情失败:', error);
      setError(error instanceof Error ? error.message : '获取部门详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDepartment();
    }
  }, [departmentId]);

  // 处理编辑
  const handleEdit = () => {
    setModalOpen(true);
  };

  // 处理删除
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  // 编辑成功回调
  const handleEditSuccess = () => {
    fetchDepartment();
  };

  // 删除成功回调
  const handleDeleteSuccess = () => {
    router.push('/hr/departments');
  };

  // 获取部门颜色主题
  const getDepartmentColor = (colorTheme: string) => {
    const colors = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-100' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', accent: 'bg-green-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: 'bg-purple-100' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: 'bg-orange-100' },
      red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', accent: 'bg-red-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', accent: 'bg-indigo-100' },
    };
    return colors[colorTheme as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-red-600 mb-4">
              <Building2 className="w-12 h-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h1>
            <p className="text-gray-600 mb-4">{error || '部门不存在'}</p>
            <Link href="/hr/departments">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回部门列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const colors = getDepartmentColor(department.color_theme);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto fade-in">
          {/* 返回导航 */}
          <div className="mb-6">
            <Link
              href="/hr/departments"
              className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>返回部门列表</span>
            </Link>
          </div>

          {/* 部门头部信息 */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                    <Building2 className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{department.name}</h1>
                    <p className="text-gray-600 text-lg mb-3">
                      {department.description || '暂无描述'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>创建于 {new Date(department.created_at || '').toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>ID: {department.id.slice(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="btn-hover"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑部门
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="outline"
                    className="btn-hover text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除部门
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">职位数量</p>
                    <p className="text-3xl font-bold text-gray-900">{department.jobs_count}</p>
                  </div>
                  <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center`}>
                    <Briefcase className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">员工数量</p>
                    <p className="text-3xl font-bold text-gray-900">{department.employee_count}</p>
                  </div>
                  <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center`}>
                    <Users className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">颜色主题</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-full ${colors.bg} ${colors.border} border-2`} />
                      <span className="text-lg font-medium text-gray-900 capitalize">{department.color_theme}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center`}>
                    <Building2 className={`w-6 h-6 ${colors.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 最近职位 */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  最近职位 ({department.recent_jobs.length})
                </CardTitle>
                <Link href={`/hr/jobs?department=${department.name}`}>
                  <Button variant="outline" size="sm" className="btn-hover">
                    查看全部
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {department.recent_jobs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {department.recent_jobs.map((job) => (
                    <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>创建于 {new Date(job.created_at).toLocaleDateString('zh-CN')}</span>
                            {job.salary_display && (
                              <span>薪资: {job.salary_display}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={job.status === 'active' ? 'default' : 'secondary'}
                            className={job.status === 'active' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {job.status === 'active' ? '已发布' : job.status}
                          </Badge>
                          <Link href={`/hr/jobs/${job.id}`}>
                            <Button variant="outline" size="sm" className="btn-hover">
                              <Eye className="w-3 h-3 mr-1" />
                              查看
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Briefcase className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无职位</h3>
                  <p className="text-gray-600 mb-4">该部门下还没有发布任何职位</p>
                  <Link href="/hr/jobs/create">
                    <Button className="btn-hover">
                      发布职位
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 编辑模态框 */}
      <DepartmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleEditSuccess}
        department={department}
        mode="edit"
      />

      {/* 删除确认对话框 */}
      <DeleteDepartmentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={handleDeleteSuccess}
        department={department}
      />
    </div>
  );
}

// 使用权限保护，只允许HR和管理员访问
export default withProtected(DepartmentDetailPage, ['hr', 'admin']);
