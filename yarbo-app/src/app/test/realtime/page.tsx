"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeRecruitmentData, useRealtimeJobs } from "@/hooks/useRealtimeData";
import { ApplicationTrendChart, DepartmentDistributionChart } from "@/components/charts/RecruitmentCharts";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database } from "lucide-react";

export default function RealtimeTestPage() {
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }>>([]);

  // 使用实时数据Hooks
  const { 
    stats, 
    trendData, 
    departmentStats, 
    isLoading: statsLoading, 
    error: statsError, 
    refreshData 
  } = useRealtimeRecruitmentData();

  const { 
    jobs, 
    isLoading: jobsLoading, 
    error: jobsError, 
    refreshJobs 
  } = useRealtimeJobs();

  const runTests = () => {
    const results = [];

    // 测试1: 数据加载状态
    if (statsLoading || jobsLoading) {
      results.push({
        test: "数据加载状态",
        status: 'warning' as const,
        message: "数据正在加载中..."
      });
    } else {
      results.push({
        test: "数据加载状态",
        status: 'success' as const,
        message: "数据加载完成"
      });
    }

    // 测试2: 错误处理
    if (statsError || jobsError) {
      results.push({
        test: "错误处理",
        status: 'error' as const,
        message: `错误: ${statsError || jobsError}`
      });
    } else {
      results.push({
        test: "错误处理",
        status: 'success' as const,
        message: "无错误"
      });
    }

    // 测试3: 统计数据
    if (stats) {
      results.push({
        test: "招聘统计数据",
        status: 'success' as const,
        message: `获取到统计数据: ${stats.totalApplications} 申请, ${stats.totalHires} 录用`
      });
    } else {
      results.push({
        test: "招聘统计数据",
        status: 'warning' as const,
        message: "未获取到统计数据"
      });
    }

    // 测试4: 趋势数据
    if (trendData && trendData.length > 0) {
      results.push({
        test: "趋势数据",
        status: 'success' as const,
        message: `获取到 ${trendData.length} 个月的趋势数据`
      });
    } else {
      results.push({
        test: "趋势数据",
        status: 'warning' as const,
        message: "未获取到趋势数据"
      });
    }

    // 测试5: 部门数据
    if (departmentStats && departmentStats.length > 0) {
      results.push({
        test: "部门统计数据",
        status: 'success' as const,
        message: `获取到 ${departmentStats.length} 个部门的数据`
      });
    } else {
      results.push({
        test: "部门统计数据",
        status: 'warning' as const,
        message: "未获取到部门数据"
      });
    }

    // 测试6: 职位数据
    if (jobs && jobs.length > 0) {
      results.push({
        test: "职位数据",
        status: 'success' as const,
        message: `获取到 ${jobs.length} 个职位`
      });
    } else {
      results.push({
        test: "职位数据",
        status: 'warning' as const,
        message: "未获取到职位数据"
      });
    }

    setTestResults(results);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* 页面标题 */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">实时数据测试</h1>
                <p className="text-gray-600">验证Supabase实时数据集成功能</p>
              </div>
            </div>
          </header>

          {/* 控制面板 */}
          <div className="flex justify-center space-x-4">
            <Button onClick={runTests} className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>运行测试</span>
            </Button>
            <Button onClick={refreshData} variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>刷新统计数据</span>
            </Button>
            <Button onClick={refreshJobs} variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>刷新职位数据</span>
            </Button>
          </div>

          {/* 测试结果 */}
          {testResults.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.test}</span>
                        </div>
                        <Badge variant={result.status === 'success' ? 'default' : 'secondary'}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{result.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 数据展示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 统计数据 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>实时统计数据</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : stats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                      <div className="text-sm text-gray-600">总申请数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.totalHires}</div>
                      <div className="text-sm text-gray-600">录用数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
                      <div className="text-sm text-gray-600">转化率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.averageTimeToHire}</div>
                      <div className="text-sm text-gray-600">平均周期(天)</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">暂无数据</div>
                )}
              </CardContent>
            </Card>

            {/* 职位数据 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>实时职位数据</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                      <div className="text-sm text-gray-600">活跃职位</div>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {jobs.slice(0, 5).map((job) => (
                        <div key={job.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{job.title}</span>
                          <Badge variant="outline">{job.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">暂无职位数据</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 图表展示 */}
          {trendData && trendData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApplicationTrendChart data={trendData} />
              {departmentStats && departmentStats.length > 0 && (
                <DepartmentDistributionChart data={departmentStats} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
