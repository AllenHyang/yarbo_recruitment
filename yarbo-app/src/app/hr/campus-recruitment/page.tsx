'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, GraduationCap, School, Users, Calendar, CheckCircle, UserCheck, BookOpen, MapPin, TrendingUp, Star, Award, Target, Clock, Download, Mail, X, FileText, Edit, Eye } from "lucide-react";
import { withProtected } from "@/components/withProtected";

interface University {
  id: number;
  name: string;
  applications: number;
  rating: number;
  partnership: string;
  established: string;
  students: string;
  majors: string[];
}

function CampusRecruitmentPage() {
  const [stats, setStats] = useState({
    totalJobs: 12,
    activeJobs: 8,
    totalApplications: 568,
    upcomingEvents: 6
  });

  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

  const topUniversities: University[] = [
    { id: 1, name: "清华大学", applications: 85, rating: 5, partnership: "战略合作", established: "2020年", students: "45000+", majors: ["计算机科学", "电子工程", "工业工程"] },
    { id: 2, name: "北京大学", applications: 72, rating: 5, partnership: "战略合作", established: "2019年", students: "40000+", majors: ["软件工程", "数据科学", "商务分析"] },
    { id: 3, name: "上海交通大学", applications: 68, rating: 4, partnership: "深度合作", established: "2021年", students: "38000+", majors: ["机械工程", "电气工程", "管理科学"] },
    { id: 4, name: "浙江大学", applications: 61, rating: 4, partnership: "深度合作", established: "2022年", students: "35000+", majors: ["信息工程", "生物医学", "经济学"] },
    { id: 5, name: "复旦大学", applications: 55, rating: 4, partnership: "一般合作", established: "2023年", students: "32000+", majors: ["新闻传播", "国际关系", "金融学"] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                校园招聘管理
              </h1>
              <p className="text-gray-600 mt-1">管理校园招聘职位、实习项目和校园活动</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => {
                const data = { stats, timestamp: new Date().toLocaleString('zh-CN') };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `校园招聘报告_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
              <Button onClick={() => setShowJobDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                新增校招职位
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">校招职位</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalJobs}</p>
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
                    <p className="text-sm text-gray-600">招聘中</p>
                    <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">申请总数</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待举办活动</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.upcomingEvents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快速操作区域 */}
          <Card className="mb-8 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                快速操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => setShowJobDialog(true)}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">发布新职位</span>
                </Button>
                <Button
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => setShowEventDialog(true)}
                >
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">安排宣讲会</span>
                </Button>
                <Button
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => alert('邮件功能开发中，将向所有候选人发送最新招聘信息！')}
                >
                  <Mail className="w-6 h-6" />
                  <span className="text-sm">群发邮件</span>
                </Button>
                <Button
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => alert('简历评估功能开发中，将使用AI智能筛选简历！')}
                >
                  <Award className="w-6 h-6" />
                  <span className="text-sm">评估简历</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">校招职位管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">管理面向应届毕业生的全职招聘职位和培养计划。</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">2025届软件工程师</span>
                    <Badge className="bg-green-100 text-green-800">招聘中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">2025届产品经理</span>
                    <Badge className="bg-green-100 text-green-800">招聘中</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">2025届数据分析师</span>
                    <Badge className="bg-blue-100 text-blue-800">待开放</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => setShowDataDialog(true)}>管理校招职位</Button>
                  <Button className="w-full mt-2" variant="outline" onClick={() => alert('职位详情功能开发中...')}>查看职位详情</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <School className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">校园活动</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">安排校园宣讲会、招聘会和校园参观等活动。</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">清华大学宣讲会</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">北大春季招聘会</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">线上技术分享</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => alert('活动列表功能开发中...')}>查看活动安排</Button>
                <Button className="w-full mt-2" variant="outline" onClick={() => setShowEventDialog(true)}>创建新活动</Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">招聘数据</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">查看校招效果分析和各院校申请统计。</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">68%</div>
                    <div className="text-sm text-gray-600">简历通过率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">25%</div>
                    <div className="text-sm text-gray-600">最终录用率</div>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowDataDialog(true)}>查看详细数据</Button>
                <Button className="w-full mt-2" variant="outline" onClick={() => {
                  const data = { stats, timestamp: new Date().toLocaleString('zh-CN') };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `校园招聘分析报告_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>生成分析报告</Button>
              </CardContent>
            </Card>
          </div>

          {/* 重点院校合作 */}
          <div className="mt-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  重点院校合作
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {topUniversities.map((university, index) => (
                    <Card
                      key={index}
                      className="border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedUniversity(university)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                          <School className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{university.name}</h3>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < university.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{university.applications} 份申请</p>
                        <Badge variant="outline" className="text-xs">
                          {university.partnership}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" onClick={() => alert('院校合作管理功能开发中，将提供详细的合作伙伴关系管理！')}>
                    <Users className="w-4 h-4 mr-2" />
                    管理院校合作
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 创建职位对话框 */}
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新增校园招聘职位</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">职位名称</Label>
                <Input id="title" placeholder="例：2025届软件工程师" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">所属部门</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">技术部</SelectItem>
                    <SelectItem value="product">产品部</SelectItem>
                    <SelectItem value="design">设计部</SelectItem>
                    <SelectItem value="marketing">市场部</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">工作地点</Label>
                <Input id="location" placeholder="例：北京/上海/深圳" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requirements">任职要求</Label>
                <Textarea id="requirements" placeholder="请输入任职要求..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowJobDialog(false)}>取消</Button>
              <Button onClick={() => { alert('职位创建成功！'); setShowJobDialog(false); }}>创建职位</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 创建活动对话框 */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>创建校园活动</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="eventTitle">活动名称</Label>
                <Input id="eventTitle" placeholder="例：清华大学宣讲会" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="university">目标院校</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择院校" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="清华大学">清华大学</SelectItem>
                    <SelectItem value="北京大学">北京大学</SelectItem>
                    <SelectItem value="上海交通大学">上海交通大学</SelectItem>
                    <SelectItem value="浙江大学">浙江大学</SelectItem>
                    <SelectItem value="复旦大学">复旦大学</SelectItem>
                    <SelectItem value="线上">线上活动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventDate">活动日期</Label>
                <Input id="eventDate" type="date" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventLocation">活动地点</Label>
                <Input id="eventLocation" placeholder="例：清华大学主楼报告厅" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEventDialog(false)}>取消</Button>
              <Button onClick={() => { alert('活动创建成功！'); setShowEventDialog(false); }}>创建活动</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 数据详情对话框 */}
        <Dialog open={showDataDialog} onOpenChange={setShowDataDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>校园招聘数据详情</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">职位统计</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">2025届软件工程师</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">180 申请</div>
                        <Badge className="bg-green-100 text-green-800">招聘中</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">2025届产品经理</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">120 申请</div>
                        <Badge className="bg-green-100 text-green-800">招聘中</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">2025届数据分析师</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">0 申请</div>
                        <Badge className="bg-blue-100 text-blue-800">待开放</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">院校申请分布</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">清华大学</span>
                      <span className="text-sm font-medium">85 份</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">北京大学</span>
                      <span className="text-sm font-medium">72 份</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">上海交通大学</span>
                      <span className="text-sm font-medium">68 份</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">关键指标</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">68%</div>
                    <div className="text-sm text-gray-600">简历通过率</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">25%</div>
                    <div className="text-sm text-gray-600">最终录用率</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">42</div>
                    <div className="text-sm text-gray-600">平均面试分</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => alert('数据导出功能开发中...')}>
                <Download className="w-4 h-4 mr-2" />
                导出数据
              </Button>
              <Button onClick={() => setShowDataDialog(false)}>关闭</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 院校详情对话框 */}
        {selectedUniversity && (
          <Dialog open={!!selectedUniversity} onOpenChange={() => setSelectedUniversity(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <School className="w-6 h-6 text-blue-600" />
                  <span>{selectedUniversity.name} - 合作详情</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-6">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedUniversity.applications}</div>
                      <div className="text-sm text-gray-600">申请数量</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < selectedUniversity.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">合作评级</div>
                    </div>
                  </div>

                  {/* 合作信息 */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">合作类型：</span>
                      <Badge variant={selectedUniversity.partnership === '战略合作' ? 'default' : 'outline'}>
                        {selectedUniversity.partnership}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">合作建立：</span>
                      <span className="font-medium">{selectedUniversity.established}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">学生规模：</span>
                      <span className="font-medium">{selectedUniversity.students}</span>
                    </div>
                  </div>

                  {/* 重点专业 */}
                  <div>
                    <h4 className="font-medium mb-2">重点合作专业</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUniversity.majors?.map((major, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {major}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 合作历史 */}
                  <div>
                    <h4 className="font-medium mb-2">合作历史记录</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>2024年春季宣讲会 - 50人参与</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>2023年实习生项目 - 12人录取</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>2023年校园招聘 - 25人入职</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => alert('编辑合作信息功能开发中...')}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑合作
                </Button>
                <Button onClick={() => setSelectedUniversity(null)}>
                  关闭
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// 使用权限保护，只允许HR和管理员访问
export default withProtected(CampusRecruitmentPage, ['hr', 'admin']);