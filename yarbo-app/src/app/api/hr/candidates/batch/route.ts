/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/hr/candidates/batch/route.ts
 * @Description: 候选人管理批量操作API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';

// 模拟候选人数据存储（实际项目中应该使用数据库）
const mockCandidates = new Map([
  ['1', {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '+86 138-0013-8001',
    location: '上海',
    experience: '5年',
    education: '本科',
    skills: ['React', 'Vue', 'TypeScript', 'Node.js'],
    rating: 4,
    status: 'active',
    tags: ['前端', '全栈'],
    notes: '',
    salary_expectation: '25-30K',
    last_contact: '2025-01-20',
    source: '官网投递',
    created_at: '2025-01-15T10:00:00Z'
  }],
  ['2', {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '+86 139-0013-8002',
    location: '北京',
    experience: '3年',
    education: '硕士',
    skills: ['Vue', 'React', 'JavaScript', 'CSS'],
    rating: 5,
    status: 'active',
    tags: ['前端', 'UI'],
    notes: '',
    salary_expectation: '20-25K',
    last_contact: '2025-01-19',
    source: 'LinkedIn',
    created_at: '2025-01-14T15:30:00Z'
  }]
]);

// 批量操作类型定义
interface CandidateBatchOperation {
  action: 'update_status' | 'add_tags' | 'remove_tags' | 'update_rating' | 'add_note' | 'move_to_pool' | 'delete';
  candidate_ids: string[];
  data?: {
    status?: string;
    tags?: string[];
    rating?: number;
    note?: string;
    pool_id?: string;
  };
  operator_id?: string;
}

// 有效的候选人状态
const VALID_CANDIDATE_STATUSES = ['active', 'inactive', 'blacklisted', 'hired', 'archived'];

// POST /api/hr/candidates/batch - 批量操作候选人
export async function POST(request: NextRequest) {
  try {
    const body: CandidateBatchOperation = await request.json();
    const { action, candidate_ids, data, operator_id } = body;

    // 验证必要参数
    if (!action || !candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的请求参数' },
        { status: 400 }
      );
    }

    // 验证候选人ID是否存在
    const validCandidateIds = candidate_ids.filter(id => mockCandidates.has(id));
    if (validCandidateIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有找到有效的候选人记录' },
        { status: 404 }
      );
    }

    const results = [];
    const errors = [];

    // 根据操作类型执行批量操作
    switch (action) {
      case 'update_status':
        if (!data?.status || !VALID_CANDIDATE_STATUSES.includes(data.status)) {
          return NextResponse.json(
            { success: false, error: '无效的状态值' },
            { status: 400 }
          );
        }

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            const oldStatus = candidate.status;
            candidate.status = data.status;
            candidate.updated_at = new Date().toISOString();
            
            // 添加状态变更记录
            if (!candidate.status_history) {
              candidate.status_history = [];
            }
            candidate.status_history.push({
              from_status: oldStatus,
              to_status: data.status,
              changed_at: new Date().toISOString(),
              changed_by: operator_id || 'system'
            });

            mockCandidates.set(id, candidate);
            results.push({
              id,
              success: true,
              old_status: oldStatus,
              new_status: data.status
            });

            console.log(`✅ 候选人 ${id} 状态更新: ${oldStatus} -> ${data.status}`);
          } catch (error) {
            errors.push({ id, error: '状态更新失败' });
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

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            if (!candidate.tags) {
              candidate.tags = [];
            }
            // 合并标签，去重
            candidate.tags = [...new Set([...candidate.tags, ...data.tags])];
            candidate.updated_at = new Date().toISOString();

            mockCandidates.set(id, candidate);
            results.push({ id, success: true, tags: candidate.tags });

            console.log(`✅ 候选人 ${id} 添加标签成功: ${data.tags.join(', ')}`);
          } catch (error) {
            errors.push({ id, error: '添加标签失败' });
          }
        }
        break;

      case 'remove_tags':
        if (!data?.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
          return NextResponse.json(
            { success: false, error: '标签数据无效' },
            { status: 400 }
          );
        }

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            if (candidate.tags) {
              candidate.tags = candidate.tags.filter(tag => !data.tags!.includes(tag));
            }
            candidate.updated_at = new Date().toISOString();

            mockCandidates.set(id, candidate);
            results.push({ id, success: true, tags: candidate.tags });

            console.log(`✅ 候选人 ${id} 移除标签成功: ${data.tags.join(', ')}`);
          } catch (error) {
            errors.push({ id, error: '移除标签失败' });
          }
        }
        break;

      case 'update_rating':
        if (!data?.rating || data.rating < 1 || data.rating > 5) {
          return NextResponse.json(
            { success: false, error: '评分必须在1-5之间' },
            { status: 400 }
          );
        }

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            const oldRating = candidate.rating;
            candidate.rating = data.rating;
            candidate.updated_at = new Date().toISOString();

            // 添加评分变更记录
            if (!candidate.rating_history) {
              candidate.rating_history = [];
            }
            candidate.rating_history.push({
              from_rating: oldRating,
              to_rating: data.rating,
              changed_at: new Date().toISOString(),
              changed_by: operator_id || 'system'
            });

            mockCandidates.set(id, candidate);
            results.push({
              id,
              success: true,
              old_rating: oldRating,
              new_rating: data.rating
            });

            console.log(`✅ 候选人 ${id} 评分更新: ${oldRating} -> ${data.rating}`);
          } catch (error) {
            errors.push({ id, error: '评分更新失败' });
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

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            if (!candidate.notes_history) {
              candidate.notes_history = [];
            }
            candidate.notes_history.push({
              content: data.note,
              created_at: new Date().toISOString(),
              created_by: operator_id || 'system'
            });
            candidate.updated_at = new Date().toISOString();

            mockCandidates.set(id, candidate);
            results.push({ id, success: true });

            console.log(`✅ 候选人 ${id} 添加备注成功`);
          } catch (error) {
            errors.push({ id, error: '添加备注失败' });
          }
        }
        break;

      case 'move_to_pool':
        if (!data?.pool_id) {
          return NextResponse.json(
            { success: false, error: '候选人池ID不能为空' },
            { status: 400 }
          );
        }

        for (const id of validCandidateIds) {
          try {
            const candidate = mockCandidates.get(id)!;
            candidate.pool_id = data.pool_id;
            candidate.updated_at = new Date().toISOString();

            // 添加池变更记录
            if (!candidate.pool_history) {
              candidate.pool_history = [];
            }
            candidate.pool_history.push({
              pool_id: data.pool_id,
              moved_at: new Date().toISOString(),
              moved_by: operator_id || 'system'
            });

            mockCandidates.set(id, candidate);
            results.push({ id, success: true, pool_id: data.pool_id });

            console.log(`✅ 候选人 ${id} 移动到候选人池: ${data.pool_id}`);
          } catch (error) {
            errors.push({ id, error: '移动到候选人池失败' });
          }
        }
        break;

      case 'delete':
        for (const id of validCandidateIds) {
          try {
            mockCandidates.delete(id);
            results.push({ id, success: true });

            console.log(`🗑️ 候选人 ${id} 已删除`);
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
        total_requested: candidate_ids.length,
        total_processed: results.length,
        total_errors: errors.length,
        results,
        errors
      },
      message: `批量${action}操作完成，成功处理 ${results.length} 条记录${errors.length > 0 ? `，失败 ${errors.length} 条` : ''}`
    });

  } catch (error) {
    console.error('候选人批量操作错误:', error);
    return NextResponse.json(
      { success: false, error: '候选人批量操作失败' },
      { status: 500 }
    );
  }
}

// GET /api/hr/candidates/batch - 获取批量操作历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 模拟批量操作历史数据
    const mockBatchHistory = [
      {
        id: 'batch_c1',
        action: 'add_tags',
        operator_id: 'hr_001',
        operator_name: '张HR',
        total_processed: 8,
        total_errors: 0,
        created_at: '2025-01-27T11:30:00Z',
        details: '批量添加"前端工程师"标签'
      },
      {
        id: 'batch_c2',
        action: 'update_rating',
        operator_id: 'hr_002',
        operator_name: '李HR',
        total_processed: 5,
        total_errors: 1,
        created_at: '2025-01-27T10:15:00Z',
        details: '批量更新候选人评分'
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
    console.error('获取候选人批量操作历史错误:', error);
    return NextResponse.json(
      { success: false, error: '获取候选人批量操作历史失败' },
      { status: 500 }
    );
  }
}
