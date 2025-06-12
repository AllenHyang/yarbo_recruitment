'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings,
  User,
  Users,
  Bell,
  Shield,
  Mail,
  Database,
  Globe,
  Lock,
  Key,
  Palette,
  Server,
  Monitor,
  Smartphone,
  Save,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Zap,
  Filter
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'hr' | 'interviewer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar?: string;
  department: string;
}

interface SystemConfig {
  companyName: string;
  companyLogo: string;
  timezone: string;
  language: string;
  dateFormat: string;
  emailDomain: string;
  maxFileSize: number;
  sessionTimeout: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 系统配置
  const [config, setConfig] = useState<SystemConfig>({
    companyName: 'Yarbo 科技',
    companyLogo: '/logo.png',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    emailDomain: '@yarbo.com',
    maxFileSize: 10,
    sessionTimeout: 30
  });

  // 用户列表
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: '张经理',
      email: 'zhang@yarbo.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2025-06-09T10:30:00Z',
      department: '人力资源部'
    },
    {
      id: '2',
      name: '李专员',
      email: 'li@yarbo.com',
      role: 'hr',
      status: 'active',
      lastLogin: '2025-06-09T09:15:00Z',
      department: '人力资源部'
    },
    {
      id: '3',
      name: '王面试官',
      email: 'wang@yarbo.com',
      role: 'interviewer',
      status: 'active',
      lastLogin: '2025-06-08T16:45:00Z',
      department: '技术部'
    },
    {
      id: '4',
      name: '刘观察员',
      email: 'liu@yarbo.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '2025-06-05T14:20:00Z',
      department: '产品部'
    }
  ]);

  // 通知设置
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    applicationAlerts: true,
    interviewReminders: true,
    systemUpdates: false,
    weeklyReports: true,
    marketingEmails: false
  });

  // 权限配置
  const permissions = {
    admin: {
      name: '系统管理员',
      description: '拥有全部系统权限',
      permissions: ['全部功能', '用户管理', '系统配置', '数据导出']
    },
    hr: {
      name: 'HR专员',
      description: '招聘管理相关权限',
      permissions: ['职位管理', '候选人管理', '面试安排', '数据分析']
    },
    interviewer: {
      name: '面试官',
      description: '面试相关权限',
      permissions: ['查看候选人', '面试评价', '查看面试安排']
    },
    viewer: {
      name: '观察员',
      description: '只读权限',
      permissions: ['查看数据', '查看报告']
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hr': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interviewer': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveConfig = () => {
    console.log('保存系统配置:', config);
    // 这里应该调用API保存配置
  };

  const handleSaveNotifications = () => {
    console.log('保存通知设置:', notificationSettings);
    // 这里应该调用API保存设置
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              系统设置
            </h1>
            <p className="text-xl text-gray-600 mb-6">管理系统配置和用户权限</p>
            <div className="w-24 h-1 bg-blue-600 rounded-full mx-auto"></div>
          </div>

          {/* 设置选项卡 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white shadow-sm border-0 p-1">
              <TabsTrigger value="general" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Settings className="w-4 h-4" />
                <span>基本设置</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Users className="w-4 h-4" />
                <span>用户管理</span>
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Shield className="w-4 h-4" />
                <span>权限配置</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Bell className="w-4 h-4" />
                <span>通知设置</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Lock className="w-4 h-4" />
                <span>安全设置</span>
              </TabsTrigger>
            </TabsList>

            {/* 基本设置 */}
            <TabsContent value="general" className="space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>公司信息</span>
                  </CardTitle>
                  <CardDescription>配置公司基本信息和系统参数</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName">公司名称</Label>
                      <Input 
                        id="companyName"
                        value={config.companyName}
                        onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emailDomain">邮箱域名</Label>
                      <Input 
                        id="emailDomain"
                        value={config.emailDomain}
                        onChange={(e) => setConfig(prev => ({ ...prev, emailDomain: e.target.value }))}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="timezone">时区</Label>
                      <Select value={config.timezone} onValueChange={(value) => setConfig(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                          <SelectItem value="America/New_York">美国东部时间 (UTC-5)</SelectItem>
                          <SelectItem value="Europe/London">英国时间 (UTC+0)</SelectItem>
                          <SelectItem value="Asia/Tokyo">日本时间 (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="language">语言</Label>
                      <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh-CN">简体中文</SelectItem>
                          <SelectItem value="en-US">English</SelectItem>
                          <SelectItem value="ja-JP">日本語</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="maxFileSize">最大文件大小 (MB)</Label>
                      <Input 
                        id="maxFileSize"
                        type="number"
                        value={config.maxFileSize}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sessionTimeout">会话超时 (分钟)</Label>
                      <Input 
                        id="sessionTimeout"
                        type="number"
                        value={config.sessionTimeout}
                        onChange={(e) => setConfig(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveConfig} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      保存设置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 用户管理 */}
            <TabsContent value="users" className="space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>用户管理</span>
                      </CardTitle>
                      <CardDescription>管理系统用户和访问权限</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      添加用户
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <Badge className={getRoleColor(user.role)} variant="outline">
                                {permissions[user.role]?.name || user.role}
                              </Badge>
                              <Badge className={getStatusColor(user.status)} variant="outline">
                                {user.status === 'active' ? '活跃' : user.status === 'inactive' ? '非活跃' : '待审核'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span>{user.email}</span>
                              <span className="mx-2">•</span>
                              <span>{user.department}</span>
                              <span className="mx-2">•</span>
                              <span>最后登录: {new Date(user.lastLogin).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-300">
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user)}
                            className="border-red-300 hover:border-red-400 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 权限配置 */}
            <TabsContent value="permissions" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Object.entries(permissions).map(([key, permission]) => (
                  <Card key={key} className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        <span>{permission.name}</span>
                        <Badge className={getRoleColor(key)} variant="outline">
                          {key}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{permission.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">权限范围:</Label>
                        {permission.permissions.map((perm, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{perm}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-300">
                          <Edit className="w-3 h-3 mr-1" />
                          编辑权限
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* 通知设置 */}
            <TabsContent value="notifications" className="space-y-8">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>通知偏好</span>
                  </CardTitle>
                  <CardDescription>配置系统通知和提醒设置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900">通知方式</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="font-medium">邮件通知</span>
                            <p className="text-sm text-gray-600">接收邮件提醒</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <div>
                            <span className="font-medium">推送通知</span>
                            <p className="text-sm text-gray-600">浏览器推送提醒</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-orange-600" />
                          <div>
                            <span className="font-medium">短信通知</span>
                            <p className="text-sm text-gray-600">紧急事项短信提醒</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-medium text-gray-900">通知内容</h4>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">申请提醒</span>
                          <p className="text-sm text-gray-600">新申请通知</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.applicationAlerts}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, applicationAlerts: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">面试提醒</span>
                          <p className="text-sm text-gray-600">面试安排通知</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.interviewReminders}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, interviewReminders: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">系统更新</span>
                          <p className="text-sm text-gray-600">系统维护通知</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.systemUpdates}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">周报</span>
                          <p className="text-sm text-gray-600">每周数据报告</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      保存设置
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 安全设置 */}
            <TabsContent value="security" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lock className="w-5 h-5 text-red-600" />
                      <span>密码策略</span>
                    </CardTitle>
                    <CardDescription>配置密码安全要求</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">最小长度要求</span>
                      <span className="text-sm font-medium">8位</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">包含大小写</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">包含数字</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">包含特殊字符</span>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">密码有效期</span>
                      <span className="text-sm font-medium">90天</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="w-5 h-5 text-orange-600" />
                      <span>访问控制</span>
                    </CardTitle>
                    <CardDescription>配置访问安全策略</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">双因素认证</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">IP白名单</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">登录失败锁定</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">会话监控</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">操作日志</span>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span>最近登录记录</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { user: '张经理', ip: '192.168.1.100', time: '2025-06-09 10:30', device: 'Chrome / Windows' },
                        { user: '李专员', ip: '192.168.1.101', time: '2025-06-09 09:15', device: 'Safari / macOS' },
                        { user: '王面试官', ip: '192.168.1.102', time: '2025-06-08 16:45', device: 'Firefox / Linux' }
                      ].map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{record.user}</div>
                              <div className="text-xs text-gray-600">{record.device}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{record.time}</div>
                            <div className="text-xs text-gray-600">{record.ip}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* 添加用户对话框 */}
          <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <span>添加新用户</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>姓名</Label>
                    <Input placeholder="输入用户姓名" className="border-gray-300 focus:border-blue-500" />
                  </div>
                  <div>
                    <Label>邮箱</Label>
                    <Input placeholder="user@yarbo.com" className="border-gray-300 focus:border-blue-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>角色</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR专员</SelectItem>
                        <SelectItem value="interviewer">面试官</SelectItem>
                        <SelectItem value="viewer">观察员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>部门</Label>
                    <Select>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <SelectValue placeholder="选择部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">人力资源部</SelectItem>
                        <SelectItem value="tech">技术部</SelectItem>
                        <SelectItem value="product">产品部</SelectItem>
                        <SelectItem value="business">商务部</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddUser(false)}>
                  取消
                </Button>
                <Button onClick={() => setShowAddUser(false)} className="bg-blue-600 hover:bg-blue-700">
                  添加用户
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* 删除用户确认对话框 */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>确认删除</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">
                  确定要删除用户 <span className="font-medium">{selectedUser?.name}</span> 吗？
                  此操作不可撤销。
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  取消
                </Button>
                <Button onClick={confirmDeleteUser} className="bg-red-600 hover:bg-red-700">
                  确认删除
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 