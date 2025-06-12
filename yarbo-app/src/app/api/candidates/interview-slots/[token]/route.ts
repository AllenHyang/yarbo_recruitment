/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/candidates/interview-slots/[token]/route.ts
 * @Description: 候选人面试时间选择API
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟面试邀请数据
const mockInterviewInvitations = new Map([
  ['token_abc123', {
    id: 'invitation_1',
    token: 'token_abc123',
    application_id: 'app_001',
    candidate_id: 'candidate_001',
    candidate_name: '张三',
    candidate_email: 'zhangsan@example.com',
    job_id: 'job_001',
    job_title: '资深全栈工程师',
    company_name: 'Yarbo Inc.',
    interview_type: 'technical',
    duration: 60,
    status: 'pending', // pending, confirmed, rescheduled, expired
    available_slots: [
      {
        id: 'slot_1',
        date: '2025-01-29',
        start_time: '10:00',
        end_time: '11:00',
        interviewer_name: '张技术总监',
        meeting_room: '会议室A',
        is_available: true
      },
      {
        id: 'slot_2',
        date: '2025-01-29',
        start_time: '14:00',
        end_time: '15:00',
        interviewer_name: '李前端专家',
        meeting_room: '会议室B',
        is_available: true
      },
      {
        id: 'slot_3',
        date: '2025-01-30',
        start_time: '09:00',
        end_time: '10:00',
        interviewer_name: '张技术总监',
        meeting_room: '会议室A',
        is_available: true
      },
      {
        id: 'slot_4',
        date: '2025-01-30',
        start_time: '15:30',
        end_time: '16:30',
        interviewer_name: '王HR经理',
        meeting_room: null, // 视频面试
        is_available: true
      }
    ],
    selected_slot_id: null,
    confirmed_at: null,
    expires_at: '2025-02-03T23:59:59Z',
    created_at: '2025-01-27T10:00:00Z',
    interview_details: {
      description: '技术面试将包括算法、系统设计和项目经验讨论',
      preparation_notes: [
        '请准备介绍您最有挑战性的项目',
        '可能会有编程题目，建议准备纸笔',
        '请提前5分钟到达面试地点'
      ],
      contact_person: '王HR经理',
      contact_phone: '+86 138-0000-0000',
      contact_email: 'hr@yarbo.com'
    }
  }]
]);

// GET /api/candidates/interview-slots/[token] - 获取面试时间选择信息
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: '缺少访问令牌' },
        { status: 400 }
      );
    }

    // 验证token并获取面试邀请信息
    const invitation = mockInterviewInvitations.get(token);
    
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: '无效的访问令牌或邀请已过期' },
        { status: 404 }
      );
    }

    // 检查邀请是否过期
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: '面试邀请已过期，请联系HR重新安排' },
        { status: 410 }
      );
    }

    // 过滤掉已过期的时间段
    const validSlots = invitation.available_slots.filter(slot => {
      const slotDate = new Date(`${slot.date}T${slot.start_time}:00`);
      return slotDate > now && slot.is_available;
    });

    console.log(`📅 候选人 ${invitation.candidate_name} 查看面试时间选择`);

    return NextResponse.json({
      success: true,
      data: {
        invitation: {
          ...invitation,
          available_slots: validSlots
        },
        current_time: now.toISOString(),
        expires_in_hours: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60))
      }
    });

  } catch (error) {
    console.error('获取面试时间选择信息错误:', error);
    return NextResponse.json(
      { success: false, error: '获取面试信息失败' },
      { status: 500 }
    );
  }
}

// POST /api/candidates/interview-slots/[token] - 选择面试时间
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { slot_id, candidate_notes } = body;

    if (!token || !slot_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证token并获取面试邀请信息
    const invitation = mockInterviewInvitations.get(token);
    
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: '无效的访问令牌' },
        { status: 404 }
      );
    }

    // 检查邀请是否过期
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, error: '面试邀请已过期' },
        { status: 410 }
      );
    }

    // 验证选择的时间段
    const selectedSlot = invitation.available_slots.find(slot => slot.id === slot_id);
    
    if (!selectedSlot) {
      return NextResponse.json(
        { success: false, error: '无效的时间段选择' },
        { status: 400 }
      );
    }

    if (!selectedSlot.is_available) {
      return NextResponse.json(
        { success: false, error: '选择的时间段已不可用' },
        { status: 409 }
      );
    }

    // 检查时间段是否已过期
    const slotDateTime = new Date(`${selectedSlot.date}T${selectedSlot.start_time}:00`);
    if (slotDateTime <= now) {
      return NextResponse.json(
        { success: false, error: '选择的时间段已过期' },
        { status: 400 }
      );
    }

    // 更新面试邀请状态
    invitation.selected_slot_id = slot_id;
    invitation.status = 'confirmed';
    invitation.confirmed_at = now.toISOString();
    invitation.candidate_notes = candidate_notes || '';

    // 标记其他时间段为不可用
    invitation.available_slots.forEach(slot => {
      if (slot.id !== slot_id) {
        slot.is_available = false;
      }
    });

    mockInterviewInvitations.set(token, invitation);

    console.log(`✅ 候选人 ${invitation.candidate_name} 确认面试时间:`, {
      date: selectedSlot.date,
      time: `${selectedSlot.start_time}-${selectedSlot.end_time}`,
      interviewer: selectedSlot.interviewer_name
    });

    // 模拟发送确认邮件
    console.log(`📧 发送面试确认邮件给 ${invitation.candidate_email}`);

    return NextResponse.json({
      success: true,
      data: {
        confirmed_slot: selectedSlot,
        interview_details: invitation.interview_details,
        confirmation_number: `INT-${Date.now()}`,
        message: '面试时间已确认，确认邮件已发送到您的邮箱'
      },
      message: '面试时间确认成功！'
    });

  } catch (error) {
    console.error('确认面试时间错误:', error);
    return NextResponse.json(
      { success: false, error: '确认面试时间失败' },
      { status: 500 }
    );
  }
}

// PUT /api/candidates/interview-slots/[token] - 重新安排面试时间
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { new_slot_id, reschedule_reason } = body;

    if (!token || !new_slot_id || !reschedule_reason) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证token并获取面试邀请信息
    const invitation = mockInterviewInvitations.get(token);
    
    if (!invitation) {
      return NextResponse.json(
        { success: false, error: '无效的访问令牌' },
        { status: 404 }
      );
    }

    if (invitation.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: '只能重新安排已确认的面试' },
        { status: 400 }
      );
    }

    // 验证新的时间段
    const newSlot = invitation.available_slots.find(slot => slot.id === new_slot_id);
    
    if (!newSlot || !newSlot.is_available) {
      return NextResponse.json(
        { success: false, error: '新选择的时间段不可用' },
        { status: 400 }
      );
    }

    // 获取原来的时间段
    const oldSlot = invitation.available_slots.find(slot => slot.id === invitation.selected_slot_id);

    // 更新面试安排
    invitation.selected_slot_id = new_slot_id;
    invitation.status = 'rescheduled';
    invitation.reschedule_history = invitation.reschedule_history || [];
    invitation.reschedule_history.push({
      old_slot: oldSlot,
      new_slot: newSlot,
      reason: reschedule_reason,
      rescheduled_at: new Date().toISOString()
    });

    // 重新标记时间段可用性
    invitation.available_slots.forEach(slot => {
      if (slot.id === invitation.selected_slot_id) {
        slot.is_available = false; // 新选择的时间段标记为不可用
      } else if (slot.id === oldSlot?.id) {
        slot.is_available = true; // 原时间段重新可用
      }
    });

    mockInterviewInvitations.set(token, invitation);

    console.log(`🔄 候选人 ${invitation.candidate_name} 重新安排面试:`, {
      from: oldSlot ? `${oldSlot.date} ${oldSlot.start_time}-${oldSlot.end_time}` : '未知',
      to: `${newSlot.date} ${newSlot.start_time}-${newSlot.end_time}`,
      reason: reschedule_reason
    });

    return NextResponse.json({
      success: true,
      data: {
        new_slot: newSlot,
        old_slot: oldSlot,
        reschedule_reason,
        confirmation_number: `INT-${Date.now()}-R`,
        message: '面试时间已重新安排，通知邮件已发送'
      },
      message: '面试时间重新安排成功！'
    });

  } catch (error) {
    console.error('重新安排面试时间错误:', error);
    return NextResponse.json(
      { success: false, error: '重新安排面试时间失败' },
      { status: 500 }
    );
  }
}
