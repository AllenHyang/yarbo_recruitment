/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/hr/SmartInterviewScheduler.tsx
 * @Description: 智能面试调度组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  Users,
  Brain,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Video,
  Phone,
  Building,
  RefreshCw,
  Sparkles
} from "lucide-react";

interface SchedulingOption {
  date: string;
  start_time: string;
  end_time: string;
  interviewer_ids: string[];
  interviewer_names: string[];
  meeting_room_id?: string;
  meeting_room_name?: string;
  confidence_score: number;
  conflict_risks: string[];
  scheduling_notes: string[];
}

interface SmartSchedulerProps {
  applicationId: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  onScheduleConfirmed?: (schedule: any) => void;
  trigger?: React.ReactNode;
}

export function SmartInterviewScheduler({
  applicationId,
  candidateId,
  jobId,
  candidateName,
  jobTitle,
  onScheduleConfirmed,
  trigger
}: SmartSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // 调度配置
  const [scheduleConfig, setScheduleConfig] = useState({
    interview_type: 'technical',
    duration: 60,
    urgency_level: 'medium',
    required_skills: [] as string[],
    preferred_interviewers: [] as string[],
    buffer_time: 15
  });

  // 候选人时间偏好
  const [candidatePreferences, setCandidatePreferences] = useState<any[]>([]);
  
  // 调度结果
  const [schedulingResult, setSchedulingResult] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<SchedulingOption | null>(null);

  // 配置数据
  const [configData, setConfigData] = useState<any>(null);

  // 获取配置数据
  useEffect(() => {
    if (isOpen) {
      fetchConfigData();
    }
  }, [isOpen]);

  const fetchConfigData = async () => {
    try {
      const response = await fetch('/api/hr/interviews/smart-schedule?type=config');
      const result = await response.json();
      if (result.success) {
        setConfigData(result.data);
      }
    } catch (error) {
      console.error('获取配置数据失败:', error);
    }
  };

  const handleSmartSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hr/interviews/smart-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          candidate_id: candidateId,
          job_id: jobId,
          ...scheduleConfig,
          candidate_preferences: candidatePreferences
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSchedulingResult(result.data.scheduling_result);
        setCurrentStep(3);
        console.log('✅ 智能调度成功:', result.data);
      } else {
        throw new Error(result.error || '智能调度失败');
      }
    } catch (error) {
      console.error('智能调度失败:', error);
      alert('智能调度失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSchedule = async () => {
    if (!selectedOption) {
      alert('请选择一个时间段');
      return;
    }

    try {
      // 这里应该调用确认面试的API
      console.log('确认面试安排:', selectedOption);
      
      if (onScheduleConfirmed) {
        onScheduleConfirmed({
          ...selectedOption,
          application_id: applicationId,
          candidate_id: candidateId,
          job_id: jobId
        });
      }

      alert('面试安排已确认！');
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('确认面试失败:', error);
      alert('确认面试失败，请重试');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setScheduleConfig({
      interview_type: 'technical',
      duration: 60,
      urgency_level: 'medium',
      required_skills: [],
      preferred_interviewers: [],
      buffer_time: 15
    });
    setCandidatePreferences([]);
    setSchedulingResult(null);
    setSelectedOption(null);
  };

  const addTimePreference = () => {
    setCandidatePreferences(prev => [...prev, {
      date: '',
      start_time: '',
      end_time: ''
    }]);
  };

  const removeTimePreference = (index: number) => {
    setCandidatePreferences(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimePreference = (index: number, field: string, value: string) => {
    setCandidatePreferences(prev => prev.map((pref, i) => 
      i === index ? { ...pref, [field]: value } : pref
    ));
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'onsite': return <Building className="w-4 h-4" />;
      case 'technical': return <Brain className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            智能调度面试
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>智能面试调度</span>
          </DialogTitle>
          <DialogDescription>
            为 <strong>{candidateName}</strong> 申请的 <strong>{jobTitle}</strong> 职位智能安排面试时间
          </DialogDescription>
        </DialogHeader>

        <Tabs value={`step${currentStep}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step1" disabled={currentStep < 1}>
              1. 面试配置
            </TabsTrigger>
            <TabsTrigger value="step2" disabled={currentStep < 2}>
              2. 时间偏好
            </TabsTrigger>
            <TabsTrigger value="step3" disabled={currentStep < 3}>
              3. 智能推荐
            </TabsTrigger>
          </TabsList>

          {/* 步骤1: 面试配置 */}
          <TabsContent value="step1" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">面试基本配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>面试类型</Label>
                    <Select 
                      value={scheduleConfig.interview_type}
                      onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, interview_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {configData?.available_interview_types?.map((type: any) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              {getInterviewTypeIcon(type.value)}
                              <span>{type.label}</span>
                              <Badge variant="outline">{type.duration}分钟</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>面试时长（分钟）</Label>
                    <Input
                      type="number"
                      value={scheduleConfig.duration}
                      onChange={(e) => setScheduleConfig(prev => ({ 
                        ...prev, 
                        duration: parseInt(e.target.value) || 60 
                      }))}
                      min="15"
                      max="180"
                      step="15"
                    />
                  </div>
                </div>

                <div>
                  <Label>紧急程度</Label>
                  <Select 
                    value={scheduleConfig.urgency_level}
                    onValueChange={(value) => setScheduleConfig(prev => ({ ...prev, urgency_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {configData?.urgency_levels?.map((level: any) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>技能要求（可选）</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {configData?.available_skills?.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant={scheduleConfig.required_skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setScheduleConfig(prev => ({
                            ...prev,
                            required_skills: prev.required_skills.includes(skill)
                              ? prev.required_skills.filter(s => s !== skill)
                              : [...prev.required_skills, skill]
                          }));
                        }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)}>
                下一步：设置时间偏好
              </Button>
            </div>
          </TabsContent>

          {/* 步骤2: 时间偏好 */}
          <TabsContent value="step2" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">候选人时间偏好</CardTitle>
                <p className="text-sm text-gray-600">
                  添加候选人的可用时间段，系统将优先推荐这些时间
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidatePreferences.map((pref, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Input
                      type="date"
                      value={pref.date}
                      onChange={(e) => updateTimePreference(index, 'date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="time"
                      value={pref.start_time}
                      onChange={(e) => updateTimePreference(index, 'start_time', e.target.value)}
                    />
                    <span className="text-gray-500">至</span>
                    <Input
                      type="time"
                      value={pref.end_time}
                      onChange={(e) => updateTimePreference(index, 'end_time', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimePreference(index)}
                    >
                      删除
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={addTimePreference}>
                  <Calendar className="w-4 h-4 mr-2" />
                  添加时间段
                </Button>

                {candidatePreferences.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>暂无时间偏好，系统将推荐所有可用时间</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                上一步
              </Button>
              <Button onClick={handleSmartSchedule} disabled={isLoading}>
                {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                开始智能调度
              </Button>
            </div>
          </TabsContent>

          {/* 步骤3: 智能推荐 */}
          <TabsContent value="step3" className="space-y-4">
            {schedulingResult && (
              <>
                {/* 调度总结 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>智能调度结果</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {schedulingResult.recommended_slots?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">推荐时间段</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {schedulingResult.scheduling_summary?.best_score || 0}
                        </div>
                        <div className="text-sm text-gray-600">最高匹配度</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {schedulingResult.scheduling_summary?.total_conflicts || 0}
                        </div>
                        <div className="text-sm text-gray-600">潜在冲突</div>
                      </div>
                    </div>

                    {schedulingResult.scheduling_summary?.recommendations && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">调度建议：</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {schedulingResult.scheduling_summary.recommendations.map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 推荐时间段 */}
                {schedulingResult.recommended_slots?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">推荐时间段</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {schedulingResult.recommended_slots.map((option: SchedulingOption, index: number) => (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedOption === option 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedOption(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{option.date}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span>{option.start_time} - {option.end_time}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{option.interviewer_names.join(', ')}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getConfidenceColor(option.confidence_score)}>
                                <Star className="w-3 h-3 mr-1" />
                                {option.confidence_score}分
                              </Badge>
                              {selectedOption === option && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                          </div>

                          {option.meeting_room_name && (
                            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>会议室：{option.meeting_room_name}</span>
                            </div>
                          )}

                          {option.conflict_risks.length > 0 && (
                            <div className="mt-2 flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                              <div className="text-sm text-yellow-700">
                                <div className="font-medium">注意事项：</div>
                                <ul className="list-disc list-inside">
                                  {option.conflict_risks.map((risk, i) => (
                                    <li key={i}>{risk}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 备选方案 */}
                {schedulingResult.alternative_options?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">备选方案</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {schedulingResult.alternative_options.map((option: SchedulingOption, index: number) => (
                        <div
                          key={index}
                          className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedOption(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">{option.date} {option.start_time}-{option.end_time}</span>
                              <span className="text-sm text-gray-600">{option.interviewer_names.join(', ')}</span>
                            </div>
                            <Badge variant="outline" className={getConfidenceColor(option.confidence_score)}>
                              {option.confidence_score}分
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                重新配置
              </Button>
              <Button 
                onClick={handleConfirmSchedule}
                disabled={!selectedOption}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                确认面试安排
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
