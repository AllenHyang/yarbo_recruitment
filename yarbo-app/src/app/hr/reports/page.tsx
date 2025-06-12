'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationTrendChart, DepartmentDistributionChart } from "@/components/charts/RecruitmentCharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Clock,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Mail,
  Filter,
  Building2
} from "lucide-react";

interface ReportData {
  period: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
  conversionRate: number;
}

interface DepartmentStats {
  department: string;
  openPositions: number;
  applications: number;
  hires: number;
  avgTimeToHire: number;
  color: string;
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // 模拟报告数据
  const reportData: ReportData[] = [
    { period: '2025-01', applications: 245, interviews: 89, offers: 32, hires: 28, conversionRate: 11.4 },
    { period: '2025-02', applications: 198, interviews: 76, offers: 28, hires: 25, conversionRate: 12.6 },
    { period: '2025-03', applications: 312, interviews: 95, offers: 35, hires: 31, conversionRate: 9.9 },
    { period: '2025-04', applications: 276, interviews: 102, offers: 38, hires: 34, conversionRate: 12.3 },
    { period: '2025-05', applications: 189, interviews: 67, offers: 24, hires: 22, conversionRate: 11.6 },
    { period: '2025-06', applications: 156, interviews: 58, offers: 19, hires: 16, conversionRate: 10.3 }
  ];

  const departmentStats: DepartmentStats[] = [
    {
      department: '技术部',
      openPositions: 8,
      applications: 125,
      hires: 15,
      avgTimeToHire: 18,
      color: 'bg-blue-500'
    },
    {
      department: '产品部',
      openPositions: 4,
      applications: 89,
      hires: 8,
      avgTimeToHire: 22,
      color: 'bg-green-500'
    },
    {
      department: '设计部',
      openPositions: 3,
      applications: 67,
      hires: 6,
      avgTimeToHire: 25,
      color: 'bg-purple-500'
    },
    {
      department: '市场部',
      openPositions: 5,
      applications: 94,
      hires: 9,
      avgTimeToHire: 20,
      color: 'bg-orange-500'
    },
    {
      department: '数据部',
      openPositions: 2,
      applications: 78,
      hires: 5,
      avgTimeToHire: 28,
      color: 'bg-red-500'
    }
  ];

  const currentPeriodData = reportData[reportData.length - 1];
  const previousPeriodData = reportData[reportData.length - 2];

  // 图表数据
  const chartTrendData = reportData.slice(-6).map(data => ({
    month: data.period,
    applications: data.applications,
    interviews: data.interviews,
    offers: data.offers
  }));

  const chartDepartmentData = departmentStats.map(dept => ({
    department: dept.department,
    count: dept.hires,
    color: dept.color.replace('bg-', '#').replace('-500', '')
  }));

  // 计算变化百分比
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return { value: change, isPositive: change > 0 };
  };

  const generateReport = (type: string) => {
    const reportContent = {
      type,
      period: selectedPeriod,
      generated: new Date().toLocaleString('zh-CN'),
      data: {
        totalApplications: currentPeriodData.applications,
        totalInterviews: currentPeriodData.interviews,
        totalOffers: currentPeriodData.offers,
        totalHires: currentPeriodData.hires,
        conversionRate: currentPeriodData.conversionRate,
        departmentBreakdown: departmentStats
      }
    };

    const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `招聘报告_${type}_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                数据报告中心
              </h1>
              <p className="text-gray-600 mt-1">招聘数据分析与报告生成</p>
            </div>

            <div className="flex space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">本周</SelectItem>
                  <SelectItem value="this-month">本月</SelectItem>
                  <SelectItem value="last-month">上月</SelectItem>
                  <SelectItem value="this-quarter">本季度</SelectItem>
                  <SelectItem value="this-year">今年</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新数据
              </Button>

              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => generateReport('comprehensive')}
              >
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </div>

          {/* 核心指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">总申请数</p>
                    <p className="text-2xl font-bold text-blue-600">{currentPeriodData.applications}</p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = calculateChange(currentPeriodData.applications, previousPeriodData.applications);
                        return (
                          <span className={`text-xs ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change.isPositive ? '↗' : '↘'} {Math.abs(change.value).toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">面试数量</p>
                    <p className="text-2xl font-bold text-green-600">{currentPeriodData.interviews}</p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = calculateChange(currentPeriodData.interviews, previousPeriodData.interviews);
                        return (
                          <span className={`text-xs ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change.isPositive ? '↗' : '↘'} {Math.abs(change.value).toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">录用人数</p>
                    <p className="text-2xl font-bold text-purple-600">{currentPeriodData.hires}</p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = calculateChange(currentPeriodData.hires, previousPeriodData.hires);
                        return (
                          <span className={`text-xs ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change.isPositive ? '↗' : '↘'} {Math.abs(change.value).toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
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
                    <p className="text-sm text-gray-600">转化率</p>
                    <p className="text-2xl font-bold text-orange-600">{currentPeriodData.conversionRate}%</p>
                    <div className="flex items-center mt-1">
                      {(() => {
                        const change = calculateChange(currentPeriodData.conversionRate, previousPeriodData.conversionRate);
                        return (
                          <span className={`text-xs ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change.isPositive ? '↗' : '↘'} {Math.abs(change.value).toFixed(1)}%
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 趋势图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 申请趋势图 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      <span>申请趋势分析</span>
                    </CardTitle>
                    <CardDescription>过去6个月申请数量变化</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => generateReport('trend')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ApplicationTrendChart data={chartTrendData} />
              </CardContent>
            </Card>

            {/* 部门分析 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-green-600" />
                      <span>部门招聘分析</span>
                    </CardTitle>
                    <CardDescription>各部门招聘效果对比</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => generateReport('department')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DepartmentDistributionChart data={chartDepartmentData} />
              </CardContent>
            </Card>
          </div>

          {/* 报告模板区域 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">月度招聘报告</CardTitle>
                <CardDescription>包含详细的月度招聘数据分析和趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">数据时间</span>
                    <Badge variant="outline">2025年6月</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">报告页数</span>
                    <span>15页</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">更新频率</span>
                    <span>每月</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => generateReport('monthly')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  生成报告
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">季度效果分析</CardTitle>
                <CardDescription>深度分析季度招聘效果和改进建议</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">数据时间</span>
                    <Badge variant="outline">2025 Q2</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">报告页数</span>
                    <span>25页</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">更新频率</span>
                    <span>每季度</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => generateReport('quarterly')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  生成报告
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">部门对比报告</CardTitle>
                <CardDescription>各部门招聘效率和成本对比分析</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">部门数量</span>
                    <Badge variant="outline">5个部门</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">报告页数</span>
                    <span>20页</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">更新频率</span>
                    <span>实时</span>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => generateReport('department-comparison')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  生成报告
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 快速操作 */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-12">
                  <Mail className="w-4 h-4 mr-2" />
                  邮件发送报告
                </Button>
                <Button variant="outline" className="h-12">
                  <Clock className="w-4 h-4 mr-2" />
                  定时报告设置
                </Button>
                <Button variant="outline" className="h-12">
                  <Filter className="w-4 h-4 mr-2" />
                  自定义筛选
                </Button>
                <Button variant="outline" className="h-12">
                  <Target className="w-4 h-4 mr-2" />
                  KPI设置
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 