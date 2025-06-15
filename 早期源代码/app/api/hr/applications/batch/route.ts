/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/hr/applications/batch/route.ts
 * @Description: 申请管理批量操作API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟申请数据存储（实际项目中应该使用数据库）
const mockApplications = new Map([
  ['1', {
    id: '1',
    candidate_name: '张三',
    candidate_email: 'zhangsan@example.com',
    job_title: '资深全栈工程师',
    status: 'pending',
    applied_at: '2025-06-08',
    rating: 4,
    resume_url: '#',
    notes: '',
    tags: []
  }],
  ['2', {
    id: '2',
    candidate_name: '李四',
    candidate_email: 'lisi@example.com',
    job_title: '前端工程师',
    status: 'reviewing',
    applied_at: '2025-06-07',
    rating: 5,
    resume_url: '#',
    notes: '',
    tags: []
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
    notes: '',
    tags: []
  }]
]);

// 批量操作类型定义
interface BatchOperation {
  action: 'update_status' | 'send_email' | 'add_note' | 'add_tags' | 'delete' | 'archive';
  application_ids: string[];
  data?: {
    status?: string;
    note?: string;
    tags?: string[];
    email_template?: string;
    email_subject?: string;
    email_content?: string;
  };
  operator_id?: string;
}

// 有效的申请状态
const VALID_STATUSES = ['pending', 'reviewing', 'interview', 'hired', 'rejected', 'archived'];

// POST /api/hr/applications/batch - 批量操作申请
export async function POST(request: NextRequest) {
  try {
    const body: BatchOperation = await request.json();
    const { action, application_ids, data, operator_id } = body;

    // 验证必要参数
    if (!action || !application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的请求参数' },
        { status: 400 }
      );
    }

    // 验证申请ID是否存在
    const validApplicationIds = application_ids.filter(id => mockApplications.has(id));
    if (validApplicationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到有效的申请记录' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // 根据操作类型执行批量操作
    switch (action) {
      case 'update_status':
        if (!data?.status || !VALID_STATUSES.includes(data.status)) {
          return NextResponse.json(
            { success: false, error: '无效的状态值' },
            { status: 400 }
          );
        }

        for (const id of validApplicationIds) {
          try {
            const application = mockApplications.get(id)!;
            const oldStatus = application.status;
            application.status = data.status;
            application.updated_at = new Date().toISOString();
            
            // 添加状态变更记录
            if (!application.status_history) {
              application.status_history = [];
            }
            application.status_history.push({
              from_status: oldStatus,
              to_status: data.status,
              changed_at: new Date().toISOString(),
              changed_by: operator_id || 'system',
              note: data.note || ''
            });

            mockApplications.set(id, application);
            results.push({
              id,
              success: true,
              old_status: oldStatus,
              new_status: data.status
            });

            console.log(`✅ 申请 ${id} 状态更新: ${oldStatus} -> ${data.status}`);
          } catch (error) {
            errors.push({ id, error: '状态更新失败' });
          }
        }
        break;

      case 'add_note':
        if (!data?.note) {
          return NextResponse.json(
            { success: false, error: '备注内容不能为空' },
            { status: 400 }
          );
        }

        for (const id of validApplicationIds) {
          try {
            const application = mockApplications.get(id)!;
            if (!application.notes_history) {
              application.notes_history = [];
            }
            application.notes_history.push({
              content: data.note,
              created_at: new Date().toISOString(),
              created_by: operator_id || 'system'
            });
            application.updated_at = new Date().toISOString();

            mockApplications.set(id, application);
            results.push({ id, success: true });

            console.log(`✅ 申请 ${id} 添加备注成功`);
          } catch (error) {
            errors.push({ id, error: '添加备注失败' });
          }
        }
        break;

      case 'add_tags':
        if (!data?.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
          return NextResponse.json(
            { success: false, error: '标签数据无效' },
            { status: 400 }
          );
        }

        for (const id of validApplicationIds) {
          try {
            const application = mockApplications.get(id)!;
            if (!application.tags) {
              application.tags = [];
            }
            // 合并标签，去重
            application.tags = [...new Set([...application.tags, ...data.tags])];
            application.updated_at = new Date().toISOString();

            mockApplications.set(id, application);
            results.push({ id, success: true, tags: application.tags });

            console.log(`✅ 申请 ${id} 添加标签成功: ${data.tags.join(', ')}`);
          } catch (error) {
            errors.push({ id, error: '添加标签失败' });
          }
        }
        break;

      case 'send_email':
        if (!data?.email_subject || !data?.email_content) {
          return NextResponse.json(
            { success: false, error: '邮件主题和内容不能为空' },
            { status: 400 }
          );
        }

        for (const id of validApplicationIds) {
          try {
            const application = mockApplications.get(id)!;
            
            // 模拟邮件发送（实际项目中应该调用邮件服务）
            console.log(`📧 发送邮件给 ${application.candidate_email}:`, {
              subject: data.email_subject,
              content: data.email_content,
              candidate: application.candidate_name,
              job: application.job_title
            });

            // 记录邮件发送历史
            if (!application.email_history) {
              application.email_history = [];
            }
            application.email_history.push({
              subject: data.email_subject,
              content: data.email_content,
              sent_at: new Date().toISOString(),
              sent_by: operator_id || 'system',
              recipient: application.candidate_email
            });

            mockApplications.set(id, application);
            results.push({ 
              id, 
              success: true, 
              email_sent_to: application.candidate_email 
            });

          } catch (error) {
            errors.push({ id, error: '邮件发送失败' });
          }
        }
        break;

      case 'archive':
        for (const id of validApplicationIds) {
          try {
            const application = mockApplications.get(id)!;
            application.status = 'archived';
            application.archived_at = new Date().toISOString();
            application.archived_by = operator_id || 'system';
            application.updated_at = new Date().toISOString();

            mockApplications.set(id, application);
            results.push({ id, success: true });

            console.log(`📦 申请 ${id} 已归档`);
          } catch (error) {
            errors.push({ id, error: '归档失败' });
          }
        }
        break;

      case 'delete':
        for (const id of validApplicationIds) {
          try {
            mockApplications.delete(id);
            results.push({ id, success: true });

            console.log(`🗑️ 申请 ${id} 已删除`);
          } catch (error) {
            errors.push({ id, error: '删除失败' });
          }
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作类型' },
          { status: 400 }
        );
    }

    // 返回批量操作结果
    return NextResponse.json({
      success: true,
      data: {
        action,
        total_requested: application_ids.length,
        total_processed: results.length,
        total_errors: errors.length,
        results,
        errors
      },
      message: `批量${action}操作完成，成功处理 ${results.length} 条记录${errors.length > 0 ? `，失败 ${errors.length} 条` : ''}`
    });

  } catch (error) {
    console.error('批量操作错误:', error);
    return NextResponse.json(
      { success: false, error: '批量操作失败' },
      { status: 500 }
    );
  }
}

// GET /api/hr/applications/batch - 获取批量操作历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 模拟批量操作历史数据
    const mockBatchHistory = [
      {
        id: 'batch_1',
        action: 'update_status',
        operator_id: 'hr_001',
        operator_name: '张HR',
        total_processed: 5,
        total_errors: 0,
        created_at: '2025-01-27T10:30:00Z',
        details: '批量更新申请状态为reviewing'
      },
      {
        id: 'batch_2',
        action: 'send_email',
        operator_id: 'hr_002',
        operator_name: '李HR',
        total_processed: 3,
        total_errors: 1,
        created_at: '2025-01-27T09:15:00Z',
        details: '批量发送面试邀请邮件'
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = mockBatchHistory.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        history: paginatedHistory,
        pagination: {
          page,
          limit,
          total: mockBatchHistory.length,
          total_pages: Math.ceil(mockBatchHistory.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取批量操作历史错误:', error);
    return NextResponse.json(
      { success: false, error: '获取批量操作历史失败' },
      { status: 500 }
    );
  }
}
