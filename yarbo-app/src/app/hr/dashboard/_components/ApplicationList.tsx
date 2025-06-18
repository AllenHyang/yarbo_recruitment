"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { ResumePreviewButton } from "@/components/ResumePreviewButton"; // 待实现
import { getApplicationsForHR } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { ApplicationWithDetails } from "@/lib/database.types";
import { Eye, Mail, Phone, Star, Filter, RefreshCw, Send, User, Calendar, Building2, Clock, TrendingUp, FileText } from "lucide-react";
// import { useApplicationEmail } from "@/hooks/useEmailNotification";

export function ApplicationList() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 邮件通知功能 - 暂时禁用以修复编译错误
  // const { sendStatusUpdate, sendInterviewInvitation, state: emailState } = useApplicationEmail();

  // 临时邮件发送函数 - 等待email系统修复后恢复
  const sendStatusUpdate = async (email: string, name: string, jobTitle: string, applicationId: string, message: string) => {
    console.log('邮件发送功能暂时禁用 - Status Update:', { email, name, jobTitle, applicationId, message });
  };
  
  const sendInterviewInvitation = async (email: string, name: string, jobTitle: string, applicationId: string, message: string) => {
    console.log('邮件发送功能暂时禁用 - Interview Invitation:', { email, name, jobTitle, applicationId, message });
  };

  const fetchApplications = async (refresh = false) => {
    if (!user?.id) return;
    
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getApplicationsForHR(user.id);
      setApplications(data || []);
      setError(null);
    } catch (err) {
      console.error("获取申请失败:", err);
      setError("加载申请列表失败");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.id]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'reviewing':
        return 'secondary';
      case 'interviewed':
        return 'default';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'reviewing':
        return 'text-blue-600 bg-blue-50';
      case 'interviewed':
        return 'text-purple-600 bg-purple-50';
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'reviewing':
        return '审核中';
      case 'interviewed':
        return '已面试';
      case 'accepted':
        return '已录用';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知状态';
    }
  };

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">申请管理</CardTitle>
              <CardDescription>正在加载申请数据...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>收到的申请</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  // 筛选申请列表
  const filteredApplications = applications.filter(app => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      // 更新本地状态
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      // TODO: 调用后端API更新数据库状态
      console.log(`更新申请 ${applicationId} 状态为 ${newStatus}`);
      
      // 发送邮件通知
      const application = applications.find(app => app.id === applicationId);
      if (application?.applicant) {
        const candidateName = application.applicant.name || '候选人';
        const candidateEmail = application.applicant.email;
        const jobTitle = application.job?.title || '职位';
        
        if (candidateEmail) {
          if (newStatus === 'reviewing') {
            await sendStatusUpdate(
              candidateEmail,
              candidateName,
              jobTitle,
              applicationId,
              '我们正在仔细审核您的申请材料，预计会在2个工作日内给出初步反馈。'
            );
          } else if (newStatus === 'interviewed') {
            await sendInterviewInvitation(
              candidateEmail,
              candidateName,
              jobTitle,
              applicationId,
              '请等待HR联系确定具体面试时间'
            );
          }
        }
      }
      
    } catch (error) {
      console.error('状态更新失败:', error);
      // 回滚状态
      fetchApplications(true);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center space-x-2">
                <span>申请管理</span>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  filteredApplications.length > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {filteredApplications.length} 条记录
                </div>
              </CardTitle>
              <CardDescription>
                {applications.length !== filteredApplications.length ? 
                  `筛选显示 ${filteredApplications.length} / 共 ${applications.length} 条申请` :
                  `共 ${applications.length} 条申请记录`
                }
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="reviewing">审核中</SelectItem>
                  <SelectItem value="interviewed">已面试</SelectItem>
                  <SelectItem value="accepted">已录用</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 刷新按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchApplications(true)}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>刷新</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center mb-4 mx-auto">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === "all" ? "暂无申请记录" : "当前筛选条件下暂无申请"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {statusFilter === "all" ? 
                "目前还没有收到任何求职申请，请耐心等待候选人投递简历。" :
                "尝试更换筛选条件或刷新页面查看最新数据。"
              }
            </p>
            <Button variant="outline" onClick={() => fetchApplications(true)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新数据
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 申请卡片列表 - 替代表格显示 */}
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* 申请者信息 */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {/* 基本信息 */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {application.applicant?.name || '未知申请者'}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{application.applicant?.email}</span>
                              </div>
                              {application.applicant?.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{application.applicant?.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* 状态徽章 */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </div>
                        </div>
                        
                        {/* 职位和时间信息 */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{application.job?.title}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-600">{application.job?.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(application.applied_at || Date.now()).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {/* 操作按钮区域 */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-3">
                            {/* 状态更改 */}
                            <Select 
                              value={application.status} 
                              onValueChange={(value) => handleStatusChange(application.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">待处理</SelectItem>
                                <SelectItem value="reviewing">审核中</SelectItem>
                                <SelectItem value="interviewed">已面试</SelectItem>
                                <SelectItem value="accepted">已录用</SelectItem>
                                <SelectItem value="rejected">已拒绝</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {/* 简历预览 */}
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              查看简历
                            </Button>
                          </div>
                          
                          {/* 快捷操作 */}
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-3">
                              <Eye className="h-4 w-4 mr-1" />
                              详情
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-3">
                              <Star className="h-4 w-4 mr-1" />
                              收藏
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}