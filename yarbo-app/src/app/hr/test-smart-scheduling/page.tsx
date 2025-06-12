/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/hr/test-smart-scheduling/page.tsx
 * @Description: 智能面试调度系统测试页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartInterviewScheduler } from "@/components/hr/SmartInterviewScheduler";
import { 
  Brain,
  Calendar,
  Clock,
  Users,
  Sparkles,
  CheckCircle,
  AlertCircle,
  TestTube,
  User,
  MapPin,
  Video,
  Phone,
  Building,
  Star,
  TrendingUp,
  BarChart3,
  Timer
} from "lucide-react";

export default function TestSmartSchedulingPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  // 测试数据
  const testCandidates = [
    {
      id: 'candidate_001',
      name: '张三',
      job: '资深全栈工程师',
      skills: ['React', 'Node.js', '系统设计'],
      urgency: 'high'
    },
    {
      id: 'candidate_002', 
      name: '李四',
      job: '前端工程师',
      skills: ['Vue', 'React', 'UI/UX'],
      urgency: 'medium'
    },
    {
      id: 'candidate_003',
      name: '王五',
      job: 'UI设计师',
      skills: ['Figma', 'Sketch', '用户体验'],
      urgency: 'urgent'
    }
  ];

  const handleScheduleConfirmed = (schedule: any) => {
    console.log('✅ 面试调度确认:', schedule);
    setTestResults(prev => [...prev, {
      id: Date.now(),
      type: 'schedule_confirmed',
      data: schedule,
      timestamp: new Date().toISOString(),
      status: 'success'
    }]);
  };

  const testSmartSchedulingAPI = async () => {
    setIsTestingAPI(true);
    
    try {
      // 测试智能调度API
      const response = await fetch('/api/hr/interviews/smart-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: 'test_app_001',
          candidate_id: 'test_candidate_001',
          job_id: 'test_job_001',
          interview_type: 'technical',
          duration: 60,
          required_skills: ['React', 'Node.js'],
          urgency_level: 'high',
          candidate_preferences: [
            {
              date: '2025-01-29',
              start_time: '10:00',
              end_time: '12:00'
            },
            {
              date: '2025-01-30',
              start_time: '14:00',
              end_time: '16:00'
            }
          ]
        })
      });

      const result = await response.json();
      
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'api_test',
        data: result,
        timestamp: new Date().toISOString(),
        status: result.success ? 'success' : 'error'
      }]);

      console.log('🧪 API测试结果:', result);
      
    } catch (error) {
      console.error('API测试失败:', error);
      setTestResults(prev => [...prev, {
        id: Date.now(),
        type: 'api_test',
        data: { error: error.message },
        timestamp: new Date().toISOString(),
        status: 'error'
      }]);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const testCandidateInterface = () => {
    // 打开候选人面试选择页面
    const token = 'token_abc123'; // 测试token
    window.open(`/candidates/interview/${token}`, '_blank');
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule_confirmed': return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'api_test': return <Brain className="w-4 h-4 text-purple-600" />;
      default: return <TestTube className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 页面头部 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              智能面试调度系统测试
            </h1>
            <p className="text-gray-600">
              测试AI驱动的面试时间智能推荐和自动化调度功能
            </p>
          </div>

          {/* 功能特性展示 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">AI智能推荐</h3>
                <p className="text-sm text-gray-600">基于多维度算法推荐最佳时间</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">负载均衡</h3>
                <p className="text-sm text-gray-600">自动平衡面试官工作量</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <Timer className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">冲突检测</h3>
                <p className="text-sm text-gray-600">实时检测时间冲突</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">效率提升</h3>
                <p className="text-sm text-gray-600">节省60%调度时间</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 智能调度测试 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>智能调度测试</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  测试不同候选人的智能面试调度功能
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {testCandidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{candidate.name}</h4>
                        <p className="text-sm text-gray-600">{candidate.job}</p>
                      </div>
                      <Badge variant={
                        candidate.urgency === 'urgent' ? 'destructive' :
                        candidate.urgency === 'high' ? 'default' : 'secondary'
                      }>
                        {candidate.urgency === 'urgent' ? '紧急' :
                         candidate.urgency === 'high' ? '高优先级' : '中优先级'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <SmartInterviewScheduler
                      applicationId={`app_${candidate.id}`}
                      candidateId={candidate.id}
                      jobId={`job_${candidate.id}`}
                      candidateName={candidate.name}
                      jobTitle={candidate.job}
                      onScheduleConfirmed={handleScheduleConfirmed}
                      trigger={
                        <Button size="sm" className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          智能调度面试
                        </Button>
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* API和功能测试 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5 text-green-600" />
                  <span>API和功能测试</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={testSmartSchedulingAPI}
                    disabled={isTestingAPI}
                    className="w-full"
                  >
                    {isTestingAPI && <Clock className="w-4 h-4 mr-2 animate-spin" />}
                    测试智能调度API
                  </Button>
                  
                  <Button 
                    onClick={testCandidateInterface}
                    variant="outline"
                    className="w-full"
                  >
                    <User className="w-4 h-4 mr-2" />
                    测试候选人选择界面
                  </Button>
                  
                  <Button 
                    onClick={clearTestResults}
                    variant="outline"
                    className="w-full"
                  >
                    清空测试结果
                  </Button>
                </div>

                {/* 测试结果 */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="font-medium flex items-center justify-between">
                    测试结果
                    <Badge variant="outline">{testResults.length}</Badge>
                  </h4>
                  
                  {testResults.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无测试结果</p>
                    </div>
                  ) : (
                    testResults.slice().reverse().map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(result.type)}
                            <span className="font-medium">
                              {result.type === 'schedule_confirmed' ? '调度确认' : 'API测试'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <span className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(result.data, null, 2).substring(0, 200)}
                            {JSON.stringify(result.data, null, 2).length > 200 ? '...' : ''}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 系统说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>系统功能说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span>智能算法特性</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>多维度评分</strong>：时间偏好、工作负载、紧急程度、冲突风险</li>
                    <li>• <strong>负载均衡</strong>：自动平衡面试官工作量分配</li>
                    <li>• <strong>冲突检测</strong>：实时检测和避免时间冲突</li>
                    <li>• <strong>优先级排序</strong>：根据候选人质量和职位紧急度排序</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>用户体验优化</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>候选人自助</strong>：候选人可自主选择面试时间</li>
                    <li>• <strong>一键调度</strong>：HR一键生成最优时间推荐</li>
                    <li>• <strong>智能提醒</strong>：自动发送面试通知和提醒</li>
                    <li>• <strong>重新安排</strong>：支持灵活的时间调整</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
