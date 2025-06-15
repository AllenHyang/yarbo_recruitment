'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Phone, 
  MapPin,
  Star,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Building2,
  Plus,
  X,
  Tag
} from "lucide-react";
import Link from "next/link";

// 为静态导出生成参数
export async function generateStaticParams() {
  return [];
}
export default function CandidateDetailsPage() {
  const { id } = useParams();
  
  // 标签管理状态
  const [candidateTags, setCandidateTags] = useState(['高潜力', '技术过硬', '沟通良好']);
  const [newTag, setNewTag] = useState('');
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  // 预设标签
  const presetTags = [
    '高潜力', '技术过硬', '沟通良好', '团队合作', '学习能力强',
    '经验丰富', '积极主动', '创新思维', '适应性强', '责任心强',
    '英语流利', '管理能力', '项目经验', '客户导向', '数据敏感'
  ];

  // 模拟候选人详情数据
  const candidate = {
    id,
    name: '李明',
    email: 'liming@example.com',
    phone: '+86 138-0013-8001',
    location: '北京市朝阳区',
    position: '高级全栈工程师',
    company: 'XYZ科技有限公司',
    experience: '5年',
    rating: 4,
    skills: ['React', 'Vue.js', 'Node.js', 'TypeScript', 'Python', 'MySQL', 'Redis', 'Docker'],
    applications: [
      { job_title: '资深全栈工程师', status: 'interview', applied_at: '2025-06-08' },
      { job_title: '前端技术专家', status: 'rejected', applied_at: '2025-05-15' }
    ]
  };

  // 添加标签
  const addTag = (tag: string) => {
    if (tag && !candidateTags.includes(tag)) {
      setCandidateTags([...candidateTags, tag]);
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setCandidateTags(candidateTags.filter(tag => tag !== tagToRemove));
  };

  // 添加自定义标签
  const handleAddCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'interview': return '面试中';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/hr/candidates">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{candidate.name}</h1>
                <p className="text-gray-600 mt-1">{candidate.position}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                下载简历
              </Button>
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
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>基本信息</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span>{candidate.experience} 经验</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 当前职位 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>当前职位</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{candidate.position}</div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{candidate.company}</span>
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
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 候选人标签 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Tag className="w-5 h-5 text-purple-600" />
                      <span>候选人标签</span>
                    </CardTitle>
                    <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          添加标签
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>管理候选人标签</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* 当前标签 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">当前标签</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {candidateTags.map((tag, index) => (
                                <Badge key={index} variant="default" className="pr-1">
                                  {tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* 添加自定义标签 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">添加自定义标签</h4>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="输入标签名称"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                              />
                              <Button onClick={handleAddCustomTag} size="sm">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* 预设标签 */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">快速添加</h4>
                            <div className="flex flex-wrap gap-2">
                              {presetTags.filter(tag => !candidateTags.includes(tag)).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="cursor-pointer hover:bg-blue-50"
                                  onClick={() => addTag(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidateTags.length > 0 ? (
                      candidateTags.map((tag, index) => (
                        <Badge key={index} variant="default" className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">暂无标签</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 申请记录 */}
              <Card>
                <CardHeader>
                  <CardTitle>申请记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidate.applications.map((app, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{app.job_title}</h4>
                          <p className="text-sm text-gray-500">申请时间：{app.applied_at}</p>
                        </div>
                        <Badge className={getStatusColor(app.status)}>
                          {getStatusText(app.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 候选人头像和评分 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
                    
                    <div className="flex items-center justify-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < candidate.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{candidate.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 快速操作 */}
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    下载简历
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    发送邮件
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    安排面试
                  </Button>
                  
                  <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Award className="w-4 h-4 mr-2" />
                        添加标签
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 