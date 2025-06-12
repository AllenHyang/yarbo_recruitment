'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateAndDownloadReport, AssessmentResult } from "@/utils/pdfGenerator";
import { 
  Brain, 
  Users, 
  TrendingUp,
  Star,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Target,
  Award,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Loader2,
  RefreshCw
} from "lucide-react";

interface PersonalityResult {
  id: string;
  candidate_name: string;
  candidate_email: string;
  position: string;
  created_at: string;
  test_type: { name: string; display_name: string };
  status: 'completed' | 'in_progress' | 'pending';
  // 添加组件实际使用的属性
  candidateName: string;
  email: string;
  testDate: string;
  testType: string;
  scores: any;
  personalityType: string;
  strengths: string[];
  weaknesses: string[];
  careerSuggestions: string[];
  teamRole: string;
  workStyle: string;
  communicationStyle: string;
  overallScore: number;
  recommendation: 'high-fit' | 'medium-fit' | 'low-fit';
  assessment_results?: Array<{
    personality_type: string;
    personality_name: string;
    description: string;
    scores: any;
    strengths: string[];
    weaknesses: string[];
    career_suggestions: string[];
    team_role: string;
    work_style: string;
    communication_style: string;
    overall_score: number;
    recommendation: 'high-fit' | 'medium-fit' | 'low-fit';
  }>;
}

export default function PsychologicalAssessmentPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCandidate, setSelectedCandidate] = useState<PersonalityResult | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [assessmentResults, setAssessmentResults] = useState<PersonalityResult[]>([]);

  // 加载测评数据
  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessment?action=assessments');
      const result = await response.json();
      
      if (result.success) {
        // 转换数据格式以匹配组件期望的结构
        const transformedData = result.data.map((item: any) => ({
          id: item.id,
          candidateName: item.candidate_name,
          email: item.candidate_email,
          position: item.position,
          testDate: new Date(item.created_at).toLocaleDateString('zh-CN'),
          testType: item.test_types?.name || 'MBTI',
          status: item.status,
          // 从assessment_results中提取数据
          scores: item.assessment_results?.[0]?.scores || {},
          personalityType: item.assessment_results?.[0]?.personality_type || '待分析',
          strengths: item.assessment_results?.[0]?.strengths || [],
          weaknesses: item.assessment_results?.[0]?.weaknesses || [],
          careerSuggestions: item.assessment_results?.[0]?.career_suggestions || [],
          teamRole: item.assessment_results?.[0]?.team_role || '待分析',
          workStyle: item.assessment_results?.[0]?.work_style || '待分析',
          communicationStyle: item.assessment_results?.[0]?.communication_style || '待分析',
          overallScore: item.assessment_results?.[0]?.overall_score || 0,
          recommendation: item.assessment_results?.[0]?.recommendation || 'medium-fit'
        }));
        
        setAssessmentResults(transformedData);
      } else {
        console.error('Failed to load assessments:', result.error);
      }
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 统计数据
  const stats = {
    totalAssessments: assessmentResults.length,
    completedTests: assessmentResults.filter(r => r.status === 'completed').length,
    averageScore: assessmentResults.length > 0 
      ? Math.round(assessmentResults.reduce((sum, r) => sum + (r.overallScore || 0), 0) / assessmentResults.length)
      : 0,
    highFitCandidates: assessmentResults.filter(r => r.recommendation === 'high-fit').length
  };

  // 图表数据统计
  const chartData = {
    // 测评类型分布
    testTypeDistribution: Object.entries(
      assessmentResults.reduce((acc, result) => {
        acc[result.testType] = (acc[result.testType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({ type, count })),

    // 推荐等级分布
    recommendationDistribution: Object.entries(
      assessmentResults.reduce((acc, result) => {
        const level = getRecommendationBadge(result.recommendation).text;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([level, count]) => ({ level, count })),

    // 分数分布
    scoreDistribution: (() => {
      const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
      assessmentResults.forEach(result => {
        const score = result.overallScore || 0;
        if (score <= 20) buckets['0-20']++;
        else if (score <= 40) buckets['21-40']++;
        else if (score <= 60) buckets['41-60']++;
        else if (score <= 80) buckets['61-80']++;
        else buckets['81-100']++;
      });
      return Object.entries(buckets).map(([range, count]) => ({ range, count }));
    })(),

    // 月度测评趋势
    monthlyTrend: (() => {
      const monthlyData = assessmentResults.reduce((acc, result) => {
        const month = new Date(result.testDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
    })()
  };

  // 获取推荐等级的颜色和文本
  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'high-fit':
        return { color: 'bg-green-100 text-green-800', text: '高度匹配' };
      case 'medium-fit':
        return { color: 'bg-yellow-100 text-yellow-800', text: '中等匹配' };
      case 'low-fit':
        return { color: 'bg-red-100 text-red-800', text: '匹配度低' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: '待评估' };
    }
  };

  // 下载PDF报告
  const handleDownloadPDF = async (candidate: PersonalityResult) => {
    try {
      // 转换数据格式为PDF生成器期望的格式
      const assessmentResult: AssessmentResult = {
        id: candidate.id,
        type: candidate.testType.toLowerCase(),
        score: candidate.overallScore || 0,
        result: candidate.personalityType,
        description: `候选人在${candidate.testType}测评中展现出了${candidate.personalityType}的特征。工作风格倾向于${candidate.workStyle}，沟通方式偏向${candidate.communicationStyle}，在团队中适合担任${candidate.teamRole}的角色。`,
        date: new Date().toISOString(),
        candidate_name: candidate.candidateName,
        candidate_email: candidate.email,
        detailed_scores: candidate.scores
      };

      await generateAndDownloadReport(assessmentResult);
    } catch (error) {
      console.error('PDF生成失败:', error);
      alert('PDF生成失败，请稍后重试');
    }
  };

  // 获取测试类型的颜色
  const getTestTypeBadge = (testType: string) => {
    switch (testType) {
      case 'MBTI':
        return { color: 'bg-blue-100 text-blue-800', text: 'MBTI' };
      case 'BigFive':
        return { color: 'bg-purple-100 text-purple-800', text: '大五人格' };
      case 'DISC':
        return { color: 'bg-orange-100 text-orange-800', text: 'DISC' };
      case 'Enneagram':
        return { color: 'bg-pink-100 text-pink-800', text: '九型人格' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: testType };
    }
  };

  // 筛选结果
  const filteredResults = assessmentResults.filter(result => {
    const matchesSearch = result.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         result.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || result.testType === filterType;
    return matchesSearch && matchesFilter;
  });

  // 导出数据
  const exportData = () => {
    const exportData = {
      exportDate: new Date().toLocaleString('zh-CN'),
      totalRecords: filteredResults.length,
      data: filteredResults.map(result => ({
        姓名: result.candidateName,
        职位: result.position,
        测试类型: result.testType,
        测试日期: result.testDate,
        人格类型: result.personalityType,
        综合评分: result.overallScore,
        匹配度: getRecommendationBadge(result.recommendation).text,
        优势: result.strengths.join(', '),
        建议改进: result.weaknesses.join(', ')
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `心理测评报告_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg text-purple-600">正在加载心理测评数据...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                心理测评中心
              </h1>
              <p className="text-gray-600 mt-1">候选人性格分析与职业匹配度评估</p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadAssessments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => window.open('/assessment', '_blank')}>
                <Plus className="w-4 h-4 mr-2" />
                创建测试
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">测评总数</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalAssessments}</p>
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
                    <p className="text-2xl font-bold text-green-600">{stats.completedTests}</p>
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
                    <p className="text-2xl font-bold text-purple-600">{stats.averageScore}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">高匹配度</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.highFitCandidates}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容区域 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">测评概览</TabsTrigger>
              <TabsTrigger value="results">详细结果</TabsTrigger>
              <TabsTrigger value="analytics">数据分析</TabsTrigger>
            </TabsList>

            {/* 测评概览 */}
            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">最新测评结果</h3>
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
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="MBTI">MBTI</SelectItem>
                      <SelectItem value="BigFive">大五人格</SelectItem>
                      <SelectItem value="DISC">DISC</SelectItem>
                      <SelectItem value="Enneagram">九型人格</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredResults.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-12 text-center">
                    <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无测评数据</h3>
                    <p className="text-gray-600 mb-6">还没有候选人完成心理测评，点击下方按钮创建新的测评。</p>
                    <Button 
                      className="bg-violet-600 hover:bg-violet-700"
                      onClick={() => window.open('/assessment', '_blank')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      创建测试
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.slice(0, 6).map((result) => {
                    const recommendationBadge = getRecommendationBadge(result.recommendation);
                    const testTypeBadge = getTestTypeBadge(result.testType);
                    
                    return (
                      <Card key={result.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{result.candidateName}</CardTitle>
                              <CardDescription>{result.position}</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-violet-600">{result.overallScore || 0}</div>
                              <div className="text-xs text-gray-500">适配度</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={testTypeBadge.color}>{testTypeBadge.text}</Badge>
                            <Badge className={recommendationBadge.color}>{recommendationBadge.text}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">人格类型</div>
                              <div className="text-sm text-purple-600 font-medium">{result.personalityType}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">团队角色</div>
                              <div className="text-sm">{result.teamRole}</div>
                            </div>

                            {result.strengths && result.strengths.length > 0 && (
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">核心优势</div>
                                <div className="flex flex-wrap gap-1">
                                  {result.strengths.slice(0, 3).map((strength, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">{strength}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedCandidate(result);
                                setShowDetailDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              详细报告
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* 详细结果 */}
            <TabsContent value="results" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>所有测评结果</CardTitle>
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
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部类型</SelectItem>
                          <SelectItem value="MBTI">MBTI</SelectItem>
                          <SelectItem value="BigFive">大五人格</SelectItem>
                          <SelectItem value="DISC">DISC</SelectItem>
                          <SelectItem value="Enneagram">九型人格</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredResults.map((result) => {
                      const recommendationBadge = getRecommendationBadge(result.recommendation);
                      const testTypeBadge = getTestTypeBadge(result.testType);
                      
                      return (
                        <div key={result.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold">{result.candidateName}</h3>
                                <Badge variant="outline">{result.position}</Badge>
                                <Badge className={testTypeBadge.color}>{testTypeBadge.text}</Badge>
                                <Badge className={recommendationBadge.color}>{recommendationBadge.text}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{result.testDate}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Brain className="w-4 h-4" />
                                  <span>{result.personalityType}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{result.teamRole}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4" />
                                  <span>评分: {result.overallScore || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right mr-4">
                                <div className="text-2xl font-bold text-violet-600">{result.overallScore || 0}</div>
                                <div className="text-xs text-gray-500">适配度</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCandidate(result);
                                    setShowDetailDialog(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  查看详情
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadPDF(result)}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  下载报告
                                </Button>
                              </div>
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
                {/* 测评类型分布图表 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      <span>测评类型分布</span>
                    </CardTitle>
                    <CardDescription>各种测评类型的使用情况</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.testTypeDistribution.map(({ type, count }) => {
                        const total = chartData.testTypeDistribution.reduce((sum, item) => sum + item.count, 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        const { color } = getTestTypeBadge(type);
                        
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`} />
                              <span className="text-sm font-medium">{type}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${color.split(' ')[0]}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 匹配度分布 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span>匹配度分布</span>
                    </CardTitle>
                    <CardDescription>候选人与职位的匹配程度</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.recommendationDistribution.map(({ level, count }) => {
                        const total = chartData.recommendationDistribution.reduce((sum, item) => sum + item.count, 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        
                        return (
                          <div key={level} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                level === '高度匹配' ? 'bg-green-500' :
                                level === '中等匹配' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="text-sm font-medium">{level}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    level === '高度匹配' ? 'bg-green-500' :
                                    level === '中等匹配' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 分数分布图表 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span>分数分布</span>
                    </CardTitle>
                    <CardDescription>测评分数的分布情况</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.scoreDistribution.map(({ range, count }) => {
                        const total = chartData.scoreDistribution.reduce((sum, item) => sum + item.count, 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        
                        return (
                          <div key={range} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <span className="text-sm font-medium">{range}分</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-purple-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 月度趋势 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <span>月度测评趋势</span>
                    </CardTitle>
                    <CardDescription>每月测评完成数量趋势</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chartData.monthlyTrend.slice(-6).map(({ month, count }) => {
                        const maxCount = Math.max(...chartData.monthlyTrend.map(item => item.count));
                        const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                        
                        return (
                          <div key={month} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 rounded-full bg-indigo-500" />
                              <span className="text-sm font-medium">{month}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full bg-indigo-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {count} 次
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 洞察分析 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-pink-600" />
                    <span>数据洞察</span>
                  </CardTitle>
                  <CardDescription>基于测评数据的智能分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">优秀候选人比例</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalAssessments > 0 ? Math.round((stats.highFitCandidates / stats.totalAssessments) * 100) : 0}%
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        {stats.highFitCandidates} 位高匹配度候选人
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">完成率</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalAssessments > 0 ? Math.round((stats.completedTests / stats.totalAssessments) * 100) : 0}%
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        {stats.completedTests} 次完成测评
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">平均得分</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.averageScore}/100
                      </div>
                      <p className="text-xs text-purple-700 mt-1">
                        整体测评表现良好
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">💡 智能建议</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 当前{getTopTestType()}是最受欢迎的测评类型，建议重点优化相关功能</li>
                      <li>• 高匹配度候选人主要集中在{getTopScoreRange()}分数段</li>
                      <li>• 建议为低匹配度候选人提供针对性的能力提升建议</li>
                      <li>• 可考虑增加团队协作能力相关的测评维度</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 详细信息对话框 */}
          <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedCandidate ? `${selectedCandidate.candidateName} - 心理测评详细报告` : '心理测评报告'}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {selectedCandidate && (
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">候选人信息</Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">{selectedCandidate.candidateName}</div>
                          <div className="text-sm text-gray-600">{selectedCandidate.position}</div>
                          <div className="text-sm text-gray-600">{selectedCandidate.email}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">测试信息</Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getTestTypeBadge(selectedCandidate.testType).color}>
                              {getTestTypeBadge(selectedCandidate.testType).text}
                            </Badge>
                            <Badge className={getRecommendationBadge(selectedCandidate.recommendation).color}>
                              {getRecommendationBadge(selectedCandidate.recommendation).text}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">测试日期: {selectedCandidate.testDate}</div>
                          <div className="text-sm text-gray-600">综合评分: {selectedCandidate.overallScore || 0}/100</div>
                        </div>
                      </div>
                    </div>

                    {/* 人格类型与评分 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">人格类型与评分</Label>
                      <div className="p-4 bg-violet-50 rounded-lg">
                        <div className="text-xl font-bold text-violet-600 mb-2">{selectedCandidate.personalityType}</div>
                        {selectedCandidate.scores && Object.keys(selectedCandidate.scores).length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(selectedCandidate.scores).map(([key, value]) => {
                              const labels: { [key: string]: string } = {
                                E: '外向性', I: '内向性',
                                S: '感觉', N: '直觉',
                                T: '思考', F: '情感',
                                J: '判断', P: '知觉',
                                Extroversion: '外向性',
                                Agreeableness: '宜人性',
                                Conscientiousness: '尽责性',
                                Neuroticism: '神经质',
                                Openness: '开放性'
                              };
                              
                              return (
                                <div key={key} className="text-center">
                                  <div className="text-2xl font-bold text-violet-600">{value}</div>
                                  <div className="text-sm text-gray-600">{labels[key] || key}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 工作特征 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">团队角色</Label>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-600">{selectedCandidate.teamRole}</div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">工作风格</Label>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-600">{selectedCandidate.workStyle}</div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">沟通风格</Label>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="font-medium text-orange-600">{selectedCandidate.communicationStyle}</div>
                        </div>
                      </div>
                    </div>

                    {/* 优势与劣势 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">核心优势</Label>
                        <div className="space-y-2">
                          {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 ? (
                            selectedCandidate.strengths.map((strength, idx) => (
                              <div key={idx} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{strength}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">暂无数据</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">待改进项</Label>
                        <div className="space-y-2">
                          {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 ? (
                            selectedCandidate.weaknesses.map((weakness, idx) => (
                              <div key={idx} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm">{weakness}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">暂无数据</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 职业建议 */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">职业发展建议</Label>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        {selectedCandidate.careerSuggestions && selectedCandidate.careerSuggestions.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {selectedCandidate.careerSuggestions.map((suggestion, idx) => (
                              <Badge key={idx} variant="outline" className="justify-center">
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">暂无数据</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => alert('导出个人报告功能开发中...')}>
                  <Download className="w-4 h-4 mr-2" />
                  导出报告
                </Button>
                <Button onClick={() => {
                  setShowDetailDialog(false);
                  setSelectedCandidate(null);
                }}>
                  关闭
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 