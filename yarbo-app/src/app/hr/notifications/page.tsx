'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Search,
  Filter,
  Settings,
  Send,
  Calendar,
  Briefcase,
  Users,
  FileText,
  Star,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Globe,
  Zap,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Activity,
  Target
} from "lucide-react";

interface Notification {
  id: string;
  type: 'application' | 'interview' | 'system' | 'reminder' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  relatedId?: string;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  usage: number;
  createdAt: string;
  lastUsed?: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  // 模拟通知数据
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'application',
      title: '新的职位申请',
      message: '张三申请了"高级前端工程师"职位，请及时查看简历',
      timestamp: '2025-06-09T10:30:00Z',
      read: false,
      priority: 'high',
      category: '申请管理',
      relatedId: 'app_001',
      actions: [
        { label: '查看简历', action: 'view_resume', variant: 'default' },
        { label: '安排面试', action: 'schedule_interview', variant: 'outline' }
      ]
    },
    {
      id: '2',
      type: 'interview',
      title: '面试提醒',
      message: '30分钟后与李四进行技术面试（会议室A）',
      timestamp: '2025-06-09T09:30:00Z',
      read: false,
      priority: 'urgent',
      category: '面试安排',
      relatedId: 'int_002',
      actions: [
        { label: '查看详情', action: 'view_interview', variant: 'default' },
        { label: '重新安排', action: 'reschedule', variant: 'outline' }
      ]
    },
    {
      id: '3',
      type: 'system',
      title: '系统维护通知',
      message: '系统将于今晚23:00-01:00进行维护升级，期间可能影响使用',
      timestamp: '2025-06-09T08:00:00Z',
      read: true,
      priority: 'medium',
      category: '系统通知',
      actions: [
        { label: '了解详情', action: 'view_maintenance', variant: 'outline' }
      ]
    },
    {
      id: '4',
      type: 'reminder',
      title: '候选人跟进提醒',
      message: '王五的面试已过3天，请及时给出反馈和决定',
      timestamp: '2025-06-09T07:45:00Z',
      read: false,
      priority: 'medium',
      category: '任务提醒',
      relatedId: 'can_003',
      actions: [
        { label: '录入反馈', action: 'add_feedback', variant: 'default' },
        { label: '稍后提醒', action: 'snooze', variant: 'outline' }
      ]
    },
    {
      id: '5',
      type: 'alert',
      title: '职位即将到期',
      message: '"产品经理"职位将在3天后到期，是否需要延期？',
      timestamp: '2025-06-08T16:20:00Z',
      read: true,
      priority: 'high',
      category: '职位管理',
      relatedId: 'job_004',
      actions: [
        { label: '延期发布', action: 'extend_job', variant: 'default' },
        { label: '关闭职位', action: 'close_job', variant: 'destructive' }
      ]
    },
    {
      id: '6',
      type: 'application',
      title: '批量申请通知',
      message: '今日收到15份新申请，其中5份来自推荐候选人',
      timestamp: '2025-06-08T12:00:00Z',
      read: true,
      priority: 'low',
      category: '申请管理',
      actions: [
        { label: '查看申请', action: 'view_applications', variant: 'outline' }
      ]
    }
  ]);

  // 模拟通知模板数据
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: '面试邀请模板',
      type: '面试通知',
      subject: '面试邀请 - {{job_title}}职位',
      content: '亲爱的{{candidate_name}}，感谢您申请我们的{{job_title}}职位...',
      usage: 25,
      createdAt: '2025-06-01T10:00:00Z',
      lastUsed: '2025-06-09T08:30:00Z'
    },
    {
      id: '2',
      name: '申请确认模板',
      type: '申请通知',
      subject: '申请确认 - 感谢您的申请',
      content: '感谢您申请{{job_title}}职位，我们已收到您的简历...',
      usage: 18,
      createdAt: '2025-06-01T10:00:00Z',
      lastUsed: '2025-06-08T15:20:00Z'
    },
    {
      id: '3',
      name: '录用通知模板',
      type: '录用通知',
      subject: '恭喜！您已被录用',
      content: '恭喜您通过面试，我们很高兴邀请您加入我们的团队...',
      usage: 12,
      createdAt: '2025-06-01T10:00:00Z',
      lastUsed: '2025-06-07T11:10:00Z'
    },
    {
      id: '4',
      name: '拒绝通知模板',
      type: '申请通知',
      subject: '申请结果通知',
      content: '感谢您对我们公司的关注，经过慎重考虑...',
      usage: 8,
      createdAt: '2025-06-01T10:00:00Z',
      lastUsed: '2025-06-06T14:45:00Z'
    }
  ]);

  // 筛选通知
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesRead = !showOnlyUnread || !notification.read;
    
    return matchesSearch && matchesType && matchesRead;
  });

  // 获取通知类型图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application': return <User className="w-5 h-5" />;
      case 'interview': return <Calendar className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  // 获取优先级样式
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: '紧急' };
      case 'high':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', text: '高' };
      case 'medium':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: '中' };
      case 'low':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: '低' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: priority };
    }
  };

  // 获取通知颜色
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application': return 'text-blue-600 bg-blue-50';
      case 'interview': return 'text-green-600 bg-green-50';
      case 'system': return 'text-purple-600 bg-purple-50';
      case 'reminder': return 'text-orange-600 bg-orange-50';
      case 'alert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 标记为已读
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // 批量操作
  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'mark_read':
        setNotifications(prev => 
          prev.map(notification => 
            selectedNotifications.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        );
        break;
      case 'delete':
        setNotifications(prev => 
          prev.filter(notification => 
            !selectedNotifications.includes(notification.id)
          )
        );
        break;
    }
    setSelectedNotifications([]);
  };

  // 处理通知操作
  const handleNotificationAction = (notificationId: string, action: string) => {
    console.log(`执行操作: ${action} for notification: ${notificationId}`);
  };

  // 计算统计数据
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
    today: notifications.filter(n => {
      const today = new Date().toDateString();
      const notificationDate = new Date(n.timestamp).toDateString();
      return today === notificationDate;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              通知中心
            </h1>
            <p className="text-xl text-gray-600 mb-6">统一管理系统通知和消息</p>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto"></div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button onClick={() => setShowSettings(true)} className="bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              通知设置
            </Button>
            <Button variant="outline" className="border-gray-300 hover:border-blue-300">
              <Archive className="w-4 h-4 mr-2" />
              归档记录
            </Button>
            <Button variant="outline" className="border-gray-300 hover:border-blue-300">
              <Send className="w-4 h-4 mr-2" />
              发送通知
            </Button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-4 mx-auto">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">总通知</div>
                <div className="text-xs text-gray-500">全部消息</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mb-4 mx-auto">
                  <BellRing className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.unread}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">未读消息</div>
                <div className="text-xs text-gray-500">待处理</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mb-4 mx-auto">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600 mb-2">{stats.urgent}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">紧急通知</div>
                <div className="text-xs text-gray-500">需立即处理</div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center mb-4 mx-auto">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.today}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">今日消息</div>
                <div className="text-xs text-gray-500">当日接收</div>
              </CardContent>
            </Card>
          </div>

          {/* 通知管理选项卡 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white shadow-sm border-0 p-1">
              <TabsTrigger value="notifications" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Bell className="w-4 h-4" />
                <span>通知列表</span>
                {stats.unread > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <FileText className="w-4 h-4" />
                <span>通知模板</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <TrendingUp className="w-4 h-4" />
                <span>通知分析</span>
              </TabsTrigger>
            </TabsList>

            {/* 通知列表选项卡 */}
            <TabsContent value="notifications" className="space-y-8">
              {/* 搜索和筛选 */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="搜索通知内容..."
                        className="pl-10 border-gray-300 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40 border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="通知类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="application">申请通知</SelectItem>
                        <SelectItem value="interview">面试提醒</SelectItem>
                        <SelectItem value="system">系统通知</SelectItem>
                        <SelectItem value="reminder">任务提醒</SelectItem>
                        <SelectItem value="alert">警告通知</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant={showOnlyUnread ? "default" : "outline"}
                      onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                      className={showOnlyUnread ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:border-blue-300"}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      仅显示未读
                    </Button>

                    {selectedNotifications.length > 0 && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBulkAction('mark_read')}
                          className="border-gray-300 hover:border-blue-300"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          标记已读
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBulkAction('delete')}
                          className="border-red-300 hover:border-red-400 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 通知列表 */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">通知列表 ({filteredNotifications.length})</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-300">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        全部已读
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 hover:border-red-300 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        清空已读
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => {
                      const priorityBadge = getPriorityBadge(notification.priority);
                      const colorClasses = getNotificationColor(notification.type);
                      
                      return (
                        <div 
                          key={notification.id} 
                          className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                            notification.read ? 'bg-gray-50' : 'bg-white border-l-4'
                          } ${!notification.read ? 'border-l-blue-500' : ''}`}
                        >
                          <div className="flex items-start space-x-4">
                            <input
                              type="checkbox"
                              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedNotifications(prev => [...prev, notification.id]);
                                } else {
                                  setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                                }
                              }}
                            />
                            
                            <div className={`w-12 h-12 rounded-xl ${colorClasses} flex items-center justify-center flex-shrink-0`}>
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <h4 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </h4>
                                  <Badge className={priorityBadge.color} variant="outline">
                                    {priorityBadge.text}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-gray-200">
                                    {notification.category}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.timestamp).toLocaleString('zh-CN')}
                                  </span>
                                  {!notification.read && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="hover:bg-blue-50"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <p className={`text-sm mb-3 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              
                              {notification.actions && notification.actions.length > 0 && (
                                <div className="flex space-x-2">
                                  {notification.actions.map((action, idx) => (
                                    <Button 
                                      key={idx}
                                      variant={action.variant || 'outline'}
                                      size="sm"
                                      onClick={() => handleNotificationAction(notification.id, action.action)}
                                      className={
                                        action.variant === 'default' 
                                          ? "bg-blue-600 hover:bg-blue-700" 
                                          : action.variant === 'destructive'
                                          ? "border-red-300 text-red-600 hover:bg-red-50"
                                          : "border-gray-300 hover:border-blue-300"
                                      }
                                    >
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">暂无通知</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 通知模板选项卡 */}
            <TabsContent value="templates" className="space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>通知模板管理</span>
                      </CardTitle>
                      <CardDescription>创建和管理常用的通知模板</CardDescription>
                    </div>
                    <Button onClick={() => setShowNewTemplate(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      创建模板
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                      <Card key={template.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <Button variant="outline" size="sm" className="border-gray-300">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.subject}</p>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">类型:</span>
                                <Badge variant="outline" className="text-xs border-gray-200">
                                  {template.type}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">使用次数:</span>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {template.usage}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">最后使用:</span>
                                <span className="text-xs">{template.lastUsed ? new Date(template.lastUsed).toLocaleDateString('zh-CN') : '从未使用'}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" className="flex-1 border-gray-300 hover:border-blue-300">
                                编辑
                              </Button>
                              <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                使用
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 通知分析选项卡 */}
            <TabsContent value="analytics" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 通知统计 */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span>通知统计</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">今日发送</span>
                            <p className="text-xs text-gray-600">当日总发送量</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">24</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">本周发送</span>
                            <p className="text-xs text-gray-600">本周累计发送</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-green-600">156</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">平均响应时间</span>
                            <p className="text-xs text-gray-600">通知处理速度</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">2.5h</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Target className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-900">点击率</span>
                            <p className="text-xs text-gray-600">通知交互率</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-purple-600">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 热门通知类型 */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span>热门通知类型</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">申请通知</span>
                            <span className="text-sm text-gray-600">45%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">面试提醒</span>
                            <span className="text-sm text-gray-600">32%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">任务提醒</span>
                            <span className="text-sm text-gray-600">23%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">系统通知</span>
                            <span className="text-sm text-gray-600">15%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 使用趋势图表占位 */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>通知发送趋势</CardTitle>
                  <CardDescription>过去30天的通知发送情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">图表功能开发中...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 通知设置对话框 */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>通知设置</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">通知设置功能开发中...</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  取消
                </Button>
                <Button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700">
                  保存设置
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 新建模板对话框 */}
          <Dialog open={showNewTemplate} onOpenChange={setShowNewTemplate}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span>创建通知模板</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>模板名称</Label>
                    <Input placeholder="输入模板名称" className="border-gray-300 focus:border-blue-500" />
                  </div>
                  <div>
                    <Label>通知类型</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interview">面试通知</SelectItem>
                        <SelectItem value="application">申请通知</SelectItem>
                        <SelectItem value="offer">录用通知</SelectItem>
                        <SelectItem value="rejection">拒绝通知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>邮件主题</Label>
                  <Input placeholder="输入邮件主题" className="border-gray-300 focus:border-blue-500" />
                </div>
                
                <div>
                  <Label>邮件内容</Label>
                  <Textarea 
                    placeholder="输入邮件内容，可使用 {{candidate_name}}, {{job_title}} 等变量"
                    className="min-h-32 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                  取消
                </Button>
                <Button onClick={() => setShowNewTemplate(false)} className="bg-blue-600 hover:bg-blue-700">
                  创建模板
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 