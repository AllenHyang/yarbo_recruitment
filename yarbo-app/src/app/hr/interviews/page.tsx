'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Edit,
  Eye,
  Trash2,
  CalendarDays,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { SmartInterviewScheduler } from "@/components/hr/SmartInterviewScheduler";

interface Interview {
  id: string;
  candidate_name: string;
  job_title: string;
  interviewer: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
  stage: string;
}

// 日历视图组件
function CalendarView({ interviews, onEditInterview }: {
  interviews: Interview[],
  onEditInterview: (interview: Interview) => void
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取当前月份的日期数组
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 从周日开始

    const days = [];
    for (let i = 0; i < 42; i++) { // 6周 x 7天
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // 获取指定日期的面试
  const getInterviewsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return interviews.filter(interview => interview.date === dateStr);
  };

  // 月份导航
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const days = getDaysInMonth(currentDate);
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              今天
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* 日历网格 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayStr = day.toISOString().split('T')[0];
            const dayInterviews = getInterviewsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = dayStr === today;

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-1 border border-gray-100 
                  ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} 
                  ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                  hover:bg-gray-50 transition-colors
                `}
              >
                <div className={`
                  text-sm font-medium mb-1 
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isToday ? 'text-blue-600' : ''}
                `}>
                  {day.getDate()}
                </div>

                {/* 面试事件 */}
                <div className="space-y-1">
                  {dayInterviews.slice(0, 3).map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => onEditInterview(interview)}
                      className={`
                        text-xs p-1 rounded cursor-pointer
                        ${interview.status === 'completed'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : interview.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }
                      `}
                    >
                      <div className="font-medium truncate">
                        {interview.time} {interview.candidate_name}
                      </div>
                      <div className="truncate">
                        {interview.job_title}
                      </div>
                    </div>
                  ))}
                  {dayInterviews.length > 3 && (
                    <div className="text-xs text-gray-500 p-1">
                      +{dayInterviews.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">已安排</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-600">已完成</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-100 rounded"></div>
            <span className="text-sm text-gray-600">待确认</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // 面试安排对话框状态
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    candidate_id: '',
    candidate_name: '',
    job_title: '',
    interviewer: '',
    type: 'technical',
    date: '',
    time: '',
    duration: 60,
    location: '',
    notes: ''
  });

  // 编辑面试对话框状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);

  // 候选人数据（实际项目中应该从API获取）
  const [candidates] = useState([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '+86 138-0013-8001',
      applied_jobs: [
        { job_id: '1', job_title: '资深全栈工程师', status: 'applied', applied_at: '2025-06-05' },
        { job_id: '2', job_title: '前端工程师', status: 'interview', applied_at: '2025-05-20' }
      ],
      skills: ['React', 'Node.js', 'Python'],
      experience: '5年',
      status: 'active'
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '+86 139-0014-8002',
      applied_jobs: [
        { job_id: '3', job_title: '前端工程师', status: 'applied', applied_at: '2025-06-03' }
      ],
      skills: ['Vue.js', 'JavaScript', 'CSS'],
      experience: '3年',
      status: 'active'
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '+86 137-0015-8003',
      applied_jobs: [
        { job_id: '1', job_title: '资深全栈工程师', status: 'pending', applied_at: '2025-06-01' }
      ],
      skills: ['React', 'TypeScript', 'Docker'],
      experience: '4年',
      status: 'active'
    }
  ]);

  // 面试官列表
  const [interviewers] = useState([
    { id: '1', name: '李经理', title: '技术总监', department: '技术部' },
    { id: '2', name: '王总监', title: '前端主管', department: '技术部' },
    { id: '3', name: '张HR', title: 'HR经理', department: '人力资源部' },
    { id: '4', name: '刘总', title: '产品总监', department: '产品部' }
  ]);

  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      candidate_name: '张三',
      job_title: '资深全栈工程师',
      interviewer: '李经理',
      type: 'technical',
      date: '2025-06-10',
      time: '14:00',
      duration: 60,
      location: '会议室A',
      status: 'scheduled',
      stage: '技术面试'
    },
    {
      id: '2',
      candidate_name: '李四',
      job_title: '前端工程师',
      interviewer: '王总监',
      type: 'video',
      date: '2025-06-11',
      time: '10:00',
      duration: 45,
      location: 'Zoom会议',
      status: 'completed',
      stage: 'HR面试'
    }
  ]);

  // 处理候选人选择
  const handleCandidateSelect = (candidateId: string) => {
    const selectedCandidate = candidates.find(c => c.id === candidateId);
    if (selectedCandidate) {
      setScheduleForm({
        ...scheduleForm,
        candidate_id: candidateId,
        candidate_name: selectedCandidate.name,
        // 如果候选人只申请了一个职位，自动填充
        job_title: selectedCandidate.applied_jobs.length === 1
          ? selectedCandidate.applied_jobs[0].job_title
          : ''
      });
    }
  };

  // 处理职位选择（根据候选人申请的职位）
  const getAppliedJobs = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate ? candidate.applied_jobs : [];
  };

  // 处理面试安排
  const handleScheduleInterview = () => {
    if (!scheduleForm.candidate_id || !scheduleForm.job_title || !scheduleForm.interviewer || !scheduleForm.date || !scheduleForm.time) {
      alert('请填写所有必要信息');
      return;
    }

    const newInterview: Interview = {
      id: String(interviews.length + 1),
      candidate_name: scheduleForm.candidate_name,
      job_title: scheduleForm.job_title,
      interviewer: scheduleForm.interviewer,
      type: scheduleForm.type,
      date: scheduleForm.date,
      time: scheduleForm.time,
      duration: scheduleForm.duration,
      location: scheduleForm.location,
      status: 'scheduled',
      stage: '技术面试'
    };

    setInterviews([...interviews, newInterview]);
    setScheduleForm({
      candidate_id: '',
      candidate_name: '',
      job_title: '',
      interviewer: '',
      type: 'technical',
      date: '',
      time: '',
      duration: 60,
      location: '',
      notes: ''
    });
    setIsScheduleDialogOpen(false);
  };

  // 处理编辑面试
  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview);
    setIsEditDialogOpen(true);
  };

  // 更新面试信息
  const handleUpdateInterview = () => {
    if (editingInterview) {
      setInterviews(interviews.map(i =>
        i.id === editingInterview.id ? editingInterview : i
      ));
      setEditingInterview(null);
      setIsEditDialogOpen(false);
    }
  };

  // 删除面试
  const handleDeleteInterview = (id: string) => {
    if (confirm('确定要删除这个面试安排吗？')) {
      setInterviews(interviews.filter(i => i.id !== id));
    }
  };

  // 切换日历视图
  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return '已安排';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      case 'pending': return '待确认';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'onsite': return <MapPin className="w-4 h-4" />;
      case 'phone': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video': return '视频面试';
      case 'onsite': return '现场面试';
      case 'phone': return '电话面试';
      case 'technical': return '技术面试';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                面试管理
              </h1>
              <p className="text-gray-600 mt-1">安排和管理面试时间</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={toggleViewMode}>
                <CalendarDays className="w-4 h-4 mr-2" />
                {viewMode === 'list' ? '日历视图' : '列表视图'}
              </Button>

              <SmartInterviewScheduler
                applicationId="app_demo"
                candidateId="candidate_demo"
                jobId="job_demo"
                candidateName="演示候选人"
                jobTitle="演示职位"
                onScheduleConfirmed={(schedule) => {
                  console.log('智能调度完成:', schedule);
                  // 这里可以添加到面试列表
                }}
                trigger={
                  <Button variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    智能调度
                  </Button>
                }
              />

              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    手动安排
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>安排新面试</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="candidate_select">选择候选人 *</Label>
                      <Select value={scheduleForm.candidate_id} onValueChange={handleCandidateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择候选人" />
                        </SelectTrigger>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{candidate.name}</span>
                                <span className="text-xs text-gray-500">
                                  {candidate.email} · {candidate.experience}经验
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {scheduleForm.candidate_id && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <div className="font-medium">候选人信息：</div>
                          <div className="text-gray-600">
                            {candidates.find(c => c.id === scheduleForm.candidate_id)?.email} ·
                            {candidates.find(c => c.id === scheduleForm.candidate_id)?.phone}
                          </div>
                          <div className="text-gray-600">
                            技能：{candidates.find(c => c.id === scheduleForm.candidate_id)?.skills.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="job_title">申请职位 *</Label>
                      {scheduleForm.candidate_id ? (
                        <Select value={scheduleForm.job_title} onValueChange={(value) => setScheduleForm({ ...scheduleForm, job_title: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择申请的职位" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAppliedJobs(scheduleForm.candidate_id).map((job, index) => (
                              <SelectItem key={index} value={job.job_title}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{job.job_title}</span>
                                  <span className="text-xs text-gray-500">
                                    申请状态：{job.status === 'applied' ? '已申请' : job.status === 'interview' ? '面试中' : '待处理'} ·
                                    申请时间：{job.applied_at}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-500 p-2 border border-dashed rounded">
                          请先选择候选人
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="interviewer">面试官 *</Label>
                      <Select value={scheduleForm.interviewer} onValueChange={(value) => setScheduleForm({ ...scheduleForm, interviewer: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择面试官" />
                        </SelectTrigger>
                        <SelectContent>
                          {interviewers.map((interviewer) => (
                            <SelectItem key={interviewer.id} value={interviewer.name}>
                              <div className="flex flex-col">
                                <span className="font-medium">{interviewer.name}</span>
                                <span className="text-xs text-gray-500">
                                  {interviewer.title} · {interviewer.department}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">面试日期 *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">面试时间 *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">面试类型</Label>
                        <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm({ ...scheduleForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">技术面试</SelectItem>
                            <SelectItem value="video">视频面试</SelectItem>
                            <SelectItem value="onsite">现场面试</SelectItem>
                            <SelectItem value="phone">电话面试</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">时长(分钟)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={scheduleForm.duration}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                          min="15"
                          max="180"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">地点</Label>
                      <Input
                        id="location"
                        value={scheduleForm.location}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                        placeholder="会议室/视频会议链接"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleScheduleInterview}>
                        确认安排
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">今日面试</p>
                    <p className="text-2xl font-bold text-blue-600">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">已完成</p>
                    <p className="text-2xl font-bold text-green-600">
                      {interviews.filter(i => i.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待确认</p>
                    <p className="text-2xl font-bold text-yellow-600">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">本周安排</p>
                    <p className="text-2xl font-bold text-purple-600">8</p>
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
                      placeholder="搜索候选人、职位或面试官..."
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
                      <SelectItem value="scheduled">已安排</SelectItem>
                      <SelectItem value="completed">已完成</SelectItem>
                      <SelectItem value="pending">待确认</SelectItem>
                      <SelectItem value="cancelled">已取消</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 面试列表 */}
          {viewMode === 'list' ? (
            <Card>
              <CardHeader>
                <CardTitle>面试安排 ({interviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>候选人</TableHead>
                      <TableHead>职位</TableHead>
                      <TableHead>面试官</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>地点</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interview.candidate_name}</div>
                            <div className="text-sm text-gray-500">{interview.stage}</div>
                          </div>
                        </TableCell>
                        <TableCell>{interview.job_title}</TableCell>
                        <TableCell>{interview.interviewer}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{interview.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{interview.time} ({interview.duration}分钟)</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(interview.type)}
                            <span className="text-sm">{getTypeText(interview.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{interview.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(interview.status)}>
                            {getStatusText(interview.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditInterview(interview)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInterview(interview.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              邮件
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <CalendarView interviews={interviews} onEditInterview={handleEditInterview} />
          )}

          {/* 编辑面试对话框 */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>编辑面试安排</DialogTitle>
              </DialogHeader>
              {editingInterview && (
                <div className="space-y-4">
                  <div>
                    <Label>候选人姓名</Label>
                    <Input
                      value={editingInterview.candidate_name}
                      onChange={(e) => setEditingInterview({ ...editingInterview, candidate_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>职位</Label>
                    <Input
                      value={editingInterview.job_title}
                      onChange={(e) => setEditingInterview({ ...editingInterview, job_title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>面试官</Label>
                    <Input
                      value={editingInterview.interviewer}
                      onChange={(e) => setEditingInterview({ ...editingInterview, interviewer: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>面试日期</Label>
                      <Input
                        type="date"
                        value={editingInterview.date}
                        onChange={(e) => setEditingInterview({ ...editingInterview, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>面试时间</Label>
                      <Input
                        type="time"
                        value={editingInterview.time}
                        onChange={(e) => setEditingInterview({ ...editingInterview, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>面试状态</Label>
                    <Select value={editingInterview.status} onValueChange={(value) => setEditingInterview({ ...editingInterview, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">已安排</SelectItem>
                        <SelectItem value="completed">已完成</SelectItem>
                        <SelectItem value="pending">待确认</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>地点</Label>
                    <Input
                      value={editingInterview.location}
                      onChange={(e) => setEditingInterview({ ...editingInterview, location: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleUpdateInterview}>
                      保存修改
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 