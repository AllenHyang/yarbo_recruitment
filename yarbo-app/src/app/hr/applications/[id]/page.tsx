'use client';

export const runtime = 'edge';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Star,
  MessageCircle,
  Calendar,
  User,
  Briefcase,
  FileText
} from "lucide-react";
import Link from "next/link";
import { ResumePreviewButton } from "@/components/ResumeViewer";
import { StatusUpdateDialog } from "@/components/StatusUpdateDialog";

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const [status, setStatus] = useState('reviewing');
  const [notes, setNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState([
    { date: '2025-06-08 14:30', event: '提交申请', status: 'completed' },
    { date: '2025-06-09 09:00', event: '简历筛选', status: 'completed' },
    { date: '2025-06-09 16:00', event: 'HR初审', status: 'current' },
    { date: '', event: '技术面试', status: 'pending' },
    { date: '', event: '终面', status: 'pending' }
  ]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  // 模拟申请详情数据
  const application = {
    id,
    candidate: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '+86 138-0013-8000',
      avatar: '',
      experience: '5年',
      education: '本科',
      current_position: '高级前端工程师',
      current_company: 'ABC科技有限公司'
    },
    job: {
      title: '资深全栈工程师',
      department: '技术部',
      location: '北京'
    },
    status: 'reviewing',
    rating: 4,
    applied_at: '2025-06-08 14:30',
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_letter: '尊敬的HR，我对贵公司的全栈工程师职位非常感兴趣...',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'MySQL', 'Redis'],
    timeline: statusHistory
  };

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

  const handleStatusChange = (newStatus: string) => {
    // 打开状态更新对话框而不是直接更新
    setShowStatusDialog(true);
  };

  const handleStatusUpdated = (newStatus: string, newStatusHistory: any[]) => {
    setStatus(newStatus);
    if (newStatusHistory) {
      // 转换API返回的状态历史为时间线格式
      const newTimeline = newStatusHistory.map((item, index) => ({
        event: item.note || `状态更新为 ${getStatusText(item.status)}`,
        date: item.changed_at,
        status: index === newStatusHistory.length - 1 ? 'current' : 'completed'
      }));
      setStatusHistory(newTimeline);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/hr/applications">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{application.candidate.name} 的申请</h1>
                <p className="text-gray-600 mt-1">{application.job.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                发送邮件
              </Button>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                安排面试
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要内容区域 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 候选人信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>候选人信息</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{application.candidate.name}</h3>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{application.candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{application.candidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{application.candidate.current_position} @ {application.candidate.current_company}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">工作经验：</span>
                      <span className="font-medium">{application.candidate.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">教育背景：</span>
                      <span className="font-medium">{application.candidate.education}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 技能标签 */}
              <Card>
                <CardHeader>
                  <CardTitle>技能标签</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 求职信 */}
              <Card>
                <CardHeader>
                  <CardTitle>求职信</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{application.cover_letter}</p>
                </CardContent>
              </Card>

              {/* 评估记录 */}
              <Card>
                <CardHeader>
                  <CardTitle>评估记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">综合评分：</span>
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
                        <span className="ml-2 font-medium">{application.rating}/5</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">添加评估备注</label>
                      <Textarea
                        placeholder="请输入对该候选人的评估意见..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 状态管理 */}
              <Card>
                <CardHeader>
                  <CardTitle>状态管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">申请状态</label>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="reviewing">审核中</SelectItem>
                        <SelectItem value="interview">面试中</SelectItem>
                        <SelectItem value="hired">已录用</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Badge className={getStatusColor(status)}>
                    {getStatusText(status)}
                  </Badge>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ResumePreviewButton
                    resumeUrl={application.resume_url}
                    resumeName={`${application.candidate.name}_简历.pdf`}
                    candidateName={application.candidate.name}
                    className="w-full"
                  />

                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    发送邮件
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    安排面试
                  </Button>
                </CardContent>
              </Card>

              {/* 申请时间线 */}
              <Card>
                <CardHeader>
                  <CardTitle>申请流程</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {application.timeline.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.status === 'completed' ? 'bg-green-500' :
                          item.status === 'current' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.event}</div>
                          {item.date && (
                            <div className="text-xs text-gray-500">{item.date}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 状态更新对话框 */}
      <StatusUpdateDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        applicationId={id as string}
        currentStatus={status}
        candidateName={application.candidate.name}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}