'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Star, 
  User, 
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Award,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Heart,
  Zap
} from "lucide-react";

interface InterviewFeedback {
  id: string;
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  interviewer: string;
  interviewDate: string;
  interviewType: string;
  duration: number;
  
  // 评分维度
  technicalScore: number;
  communicationScore: number;
  cultureFitScore: number;
  problemSolvingScore: number;
  motivationScore: number;
  
  // 总体评价
  overallRating: number;
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire' | 'strong_no_hire';
  
  // 详细反馈
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  nextSteps: string;
  interviewerNotes: string;
  
  // 元数据
  status: 'draft' | 'submitted' | 'reviewed';
  submittedAt?: string;
  reviewedBy?: string;
}

export default function InterviewFeedbackPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFeedback, setSelectedFeedback] = useState<InterviewFeedback | null>(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [recommendationFilter, setRecommendationFilter] = useState('all');

  // 模拟反馈数据
  const [feedbackList, setFeedbackList] = useState<InterviewFeedback[]>([
    {
      id: '1',
      interviewId: 'iv-001',
      candidateName: '张三',
      jobTitle: '高级前端工程师',
      interviewer: '李经理',
      interviewDate: '2025-06-10',
      interviewType: 'technical',
      duration: 60,
      technicalScore: 4,
      communicationScore: 5,
      cultureFitScore: 4,
      problemSolvingScore: 4,
      motivationScore: 5,
      overallRating: 4,
      recommendation: 'hire',
      strengths: ['React技术扎实', '沟通能力强', '学习能力强', '团队协作好'],
      weaknesses: ['后端经验较少', 'TypeScript待提升'],
      feedback: '候选人技术基础扎实，沟通表达清晰，对前端技术有深入理解。在React、Vue等框架方面经验丰富，能够独立完成复杂项目。性格开朗，团队协作能力强，学习意愿强烈。',
      nextSteps: '建议进入终面环节，可以考虑发放offer',
      interviewerNotes: '整体表现优秀，符合岗位要求',
      status: 'submitted',
      submittedAt: '2025-06-10T16:30:00Z'
    },
    {
      id: '2',
      interviewId: 'iv-002',
      candidateName: '李四',
      jobTitle: '产品经理',
      interviewer: '王总监',
      interviewDate: '2025-06-11',
      interviewType: 'video',
      duration: 45,
      technicalScore: 3,
      communicationScore: 4,
      cultureFitScore: 3,
      problemSolvingScore: 3,
      motivationScore: 4,
      overallRating: 3,
      recommendation: 'maybe',
      strengths: ['产品思维清晰', '用户体验理解好'],
      weaknesses: ['技术理解不够深入', '项目管理经验不足'],
      feedback: '候选人具备基本的产品思维，对用户体验有一定理解。但在技术理解和项目管理方面还需要加强。',
      nextSteps: '需要更多评估，建议安排二面',
      interviewerNotes: '需要进一步了解其实际项目经验',
      status: 'submitted',
      submittedAt: '2025-06-11T11:15:00Z'
    },
    {
      id: '3',
      interviewId: 'iv-003',
      candidateName: '王五',
      jobTitle: 'UI设计师',
      interviewer: '陈设计师',
      interviewDate: '2025-06-12',
      interviewType: 'onsite',
      duration: 90,
      technicalScore: 5,
      communicationScore: 4,
      cultureFitScore: 5,
      problemSolvingScore: 4,
      motivationScore: 5,
      overallRating: 5,
      recommendation: 'strong_hire',
      strengths: ['设计能力出众', '创意思维强', '用户体验理解深入', '工具掌握熟练'],
      weaknesses: ['前端代码能力一般'],
      feedback: '候选人设计能力非常出色，作品集质量很高，创意思维活跃。对用户体验有深入理解，能够从用户角度思考问题。虽然前端代码能力一般，但可以通过培训提升。',
      nextSteps: '强烈推荐录用，可以直接发放offer',
      interviewerNotes: '优秀候选人，建议尽快录用',
      status: 'reviewed',
      submittedAt: '2025-06-12T17:00:00Z',
      reviewedBy: '张HR'
    }
  ]);

  // 新建反馈表单
  const [newFeedback, setNewFeedback] = useState<Partial<InterviewFeedback>>({
    technicalScore: 3,
    communicationScore: 3,
    cultureFitScore: 3,
    problemSolvingScore: 3,
    motivationScore: 3,
    overallRating: 3,
    recommendation: 'maybe',
    strengths: [],
    weaknesses: [],
    feedback: '',
    nextSteps: '',
    interviewerNotes: '',
    status: 'draft'
  });

  // 统计数据
  const stats = {
    totalFeedback: feedbackList.length,
    pendingReview: feedbackList.filter(f => f.status === 'submitted').length,
    averageRating: feedbackList.length > 0 
      ? Math.round((feedbackList.reduce((sum, f) => sum + f.overallRating, 0) / feedbackList.length) * 10) / 10
      : 0,
    recommendedCount: feedbackList.filter(f => ['hire', 'strong_hire'].includes(f.recommendation)).length
  };

  // 获取推荐等级的颜色和文本
  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return { color: 'bg-green-100 text-green-800', text: '强烈推荐', icon: ThumbsUp };
      case 'hire':
        return { color: 'bg-blue-100 text-blue-800', text: '推荐录用', icon: CheckCircle };
      case 'maybe':
        return { color: 'bg-yellow-100 text-yellow-800', text: '待定', icon: AlertTriangle };
      case 'no_hire':
        return { color: 'bg-red-100 text-red-800', text: '不推荐', icon: ThumbsDown };
      case 'strong_no_hire':
        return { color: 'bg-red-100 text-red-800', text: '强烈不推荐', icon: ThumbsDown };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: '未评估', icon: AlertTriangle };
    }
  };

  // 获取状态颜色
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', text: '草稿' };
      case 'submitted':
        return { color: 'bg-blue-100 text-blue-800', text: '已提交' };
      case 'reviewed':
        return { color: 'bg-green-100 text-green-800', text: '已审核' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  // 筛选反馈数据
  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = feedback.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feedback.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesRecommendation = recommendationFilter === 'all' || feedback.recommendation === recommendationFilter;
    return matchesSearch && matchesStatus && matchesRecommendation;
  });

  // 渲染星级评分
  const renderStarRating = (rating: number, readonly: boolean = true) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 cursor-pointer ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  // 计算平均分
  const calculateAverageScore = (feedback: InterviewFeedback) => {
    const scores = [
      feedback.technicalScore,
      feedback.communicationScore,
      feedback.cultureFitScore,
      feedback.problemSolvingScore,
      feedback.motivationScore
    ];
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                面试反馈中心
              </h1>
              <p className="text-gray-600 mt-1">面试评价、候选人评分和录用建议</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => alert('导出报告功能开发中...')}>
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
              <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    新建反馈
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>面试反馈表</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>候选人姓名</Label>
                        <Input placeholder="请输入候选人姓名" />
                      </div>
                      <div>
                        <Label>应聘职位</Label>
                        <Input placeholder="请输入应聘职位" />
                      </div>
                    </div>

                    {/* 评分维度 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">能力评分</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium">技术能力</div>
                              <div className="text-sm text-gray-600">专业技能、技术深度</div>
                            </div>
                          </div>
                          {renderStarRating(newFeedback.technicalScore || 3, false)}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium">沟通能力</div>
                              <div className="text-sm text-gray-600">表达、理解、互动</div>
                            </div>
                          </div>
                          {renderStarRating(newFeedback.communicationScore || 3, false)}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-medium">文化匹配</div>
                              <div className="text-sm text-gray-600">价值观、团队融入</div>
                            </div>
                          </div>
                          {renderStarRating(newFeedback.cultureFitScore || 3, false)}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Target className="w-5 h-5 text-orange-600" />
                            <div>
                              <div className="font-medium">解决问题</div>
                              <div className="text-sm text-gray-600">分析、思维、方案</div>
                            </div>
                          </div>
                          {renderStarRating(newFeedback.problemSolvingScore || 3, false)}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Zap className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="font-medium">工作动机</div>
                              <div className="text-sm text-gray-600">热情、主动性、责任心</div>
                            </div>
                          </div>
                          {renderStarRating(newFeedback.motivationScore || 3, false)}
                        </div>
                      </div>
                    </div>

                    {/* 总体评价 */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">总体评价</h3>
                      
                      <div>
                        <Label>推荐决策</Label>
                        <Select value={newFeedback.recommendation || 'maybe'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="strong_hire">强烈推荐录用</SelectItem>
                            <SelectItem value="hire">推荐录用</SelectItem>
                            <SelectItem value="maybe">待定</SelectItem>
                            <SelectItem value="no_hire">不推荐录用</SelectItem>
                            <SelectItem value="strong_no_hire">强烈不推荐</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>详细反馈</Label>
                        <Textarea
                          placeholder="请详细描述候选人的表现、优势、不足和总体评价..."
                          value={newFeedback.feedback || ''}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>下一步建议</Label>
                        <Textarea
                          placeholder="请提供关于后续流程的建议..."
                          value={newFeedback.nextSteps || ''}
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                      取消
                    </Button>
                    <Button variant="outline" onClick={() => alert('保存草稿功能开发中...')}>
                      保存草稿
                    </Button>
                    <Button onClick={() => alert('提交反馈功能开发中...')}>
                      提交反馈
                    </Button>
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
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">总反馈数</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalFeedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待审核</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">平均评分</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">推荐录用</p>
                    <p className="text-2xl font-bold text-green-600">{stats.recommendedCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容区域 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">反馈概览</TabsTrigger>
              <TabsTrigger value="detailed">详细列表</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
            </TabsList>

            {/* 反馈概览 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">最新反馈</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="搜索候选人..."
                      className="pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="submitted">已提交</SelectItem>
                      <SelectItem value="reviewed">已审核</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeedback.map((feedback) => {
                  const recommendationBadge = getRecommendationBadge(feedback.recommendation);
                  const statusBadge = getStatusBadge(feedback.status);
                  const Icon = recommendationBadge.icon;
                  
                  return (
                    <Card key={feedback.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{feedback.candidateName}</CardTitle>
                            <CardDescription>{feedback.jobTitle}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{feedback.overallRating}</div>
                            <div className="text-xs text-gray-500">总评分</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={recommendationBadge.color}>
                            <Icon className="w-3 h-3 mr-1" />
                            {recommendationBadge.text}
                          </Badge>
                          <Badge className={statusBadge.color}>{statusBadge.text}</Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3 text-gray-400" />
                              <span>{feedback.interviewer}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{feedback.interviewDate}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">能力评分</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span>技术</span>
                                <span className="font-medium">{feedback.technicalScore}/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>沟通</span>
                                <span className="font-medium">{feedback.communicationScore}/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>文化</span>
                                <span className="font-medium">{feedback.cultureFitScore}/5</span>
                              </div>
                              <div className="flex justify-between">
                                <span>动机</span>
                                <span className="font-medium">{feedback.motivationScore}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          {feedback.strengths.length > 0 && (
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">核心优势</div>
                              <div className="flex flex-wrap gap-1">
                                {feedback.strengths.slice(0, 3).map((strength, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs bg-green-50">
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* 详细列表 */}
            <TabsContent value="detailed" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>所有面试反馈</CardTitle>
                    <div className="flex items-center space-x-3">
                      <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="推荐筛选" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部推荐</SelectItem>
                          <SelectItem value="strong_hire">强烈推荐</SelectItem>
                          <SelectItem value="hire">推荐录用</SelectItem>
                          <SelectItem value="maybe">待定</SelectItem>
                          <SelectItem value="no_hire">不推荐</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFeedback.map((feedback) => {
                      const recommendationBadge = getRecommendationBadge(feedback.recommendation);
                      const statusBadge = getStatusBadge(feedback.status);
                      const avgScore = calculateAverageScore(feedback);
                      
                      return (
                        <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h3 className="font-semibold text-lg">{feedback.candidateName}</h3>
                                <p className="text-sm text-gray-600">{feedback.jobTitle} · {feedback.interviewer}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={recommendationBadge.color}>
                                  {recommendationBadge.text}
                                </Badge>
                                <Badge className={statusBadge.color}>
                                  {statusBadge.text}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{avgScore}</div>
                              <div className="text-xs text-gray-500">平均分</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-blue-600">{feedback.technicalScore}</div>
                              <div className="text-xs text-gray-600">技术</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-green-600">{feedback.communicationScore}</div>
                              <div className="text-xs text-gray-600">沟通</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-purple-600">{feedback.cultureFitScore}</div>
                              <div className="text-xs text-gray-600">文化</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-orange-600">{feedback.problemSolvingScore}</div>
                              <div className="text-xs text-gray-600">解决问题</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-red-600">{feedback.motivationScore}</div>
                              <div className="text-xs text-gray-600">动机</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              面试时间: {feedback.interviewDate} · 时长: {feedback.duration}分钟
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-3 h-3 mr-1" />
                                编辑
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-3 h-3 mr-1" />
                                详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 数据分析 */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 推荐分布 */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>推荐决策分布</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'].map((rec) => {
                        const count = feedbackList.filter(f => f.recommendation === rec).length;
                        const percentage = feedbackList.length > 0 ? (count / feedbackList.length) * 100 : 0;
                        const badge = getRecommendationBadge(rec);
                        
                        return (
                          <div key={rec} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge className={badge.color}>{badge.text}</Badge>
                              <span className="text-sm font-medium">{count}人</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">{percentage.toFixed(0)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 能力评分分析 */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>平均能力评分</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { key: 'technicalScore', name: '技术能力', color: 'bg-blue-500' },
                        { key: 'communicationScore', name: '沟通能力', color: 'bg-green-500' },
                        { key: 'cultureFitScore', name: '文化匹配', color: 'bg-purple-500' },
                        { key: 'problemSolvingScore', name: '解决问题', color: 'bg-orange-500' },
                        { key: 'motivationScore', name: '工作动机', color: 'bg-red-500' }
                      ].map((dimension) => {
                        const avgScore = feedbackList.length > 0 
                          ? Math.round((feedbackList.reduce((sum, f) => sum + f[dimension.key], 0) / feedbackList.length) * 10) / 10
                          : 0;
                        const percentage = (avgScore / 5) * 100;
                        
                        return (
                          <div key={dimension.key} className="flex items-center justify-between">
                            <span className="text-sm font-medium w-20">{dimension.name}</span>
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${dimension.color} h-2 rounded-full`} 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12">{avgScore}/5</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 面试官表现 */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>面试官评价统计</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(feedbackList.map(f => f.interviewer))).map((interviewer) => {
                      const interviewerFeedback = feedbackList.filter(f => f.interviewer === interviewer);
                      const avgRating = interviewerFeedback.length > 0
                        ? Math.round((interviewerFeedback.reduce((sum, f) => sum + f.overallRating, 0) / interviewerFeedback.length) * 10) / 10
                        : 0;
                      const recommendCount = interviewerFeedback.filter(f => ['hire', 'strong_hire'].includes(f.recommendation)).length;
                      
                      return (
                        <div key={interviewer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium">{interviewer}</div>
                            <Badge variant="outline">{interviewerFeedback.length}次面试</Badge>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">平均评分</div>
                              <div className="font-semibold text-blue-600">{avgRating}/5</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">推荐录用</div>
                              <div className="font-semibold text-green-600">{recommendCount}人</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 