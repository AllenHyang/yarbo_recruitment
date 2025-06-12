'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BulkActionToolbar } from "@/components/hr/BulkActionToolbar";
import { DataExport } from "@/components/hr/DataExport";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Star,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Tag,
  MessageSquare,
  FileText,
  Plus,
  MoreHorizontal
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  education: string;
  skills: string[];
  rating: number;
  status: 'active' | 'passive' | 'hired' | 'rejected';
  appliedJobs: {
    jobTitle: string;
    appliedDate: string;
    status: string;
  }[];
  resumeUrl?: string;
  notes: string[];
  lastContact: string;
  source: string;
  salaryExpectation?: string;
}

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟候选人数据
  const [candidates] = useState<Candidate[]>([
    {
      id: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '+86 138-0013-8001',
      location: '上海',
      experience: '5年',
      education: '本科',
      skills: ['React', 'Vue', 'TypeScript', 'Node.js'],
      rating: 4,
      status: 'active',
      appliedJobs: [
        { jobTitle: '高级前端工程师', appliedDate: '2025-06-08', status: 'interview' },
        { jobTitle: '全栈工程师', appliedDate: '2025-05-20', status: 'rejected' }
      ],
      resumeUrl: '/resume/zhangsan.pdf',
      notes: ['技术能力强', '沟通良好'],
      lastContact: '2025-06-10',
      source: '智联招聘',
      salaryExpectation: '25K-35K'
    },
    {
      id: '2',
      name: '李四',
      email: 'lisi@example.com',
      phone: '+86 139-0014-8002',
      location: '北京',
      experience: '3年',
      education: '硕士',
      skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
      rating: 3,
      status: 'passive',
      appliedJobs: [
        { jobTitle: '后端工程师', appliedDate: '2025-06-05', status: 'reviewing' }
      ],
      resumeUrl: '/resume/lisi.pdf',
      notes: ['技术基础扎实'],
      lastContact: '2025-06-07',
      source: 'BOSS直聘',
      salaryExpectation: '18K-25K'
    },
    {
      id: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '+86 137-0015-8003',
      location: '深圳',
      experience: '7年',
      education: '本科',
      skills: ['Java', 'Spring', 'MySQL', 'Docker'],
      rating: 5,
      status: 'hired',
      appliedJobs: [
        { jobTitle: '技术主管', appliedDate: '2025-05-15', status: 'hired' }
      ],
      resumeUrl: '/resume/wangwu.pdf',
      notes: ['优秀候选人', '已录用'],
      lastContact: '2025-05-30',
      source: '内推',
      salaryExpectation: '35K-45K'
    },
    {
      id: '4',
      name: '赵六',
      email: 'zhaoliu@example.com',
      phone: '+86 136-0016-8004',
      location: '杭州',
      experience: '2年',
      education: '本科',
      skills: ['Figma', 'Sketch', 'Photoshop', 'Principle'],
      rating: 4,
      status: 'active',
      appliedJobs: [
        { jobTitle: 'UI设计师', appliedDate: '2025-06-12', status: 'applied' }
      ],
      resumeUrl: '/resume/zhaoliu.pdf',
      notes: ['设计作品优秀'],
      lastContact: '2025-06-12',
      source: '拉勾网',
      salaryExpectation: '15K-20K'
    },
    {
      id: '5',
      name: '钱七',
      email: 'qianqi@example.com',
      phone: '+86 135-0017-8005',
      location: '广州',
      experience: '4年',
      education: '硕士',
      skills: ['Product Management', 'Axure', 'SQL', 'Data Analysis'],
      rating: 3,
      status: 'rejected',
      appliedJobs: [
        { jobTitle: '产品经理', appliedDate: '2025-05-25', status: 'rejected' }
      ],
      resumeUrl: '/resume/qianqi.pdf',
      notes: ['产品思维清晰', '但经验不足'],
      lastContact: '2025-06-01',
      source: '前程无忧',
      salaryExpectation: '20K-28K'
    }
  ]);

  // 统计数据
  const stats = {
    total: candidates.length,
    active: candidates.filter(c => c.status === 'active').length,
    passive: candidates.filter(c => c.status === 'passive').length,
    hired: candidates.filter(c => c.status === 'hired').length,
    averageRating: candidates.length > 0
      ? Math.round((candidates.reduce((sum, c) => sum + c.rating, 0) / candidates.length) * 10) / 10
      : 0
  };

  // 筛选候选人
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesExperience = experienceFilter === 'all' || candidate.experience.includes(experienceFilter);
    const matchesRating = ratingFilter === 'all' || candidate.rating.toString() === ratingFilter;

    return matchesSearch && matchesStatus && matchesExperience && matchesRating;
  });

  // 获取状态颜色
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: '活跃' };
      case 'passive':
        return { color: 'bg-blue-100 text-blue-800', text: '被动求职' };
      case 'hired':
        return { color: 'bg-purple-100 text-purple-800', text: '已录用' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', text: '已拒绝' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  // 渲染星级评分
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  // 批量操作处理函数
  const handleBulkAction = async (action: string, data?: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hr/candidates/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          candidate_ids: selectedCandidates,
          data,
          operator_id: 'current_user' // 实际项目中应该从认证上下文获取
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ 候选人批量操作成功:', result.data);
        alert(`批量操作成功！处理了 ${result.data.total_processed} 条记录`);
        setSelectedCandidates([]);
        // 这里应该刷新数据
      } else {
        throw new Error(result.error || '批量操作失败');
      }
    } catch (error) {
      console.error('候选人批量操作失败:', error);
      alert('批量操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 选择处理函数
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(filteredCandidates.map(candidate => candidate.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const isAllSelected = filteredCandidates.length > 0 &&
    selectedCandidates.length === filteredCandidates.length;
  const isIndeterminate = selectedCandidates.length > 0 &&
    selectedCandidates.length < filteredCandidates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                候选人管理
              </h1>
              <p className="text-gray-600 mt-1">候选人档案、搜索和评级管理</p>
            </div>

            <div className="flex items-center space-x-3">
              <DataExport
                type="candidates"
                trigger={
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出数据
                  </Button>
                }
              />
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                添加候选人
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">总候选人</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">活跃求职</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">已录用</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.hired}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">平均评分</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">被动求职</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.passive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和筛选 */}
          <Card className="mb-6 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <span>搜索和筛选</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="搜索姓名、邮箱、技能..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">活跃求职</SelectItem>
                    <SelectItem value="passive">被动求职</SelectItem>
                    <SelectItem value="hired">已录用</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="经验筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部经验</SelectItem>
                    <SelectItem value="1">1-2年</SelectItem>
                    <SelectItem value="3">3-5年</SelectItem>
                    <SelectItem value="5">5年以上</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="评分筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部评分</SelectItem>
                    <SelectItem value="5">5星</SelectItem>
                    <SelectItem value="4">4星</SelectItem>
                    <SelectItem value="3">3星</SelectItem>
                    <SelectItem value="2">2星及以下</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="w-full">
                  <Tag className="w-4 h-4 mr-2" />
                  技能标签
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作工具栏 */}
          <BulkActionToolbar
            selectedItems={selectedCandidates}
            onClearSelection={() => setSelectedCandidates([])}
            onBulkAction={handleBulkAction}
            availableActions={['update_status', 'add_tags', 'remove_tags', 'update_rating', 'add_note', 'move_to_pool', 'delete']}
            isLoading={isLoading}
          />

          {/* 候选人列表 */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>候选人列表 ({filteredCandidates.length})</CardTitle>
                <div className="text-sm text-gray-600">
                  显示 {filteredCandidates.length} / {candidates.length} 个候选人
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="选择全部"
                      />
                    </TableHead>
                    <TableHead>候选人信息</TableHead>
                    <TableHead>经验/教育</TableHead>
                    <TableHead>技能标签</TableHead>
                    <TableHead>申请职位</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后联系</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => {
                    const statusBadge = getStatusBadge(candidate.status);

                    return (
                      <TableRow key={candidate.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedCandidates.includes(candidate.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCandidate(candidate.id, checked as boolean)
                            }
                            aria-label={`选择 ${candidate.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-gray-600 flex items-center space-x-4">
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{candidate.email}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{candidate.phone}</span>
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 flex items-center space-x-1 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{candidate.location}</span>
                                <span>·</span>
                                <span>{candidate.source}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1 mb-1">
                              <Briefcase className="w-3 h-3 text-gray-400" />
                              <span>{candidate.experience}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <GraduationCap className="w-3 h-3 text-gray-400" />
                              <span>{candidate.education}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {candidate.appliedJobs.slice(0, 2).map((job, idx) => (
                              <div key={idx} className="mb-1">
                                <div className="font-medium">{job.jobTitle}</div>
                                <div className="text-gray-600">{job.appliedDate}</div>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell>
                          {renderStarRating(candidate.rating)}
                        </TableCell>

                        <TableCell>
                          <Badge className={statusBadge.color}>
                            {statusBadge.text}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm text-gray-600 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{candidate.lastContact}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCandidate(candidate);
                                setShowCandidateDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              查看
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3 mr-1" />
                              编辑
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              备注
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 候选人详情对话框 */}
          <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCandidate ? `${selectedCandidate.name} - 候选人档案` : '候选人详情'}
                </DialogTitle>
              </DialogHeader>
              {selectedCandidate && (
                <div className="py-4 space-y-6">
                  {/* 基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">基本信息</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCandidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCandidate.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">职业信息</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCandidate.experience}工作经验</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{selectedCandidate.education}</span>
                        </div>
                        {selectedCandidate.salaryExpectation && (
                          <div className="text-sm">
                            期望薪资: {selectedCandidate.salaryExpectation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 技能标签 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">技能标签</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 评分和状态 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">候选人评分</Label>
                      <div className="flex items-center space-x-2">
                        {renderStarRating(selectedCandidate.rating)}
                        <span className="text-sm text-gray-600">({selectedCandidate.rating}/5)</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">当前状态</Label>
                      <Badge className={getStatusBadge(selectedCandidate.status).color}>
                        {getStatusBadge(selectedCandidate.status).text}
                      </Badge>
                    </div>
                  </div>

                  {/* 申请记录 */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">申请记录</Label>
                    <div className="space-y-2">
                      {selectedCandidate.appliedJobs.map((job, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{job.jobTitle}</div>
                              <div className="text-sm text-gray-600">申请日期: {job.appliedDate}</div>
                            </div>
                            <Badge variant="outline">{job.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 备注记录 */}
                  {selectedCandidate.notes.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">备注记录</Label>
                      <div className="space-y-2">
                        {selectedCandidate.notes.map((note, idx) => (
                          <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCandidateDialog(false)}>
                  关闭
                </Button>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  查看简历
                </Button>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑档案
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 