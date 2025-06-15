/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/candidates/interview/[token]/page.tsx
 * @Description: 候选人面试时间选择页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Video,
  FileText,
  Timer
} from "lucide-react";

interface InterviewSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  interviewer_name: string;
  meeting_room?: string;
  is_available: boolean;
}

interface InterviewInvitation {
  candidate_name: string;
  job_title: string;
  company_name: string;
  interview_type: string;
  duration: number;
  status: string;
  available_slots: InterviewSlot[];
  selected_slot_id?: string;
  interview_details: {
    description: string;
    preparation_notes: string[];
    contact_person: string;
    contact_phone: string;
    contact_email: string;
  };
}

// 为静态导出生成参数
export async function generateStaticParams() {
  return [];
}

export default function CandidateInterviewPage({ params }: { params: { token: string } }) {
  const [invitation, setInvitation] = useState<InterviewInvitation | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(0);

  useEffect(() => {
    fetchInterviewInvitation();
  }, [params.token]);

  const fetchInterviewInvitation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/candidates/interview-slots/${params.token}`);
      const result = await response.json();

      if (result.success) {
        setInvitation(result.data.invitation);
        setExpiresInHours(result.data.expires_in_hours);
        setSelectedSlotId(result.data.invitation.selected_slot_id || '');
      } else {
        setError(result.error || '获取面试信息失败');
      }
    } catch (error) {
      console.error('获取面试信息失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmInterview = async () => {
    if (!selectedSlotId) {
      setError('请选择一个面试时间');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/candidates/interview-slots/${params.token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot_id: selectedSlotId,
          candidate_notes: candidateNotes
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        await fetchInterviewInvitation(); // 刷新数据
      } else {
        setError(result.error || '确认面试失败');
      }
    } catch (error) {
      console.error('确认面试失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async (newSlotId: string, reason: string) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/candidates/interview-slots/${params.token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_slot_id: newSlotId,
          reschedule_reason: reason
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        await fetchInterviewInvitation(); // 刷新数据
      } else {
        setError(result.error || '重新安排失败');
      }
    } catch (error) {
      console.error('重新安排失败:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  const getInterviewTypeInfo = (type: string) => {
    const types = {
      phone: { label: '电话面试', icon: Phone, color: 'bg-green-100 text-green-800' },
      video: { label: '视频面试', icon: Video, color: 'bg-blue-100 text-blue-800' },
      onsite: { label: '现场面试', icon: Building, color: 'bg-purple-100 text-purple-800' },
      technical: { label: '技术面试', icon: FileText, color: 'bg-orange-100 text-orange-800' }
    };
    return types[type as keyof typeof types] || types.onsite;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">正在加载面试信息...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">访问失败</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              重新加载
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const typeInfo = getInterviewTypeInfo(invitation.interview_type);
  const TypeIcon = typeInfo.icon;
  const confirmedSlot = invitation.available_slots.find(slot => slot.id === invitation.selected_slot_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面头部 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              面试时间安排
            </h1>
            <p className="text-gray-600">
              {invitation.company_name} · {invitation.job_title}
            </p>
          </div>

          {/* 过期提醒 */}
          {expiresInHours <= 24 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-orange-800">
                  <Timer className="w-5 h-5" />
                  <span className="font-medium">
                    请注意：此邀请将在 {expiresInHours} 小时后过期
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 成功消息 */}
          {success && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 错误消息 */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 面试信息 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TypeIcon className="w-5 h-5" />
                    <span>面试信息</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className={typeInfo.color}>
                      {typeInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>候选人：{invitation.candidate_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>时长：{invitation.duration} 分钟</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">面试说明</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {invitation.interview_details.description}
                    </p>

                    <h4 className="font-medium mb-2">准备事项</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {invitation.interview_details.preparation_notes.map((note, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">联系方式</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{invitation.interview_details.contact_person}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{invitation.interview_details.contact_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{invitation.interview_details.contact_email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 时间选择 */}
            <div className="lg:col-span-2">
              {invitation.status === 'confirmed' && confirmedSlot ? (
                // 已确认状态
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>面试已确认</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <Calendar className="w-12 h-12 text-green-600 mx-auto mb-2" />
                        <h3 className="text-xl font-semibold text-green-800">
                          {formatDate(confirmedSlot.date)}
                        </h3>
                        <p className="text-lg text-green-700">
                          {confirmedSlot.start_time} - {confirmedSlot.end_time}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-green-700">
                        <div className="flex items-center justify-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>面试官：{confirmedSlot.interviewer_name}</span>
                        </div>
                        {confirmedSlot.meeting_room && (
                          <div className="flex items-center justify-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>地点：{confirmedSlot.meeting_room}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        如需重新安排面试时间，请选择其他可用时间段
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('请输入重新安排的原因：');
                          if (reason && selectedSlotId && selectedSlotId !== invitation.selected_slot_id) {
                            handleReschedule(selectedSlotId, reason);
                          }
                        }}
                        disabled={!selectedSlotId || selectedSlotId === invitation.selected_slot_id}
                      >
                        重新安排面试
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // 选择时间状态
                <Card>
                  <CardHeader>
                    <CardTitle>选择面试时间</CardTitle>
                    <p className="text-sm text-gray-600">
                      请从以下可用时间段中选择一个最适合您的时间
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {invitation.available_slots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>暂无可用时间段</p>
                        <p className="text-sm">请联系HR安排其他时间</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid gap-3">
                          {invitation.available_slots.map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedSlotId === slot.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              onClick={() => setSelectedSlotId(slot.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-900">
                                      {formatDate(slot.date)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {slot.start_time} - {slot.end_time}
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-sm">
                                      <User className="w-4 h-4 text-gray-500" />
                                      <span>{slot.interviewer_name}</span>
                                    </div>
                                    {slot.meeting_room && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{slot.meeting_room}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {selectedSlotId === slot.id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <Label htmlFor="notes">备注（可选）</Label>
                          <Textarea
                            id="notes"
                            placeholder="如有特殊需求或说明，请在此填写..."
                            value={candidateNotes}
                            onChange={(e) => setCandidateNotes(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <Button
                          onClick={handleConfirmInterview}
                          disabled={!selectedSlotId || isSubmitting}
                          className="w-full"
                          size="lg"
                        >
                          {isSubmitting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                          确认面试时间
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
