'use client';

import { useState, useEffect } from 'react';
import { withRoleBasedAccess } from "@/components/withProtected";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ApplicationTrendChart,
    DepartmentDistributionChart,
    ConversionFunnelChart,
    SkillRadarChart,
    MonthlyStatsChart,
    EfficiencyDashboard
} from "@/components/charts/RecruitmentCharts";
import { useRealtimeRecruitmentData } from "@/hooks/useRealtimeData";
import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Download,
    RefreshCw,
    Calendar,
    Building2,
    Clock,
    Award
} from "lucide-react";

// 模拟数据
const mockTrendData = [
    { month: '1月', applications: 120, interviews: 45, offers: 12 },
    { month: '2月', applications: 98, interviews: 38, offers: 15 },
    { month: '3月', applications: 156, interviews: 62, offers: 18 },
    { month: '4月', applications: 134, interviews: 54, offers: 16 },
    { month: '5月', applications: 178, interviews: 71, offers: 22 },
    { month: '6月', applications: 145, interviews: 58, offers: 19 },
];

const mockDepartmentData = [
    { department: '产品研发部', count: 45, color: '#3B82F6' },
    { department: '机器人系统部', count: 32, color: '#10B981' },
    { department: '数据智能部', count: 28, color: '#F59E0B' },
    { department: '质量与可靠性部', count: 18, color: '#8B5CF6' },
    { department: '产品规划部', count: 15, color: '#EC4899' },
];

const mockConversionData = [
    { stage: '简历筛选', count: 831, rate: 100 },
    { stage: '初试', count: 298, rate: 36 },
    { stage: '复试', count: 156, rate: 52 },
    { stage: '终试', count: 89, rate: 57 },
    { stage: '录用', count: 67, rate: 75 },
];

const mockSkillData = [
    { skill: '技术能力', score: 85, fullMark: 100 },
    { skill: '沟通能力', score: 78, fullMark: 100 },
    { skill: '团队协作', score: 92, fullMark: 100 },
    { skill: '学习能力', score: 88, fullMark: 100 },
    { skill: '创新思维', score: 76, fullMark: 100 },
    { skill: '问题解决', score: 82, fullMark: 100 },
];

const mockMonthlyStats = [
    { month: '1月', applications: 120, hires: 12, rejections: 85 },
    { month: '2月', applications: 98, hires: 15, rejections: 68 },
    { month: '3月', applications: 156, hires: 18, rejections: 112 },
    { month: '4月', applications: 134, hires: 16, rejections: 95 },
    { month: '5月', applications: 178, hires: 22, rejections: 128 },
    { month: '6月', applications: 145, hires: 19, rejections: 98 },
];

const mockEfficiencyMetrics = {
    averageTimeToHire: 28,
    applicationToInterviewRate: 36,
    interviewToOfferRate: 57,
    offerAcceptanceRate: 75,
};

function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('6months');
    const {
        stats,
        trendData,
        departmentStats,
        isLoading,
        error,
        refreshData
    } = useRealtimeRecruitmentData();

    const exportReport = (type: string) => {
        const reportData = {
            type,
            period: selectedPeriod,
            generated: new Date().toISOString(),
            data: {
                stats,
                trends: trendData,
                departments: departmentStats,
                conversion: mockConversionData,
                efficiency: stats ? {
                    averageTimeToHire: stats.averageTimeToHire,
                    applicationToInterviewRate: stats.applicationToInterviewRate,
                    interviewToOfferRate: stats.interviewToOfferRate,
                    offerAcceptanceRate: stats.offerAcceptanceRate,
                } : mockEfficiencyMetrics
            }
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `招聘分析报告_${type}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-12">
                <div className="space-y-8">
                    {/* 页面标题 */}
                    <header className="text-center space-y-4">
                        <div className="inline-flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-3xl md:text-4xl font-bold gradient-text">数据分析中心</h1>
                                <p className="text-gray-600">深度洞察招聘数据，优化招聘策略</p>
                            </div>
                        </div>
                    </header>

                    {/* 控制面板 */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center space-x-4">
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="选择时间范围" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1month">最近1个月</SelectItem>
                                    <SelectItem value="3months">最近3个月</SelectItem>
                                    <SelectItem value="6months">最近6个月</SelectItem>
                                    <SelectItem value="1year">最近1年</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Calendar className="w-3 h-3 mr-1" />
                                {selectedPeriod === '1month' ? '最近1个月' :
                                    selectedPeriod === '3months' ? '最近3个月' :
                                        selectedPeriod === '6months' ? '最近6个月' : '最近1年'}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="outline"
                                onClick={refreshData}
                                disabled={isLoading}
                                className="flex items-center space-x-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                <span>刷新数据</span>
                            </Button>
                            <Button
                                onClick={() => exportReport('complete')}
                                className="flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>导出报告</span>
                            </Button>
                        </div>
                    </div>

                    {/* 关键指标卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">总申请数</p>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {stats?.totalApplications || 0}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">实时数据</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">面试转化率</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {stats?.applicationToInterviewRate || 0}%
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">实时数据</p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Target className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">平均招聘周期</p>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {stats?.averageTimeToHire || 0}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">天</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">录用成功率</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {stats?.offerAcceptanceRate || 0}%
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">实时数据</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Award className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 图表区域 */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">总览</TabsTrigger>
                            <TabsTrigger value="trends">趋势分析</TabsTrigger>
                            <TabsTrigger value="departments">部门分析</TabsTrigger>
                            <TabsTrigger value="efficiency">效率分析</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                                        <p className="text-gray-600">加载数据中...</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="text-center">
                                        <p className="text-red-600 mb-4">{error}</p>
                                        <Button onClick={refreshData} variant="outline">
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            重试
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <ApplicationTrendChart data={trendData.length > 0 ? trendData : mockTrendData} />
                                        <DepartmentDistributionChart data={departmentStats.length > 0 ? departmentStats : mockDepartmentData} />
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <ConversionFunnelChart data={mockConversionData} />
                                        <EfficiencyDashboard metrics={stats || mockEfficiencyMetrics} />
                                    </div>
                                </>
                            )}
                        </TabsContent>

                        <TabsContent value="trends" className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <ApplicationTrendChart data={trendData.length > 0 ? trendData : mockTrendData} />
                                <MonthlyStatsChart data={mockMonthlyStats} />
                            </div>
                        </TabsContent>

                        <TabsContent value="departments" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <DepartmentDistributionChart data={departmentStats.length > 0 ? departmentStats : mockDepartmentData} />
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-lg">部门招聘详情</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(departmentStats.length > 0 ? departmentStats : mockDepartmentData).map((dept, index) => (
                                                <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: dept.color }}></div>
                                                        <div>
                                                            <div className="font-medium">{dept.department}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {dept.count} 个录用 · {dept.count > 0 ? '活跃' : '待激活'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {Math.round((dept.count / (departmentStats.length > 0 ? departmentStats : mockDepartmentData).reduce((sum, d) => sum + d.count, 0)) * 100) || 0}%
                                                        </div>
                                                        <div className="text-sm text-gray-600">占比</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="efficiency" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <EfficiencyDashboard metrics={stats || mockEfficiencyMetrics} />
                                <ConversionFunnelChart data={mockConversionData} />
                            </div>
                            <SkillRadarChart data={mockSkillData} candidateName="平均候选人画像" />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default withRoleBasedAccess(AnalyticsPage);