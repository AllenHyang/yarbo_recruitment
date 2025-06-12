/*
 * @Author: Allen
 * @Date: 2025-06-09 16:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 16:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/hr/applications/[id]/status/route.ts
 * @Description: 申请状态更新API
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟申请数据存储
const mockApplications = new Map([
  ['1', {
    id: '1',
    candidate_name: '张三',
    candidate_email: 'zhangsan@example.com',
    job_title: '资深全栈工程师',
    status: 'reviewing',
    applied_at: '2025-06-08',
    rating: 4,
    resume_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status_history: [
      {
        status: 'pending',
        changed_at: '2025-06-08 14:30:00',
        changed_by: 'system',
        note: '申请已提交'
      },
      {
        status: 'reviewing',
        changed_at: '2025-06-09 09:00:00',
        changed_by: 'hr@yarbo.com',
        note: '开始审核'
      }
    ]
  }],
  ['2', {
    id: '2',
    candidate_name: '李四',
    candidate_email: 'lisi@example.com',
    job_title: '前端工程师',
    status: 'interview',
    applied_at: '2025-06-07',
    rating: 5,
    resume_url: '#',
    status_history: [
      {
        status: 'pending',
        changed_at: '2025-06-07 10:15:00',
        changed_by: 'system',
        note: '申请已提交'
      },
      {
        status: 'reviewing',
        changed_at: '2025-06-07 16:30:00',
        changed_by: 'hr@yarbo.com',
        note: '简历审核通过'
      },
      {
        status: 'interview',
        changed_at: '2025-06-08 11:00:00',
        changed_by: 'hr@yarbo.com',
        note: '安排技术面试'
      }
    ]
  }],
  ['3', {
    id: '3',
    candidate_name: '王五',
    candidate_email: 'wangwu@example.com',
    job_title: 'UI设计师',
    status: 'interview',
    applied_at: '2025-06-06',
    rating: 3,
    resume_url: '#',
    status_history: [
      {
        status: 'pending',
        changed_at: '2025-06-06 14:20:00',
        changed_by: 'system',
        note: '申请已提交'
      },
      {
        status: 'reviewing',
        changed_at: '2025-06-06 17:45:00',
        changed_by: 'hr@yarbo.com',
        note: '作品集审核中'
      },
      {
        status: 'interview',
        changed_at: '2025-06-07 09:30:00',
        changed_by: 'hr@yarbo.com',
        note: '安排设计面试'
      }
    ]
  }]
]);

// PATCH /api/hr/applications/[id]/status - 更新申请状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note, changed_by } = body;

    // 验证必要参数
    if (!status) {
      return NextResponse.json(
        { success: false, error: '状态参数不能为空' },
        { status: 400 }
      );
    }

    // 验证状态值
    const validStatuses = ['pending', 'reviewing', 'interview', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的状态值' },
        { status: 400 }
      );
    }

    // 获取申请记录
    const application = mockApplications.get(id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: '申请记录不存在' },
        { status: 404 }
      );
    }

    // 检查状态是否有变化
    if (application.status === status) {
      return NextResponse.json(
        { success: false, error: '状态未发生变化' },
        { status: 400 }
      );
    }

    // 更新状态
    const oldStatus = application.status;
    application.status = status;

    // 添加状态变更历史
    const statusChange = {
      status,
      changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      changed_by: changed_by || 'hr@yarbo.com',
      note: note || `状态从 ${getStatusText(oldStatus)} 更新为 ${getStatusText(status)}`
    };

    application.status_history.push(statusChange);

    // 保存更新
    mockApplications.set(id, application);

    // 发送邮件通知
    try {
      const emailResponse = await fetch('http://localhost:3000/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'status_change',
          data: {
            candidateName: application.candidate_name,
            candidateEmail: application.candidate_email,
            jobTitle: application.job_title,
            oldStatus: oldStatus,
            newStatus: status,
            statusNote: statusChange.note,
            companyName: 'Yarbo Inc.',
            hrName: changed_by || 'HR团队',
            applicationDate: application.applied_at,
            applicationId: id
          }
        })
      });

      const emailResult = await emailResponse.json();
      if (emailResult.success) {
        console.log('✅ 邮件通知发送成功:', emailResult.data.messageId);
      } else {
        console.error('❌ 邮件通知发送失败:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ 邮件通知发送异常:', emailError);
      // 邮件发送失败不影响状态更新
    }

    // 创建站内消息
    try {
      const messageResponse = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: 'system',
          sender_name: '系统',
          sender_role: 'system',
          receiver_id: application.candidate_email,
          receiver_name: application.candidate_name,
          receiver_role: 'candidate',
          title: `申请状态更新 - ${application.job_title}`,
          content: `您的申请状态已更新为"${getStatusText(status)}"。${statusChange.note}`,
          type: 'status_update',
          priority: status === 'hired' || status === 'rejected' ? 'high' : 'normal',
          metadata: {
            application_id: id,
            job_title: application.job_title,
            status_change: {
              from: getStatusText(oldStatus),
              to: getStatusText(status)
            }
          }
        })
      });

      const messageResult = await messageResponse.json();
      if (messageResult.success) {
        console.log('✅ 站内消息创建成功:', messageResult.data.id);
      } else {
        console.error('❌ 站内消息创建失败:', messageResult.error);
      }
    } catch (messageError) {
      console.error('❌ 站内消息创建异常:', messageError);
      // 站内消息创建失败不影响状态更新
    }

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        status: application.status,
        status_history: application.status_history,
        latest_change: statusChange
      },
      message: '状态更新成功'
    });

  } catch (error) {
    console.error('状态更新错误:', error);
    return NextResponse.json(
      { success: false, error: '状态更新失败' },
      { status: 500 }
    );
  }
}

// GET /api/hr/applications/[id]/status - 获取状态历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const application = mockApplications.get(id);
    if (!application) {
      return NextResponse.json(
        { success: false, error: '申请记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        current_status: application.status,
        status_history: application.status_history
      }
    });

  } catch (error) {
    console.error('获取状态历史错误:', error);
    return NextResponse.json(
      { success: false, error: '获取状态历史失败' },
      { status: 500 }
    );
  }
}

// 状态文本映射
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': '待处理',
    'reviewing': '审核中',
    'interview': '面试中',
    'hired': '已录用',
    'rejected': '已拒绝'
  };
  return statusMap[status] || status;
}
