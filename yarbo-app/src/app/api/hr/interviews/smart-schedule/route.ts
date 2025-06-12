/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/hr/interviews/smart-schedule/route.ts
 * @Description: 智能面试调度API接口
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  SmartInterviewScheduler, 
  SchedulingConstraints, 
  InterviewerAvailability,
  TimeSlot 
} from '@/lib/interview-scheduling';

// 模拟面试官数据
const mockInterviewers: InterviewerAvailability[] = [
  {
    id: 'int_1',
    interviewer_id: 'emp_001',
    interviewer_name: '张技术总监',
    date: '2025-01-28',
    time_slots: [
      {
        start_time: '09:00',
        end_time: '12:00',
        is_available: true,
        max_interviews: 3,
        current_interviews: 1
      },
      {
        start_time: '14:00',
        end_time: '17:00',
        is_available: true,
        max_interviews: 2,
        current_interviews: 0
      }
    ],
    skills: ['React', 'Node.js', '系统设计', '团队管理'],
    interview_types: ['technical', 'onsite'],
    workload_score: 60
  },
  {
    id: 'int_2',
    interviewer_id: 'emp_002',
    interviewer_name: '李前端专家',
    date: '2025-01-28',
    time_slots: [
      {
        start_time: '10:00',
        end_time: '12:00',
        is_available: true,
        max_interviews: 2,
        current_interviews: 0
      },
      {
        start_time: '15:00',
        end_time: '18:00',
        is_available: true,
        max_interviews: 3,
        current_interviews: 1
      }
    ],
    skills: ['React', 'Vue', 'TypeScript', 'UI/UX'],
    interview_types: ['technical', 'video', 'phone'],
    workload_score: 40
  },
  {
    id: 'int_3',
    interviewer_id: 'emp_003',
    interviewer_name: '王HR经理',
    date: '2025-01-28',
    time_slots: [
      {
        start_time: '09:00',
        end_time: '11:00',
        is_available: true,
        max_interviews: 4,
        current_interviews: 2
      },
      {
        start_time: '13:00',
        end_time: '17:00',
        is_available: true,
        max_interviews: 5,
        current_interviews: 1
      }
    ],
    skills: ['沟通能力', '文化匹配', '职业规划'],
    interview_types: ['phone', 'video', 'onsite'],
    workload_score: 70
  }
];

// 模拟现有面试数据
const mockExistingInterviews = [
  {
    id: 'interview_1',
    date: '2025-01-28',
    start_time: '10:00',
    end_time: '11:00',
    interviewer_ids: ['emp_001'],
    candidate_name: '现有候选人A'
  },
  {
    id: 'interview_2',
    date: '2025-01-28',
    start_time: '15:30',
    end_time: '16:30',
    interviewer_ids: ['emp_002'],
    candidate_name: '现有候选人B'
  }
];

// 模拟会议室数据
const mockMeetingRooms = [
  {
    id: 'room_1',
    name: '会议室A',
    capacity: 6,
    equipment: ['投影仪', '白板', '视频会议'],
    location: '3楼',
    is_available: true
  },
  {
    id: 'room_2',
    name: '会议室B',
    capacity: 4,
    equipment: ['白板', '视频会议'],
    location: '3楼',
    is_available: true
  }
];

// POST /api/hr/interviews/smart-schedule - 智能面试调度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      application_id,
      candidate_id,
      job_id,
      interview_type = 'technical',
      duration = 60,
      required_skills = [],
      preferred_interviewers = [],
      candidate_preferences = [],
      urgency_level = 'medium',
      buffer_time = 15
    } = body;

    // 验证必要参数
    if (!application_id || !candidate_id || !job_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数：application_id, candidate_id, job_id' },
        { status: 400 }
      );
    }

    // 验证面试类型
    const validInterviewTypes = ['phone', 'video', 'onsite', 'technical'];
    if (!validInterviewTypes.includes(interview_type)) {
      return NextResponse.json(
        { success: false, error: '无效的面试类型' },
        { status: 400 }
      );
    }

    // 构建调度约束条件
    const constraints: SchedulingConstraints = {
      interview_duration: duration,
      interview_type,
      required_skills,
      preferred_interviewers,
      urgency_level,
      buffer_time
    };

    // 处理候选人时间偏好
    const candidateTimePreferences: TimeSlot[] = candidate_preferences.map((pref: any) => ({
      date: pref.date,
      start_time: pref.start_time,
      end_time: pref.end_time
    }));

    console.log('🤖 开始智能面试调度:', {
      application_id,
      interview_type,
      duration,
      required_skills,
      candidate_preferences: candidateTimePreferences.length
    });

    // 创建调度器实例
    const scheduler = new SmartInterviewScheduler(
      mockInterviewers,
      mockMeetingRooms,
      mockExistingInterviews
    );

    // 执行智能调度
    const schedulingResult = scheduler.generateScheduleRecommendations(
      constraints,
      candidateTimePreferences
    );

    if (!schedulingResult.success) {
      return NextResponse.json({
        success: false,
        error: '智能调度失败',
        details: schedulingResult.scheduling_summary.recommendations
      }, { status: 400 });
    }

    // 为每个推荐时间段分配会议室（如果是现场面试）
    if (interview_type === 'onsite') {
      schedulingResult.recommended_slots.forEach(slot => {
        const availableRoom = mockMeetingRooms.find(room => room.is_available);
        if (availableRoom) {
          slot.meeting_room_id = availableRoom.id;
          slot.meeting_room_name = availableRoom.name;
        }
      });
    }

    console.log('✅ 智能调度完成:', {
      recommended_count: schedulingResult.recommended_slots.length,
      alternative_count: schedulingResult.alternative_options.length,
      best_score: schedulingResult.scheduling_summary.best_score
    });

    // 返回调度结果
    return NextResponse.json({
      success: true,
      data: {
        application_id,
        candidate_id,
        job_id,
        scheduling_result: schedulingResult,
        constraints_used: constraints,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
      },
      message: `成功生成 ${schedulingResult.recommended_slots.length} 个推荐时间段`
    });

  } catch (error) {
    console.error('智能面试调度错误:', error);
    return NextResponse.json(
      { success: false, error: '智能面试调度失败' },
      { status: 500 }
    );
  }
}

// GET /api/hr/interviews/smart-schedule - 获取调度配置信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'config';

    switch (type) {
      case 'config':
        // 返回调度配置信息
        return NextResponse.json({
          success: true,
          data: {
            available_interview_types: [
              { value: 'phone', label: '电话面试', duration: 30 },
              { value: 'video', label: '视频面试', duration: 45 },
              { value: 'onsite', label: '现场面试', duration: 60 },
              { value: 'technical', label: '技术面试', duration: 90 }
            ],
            urgency_levels: [
              { value: 'low', label: '低优先级', description: '2周内安排' },
              { value: 'medium', label: '中优先级', description: '1周内安排' },
              { value: 'high', label: '高优先级', description: '3天内安排' },
              { value: 'urgent', label: '紧急', description: '24小时内安排' }
            ],
            default_settings: {
              buffer_time: 15,
              max_daily_interviews: 6,
              preferred_time_slots: ['09:00-12:00', '14:00-17:00']
            },
            available_skills: [
              'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
              '系统设计', '团队管理', '沟通能力', '文化匹配'
            ]
          }
        });

      case 'interviewers':
        // 返回可用面试官信息
        return NextResponse.json({
          success: true,
          data: {
            interviewers: mockInterviewers.map(interviewer => ({
              id: interviewer.interviewer_id,
              name: interviewer.interviewer_name,
              skills: interviewer.skills,
              interview_types: interviewer.interview_types,
              workload_score: interviewer.workload_score,
              availability_summary: `${interviewer.time_slots.length} 个时间段可用`
            })),
            total_count: mockInterviewers.length,
            average_workload: Math.round(
              mockInterviewers.reduce((sum, i) => sum + i.workload_score, 0) / mockInterviewers.length
            )
          }
        });

      case 'rooms':
        // 返回会议室信息
        return NextResponse.json({
          success: true,
          data: {
            meeting_rooms: mockMeetingRooms,
            total_rooms: mockMeetingRooms.length,
            available_rooms: mockMeetingRooms.filter(room => room.is_available).length
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: '无效的查询类型' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('获取调度配置错误:', error);
    return NextResponse.json(
      { success: false, error: '获取调度配置失败' },
      { status: 500 }
    );
  }
}
