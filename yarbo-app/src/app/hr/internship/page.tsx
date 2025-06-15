'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  Users,
  MapPin,
  Edit,
  Eye,
  Star,
  TrendingUp,
  CheckCircle,
  Building2,
  Target,
  Award,
  FileText,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { withProtected } from "@/components/withProtected";

interface InternPosition {
  id: string;
  title: string;
  department: string;
  duration: string;
  startDate: string;
  location: string;
  stipend: string;
  spots: number;
  applicants: number;
  status: 'open' | 'closed' | 'draft';
  requirements: string[];
  supervisor: string;
  skills: string[];
  description: string;
  projects: string[];
}

interface InternStudent {
  id: string;
  name: string;
  school: string;
  major: string;
  grade: string;
  position: string;
  startDate: string;
  endDate: string;
  supervisor: string;
  status: 'active' | 'completed' | 'terminated';
  performance: number;
  attendance: number;
  skills: string[];
  projects: string[];
}

export default function InternshipPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('positions');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<InternStudent | null>(null);

  // 实习职位数据
  const [internPositions] = useState<InternPosition[]>([
    {
      id: '1',
      title: '前端开发实习生',
      department: '技术部',
      duration: '3个月',
      startDate: '2025-06-01',
      location: '上海',
      stipend: '250/天',
      spots: 5,
      applicants: 45,
      status: 'open',
      requirements: ['计算机相关专业', '大三或大四在读', '熟悉React/Vue'],
      supervisor: '张技术经理',
      skills: ['React', 'JavaScript', 'CSS', 'Git'],
      description: '参与公司核心产品的前端开发工作，获得实战经验',
      projects: ['用户中心重构', '移动端适配', '组件库建设']
    },
    {
      id: '2',
      title: '产品助理实习生',
      department: '产品部',
      duration: '6个月',
      startDate: '2025-07-01',
      location: '北京',
      stipend: '200/天',
      spots: 3,
      applicants: 28,
      status: 'open',
      requirements: ['产品、设计或相关专业', '有产品思维', '会使用Axure/Figma'],
      supervisor: '李产品总监',
      skills: ['产品设计', 'Axure', 'Figma', '用户调研'],
      description: '协助产品经理进行需求分析、原型设计和用户调研',
      projects: ['用户体验优化', '新功能设计', '竞品分析']
    },
    {
      id: '3',
      title: '数据分析实习生',
      department: '数据部',
      duration: '4个月',
      startDate: '2025-06-15',
      location: '深圳',
      stipend: '300/天',
      spots: 2,
      applicants: 32,
      status: 'open',
      requirements: ['统计学、数学相关专业', '熟悉Python/SQL', '有数据分析经验'],
      supervisor: '王数据总监',
      skills: ['Python', 'SQL', 'Tableau', '机器学习'],
      description: '参与公司业务数据分析，支持数据驱动决策',
      projects: ['用户行为分析', '业务指标监控', '预测模型建设']
    }
  ]);

  // 在职实习生数据
  const [internStudents] = useState<InternStudent[]>([
    {
      id: '1',
      name: '小明',
      school: '清华大学',
      major: '计算机科学',
      grade: '大三',
      position: '前端开发实习生',
      startDate: '2025-03-01',
      endDate: '2025-06-01',
      supervisor: '张技术经理',
      status: 'active',
      performance: 85,
      attendance: 95,
      skills: ['React', 'JavaScript', 'TypeScript'],
      projects: ['用户中心重构', '组件库优化']
    },
    {
      id: '2',
      name: '小红',
      school: '北京大学',
      major: '工商管理',
      grade: '大二',
      position: '产品助理实习生',
      startDate: '2025-02-15',
      endDate: '2025-08-15',
      supervisor: '李产品总监',
      status: 'active',
      performance: 92,
      attendance: 98,
      skills: ['产品设计', 'Figma', '用户调研'],
      projects: ['新功能设计', '用户体验优化']
    },
    {
      id: '3',
      name: '小李',
      school: '上海交通大学',
      major: '数据科学',
      grade: '大四',
      position: '数据分析实习生',
      startDate: '2024-12-01',
      endDate: '2025-04-01',
      supervisor: '王数据总监',
      status: 'completed',
      performance: 88,
      attendance: 96,
      skills: ['Python', 'SQL', 'Tableau'],
      projects: ['用户行为分析', '业务报表自动化']
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '招募中';
      case 'closed': return '已关闭';
      case 'draft': return '草稿';
      case 'active': return '在职';
      case 'completed': return '已完成';
      case 'terminated': return '已终止';
      default: return status;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPositions = internPositions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || position.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalPositions: internPositions.length,
    openPositions: internPositions.filter(p => p.status === 'open').length,
    activeInterns: internStudents.filter(s => s.status === 'active').length,
    totalApplications: internPositions.reduce((sum, pos) => sum + pos.applicants, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                实习生管理
              </h1>
              <p className="text-gray-600 mt-1">管理实习职位发布、实习生招募和在职实习生</p>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => {
                const data = {
                  实习职位: internPositions.length,
                  在职实习生: internStudents.filter(s => s.status === 'active').length,
                  申请总数: internPositions.reduce((sum, pos) => sum + pos.applicants, 0),
                  生成时间: new Date().toLocaleString('zh-CN')
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `实习管理报告_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <BarChart3 className="w-4 h-4 mr-2" />
                导出报告
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                新增实习职位
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">实习职位</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalPositions}</p>
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
                    <p className="text-sm text-gray-600">招募中</p>
                    <p className="text-2xl font-bold text-green-600">{stats.openPositions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">在职实习生</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeInterns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">申请总数</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 功能模块 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 实习职位管理 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">实习职位管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">发布和管理各类实习职位，包括技术、产品、运营等岗位。</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">前端开发实习生</span>
                    <Badge className="bg-green-100 text-green-800">招募中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">产品助理实习生</span>
                    <Badge className="bg-green-100 text-green-800">招募中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">数据分析实习生</span>
                    <Badge className="bg-gray-100 text-gray-800">已满员</Badge>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  管理职位
                </Button>
                <div className="mt-2 space-y-2">
                  <Button className="w-full" variant="outline" size="sm">
                    查看申请者
                  </Button>
                  <Button className="w-full" variant="outline" size="sm">
                    编辑职位
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 在职实习生 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">在职实习生</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">管理当前在职实习生的信息、表现评估和项目分配。</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">小明 - 前端开发</span>
                    <span className="text-sm font-medium text-green-600">优秀</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">小红 - 产品助理</span>
                    <span className="text-sm font-medium text-blue-600">良好</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">小李 - 数据分析</span>
                    <span className="text-sm font-medium text-green-600">优秀</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowStudentDialog(true)}>
                  查看详情
                </Button>
              </CardContent>
            </Card>

            {/* 实习评估 */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">评估与报告</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">实习生表现评估、月度报告和转正建议。</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">8.5</div>
                    <div className="text-sm text-gray-600">平均评分</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">75%</div>
                    <div className="text-sm text-gray-600">转正率</div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowEvaluationDialog(true)}>
                  查看报告
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 实习生排行榜 */}
          <div className="mt-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>本月优秀实习生</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: '小明', position: '前端开发', score: 92, school: '清华大学' },
                    { name: '小红', position: '产品助理', score: 89, school: '北京大学' },
                    { name: '小李', position: '数据分析', score: 87, school: '上海交大' }
                  ].map((student, index) => (
                    <div key={student.name} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">{student.position} · {student.school}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{student.score}</div>
                        <div className="text-xs text-gray-500">分</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快速操作 */}
          <div className="mt-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-12" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增职位
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => setShowStudentDialog(true)}>
                    <Users className="w-4 h-4 mr-2" />
                    实习生列表
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => alert('评估安排功能开发中...')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    评估安排
                  </Button>
                  <Button variant="outline" className="h-12" onClick={() => {
                    const data = {
                      实习职位: internPositions.length,
                      在职实习生: internStudents.filter(s => s.status === 'active').length,
                      申请总数: internPositions.reduce((sum, pos) => sum + pos.applicants, 0),
                      生成时间: new Date().toLocaleString('zh-CN')
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `实习管理详细报告_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    生成报告
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 创建实习职位对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增实习职位</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">职位名称</Label>
              <Input id="title" placeholder="例：前端开发实习生" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">所属部门</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">技术部</SelectItem>
                  <SelectItem value="product">产品部</SelectItem>
                  <SelectItem value="design">设计部</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stipend">实习津贴</Label>
              <Input id="stipend" placeholder="例：200/天" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={() => { alert('实习职位创建成功！'); setShowCreateDialog(false); }}>创建职位</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 实习生列表对话框 */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>在职实习生列表</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {internStudents.filter(s => s.status === 'active').map((student) => (
                <Card key={student.id} className="border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.school} · {student.major}</p>
                        <p className="text-sm text-gray-600">{student.position}</p>
                        <div className="flex space-x-4 mt-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{student.performance}</div>
                            <div className="text-xs text-gray-600">表现评分</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{student.attendance}%</div>
                            <div className="text-xs text-gray-600">出勤率</div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedStudent(student);
                        setShowStudentDialog(false);
                        setShowEvaluationDialog(true);
                      }}>
                        查看详情
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowStudentDialog(false)}>关闭</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 评估报告对话框 */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent ? `${selectedStudent.name} - 实习评估报告` : '实习评估总览'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{selectedStudent.performance}</div>
                    <div className="text-sm text-gray-600">综合评分</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{selectedStudent.attendance}%</div>
                    <div className="text-sm text-gray-600">出勤率</div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">转正建议</h3>
                  <p className="text-sm text-yellow-700">
                    基于{selectedStudent.name}的优异表现，建议考虑正式录用。
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">8.5</div>
                    <div className="text-sm text-gray-600">平均评分</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">75%</div>
                    <div className="text-sm text-gray-600">转正率</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => alert('导出评估报告功能开发中...')}>
              导出报告
            </Button>
            <Button onClick={() => {
              setShowEvaluationDialog(false);
              setSelectedStudent(null);
            }}>
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 