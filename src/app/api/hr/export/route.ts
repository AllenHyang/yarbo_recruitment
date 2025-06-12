/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/api/hr/export/route.ts
 * @Description: HR数据导出API端点
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  exportData, 
  filterDataForExport, 
  generateExportFilename, 
  getExportStats,
  ExportConfig,
  APPLICATION_EXPORT_FIELDS,
  CANDIDATE_EXPORT_FIELDS
} from '@/lib/export';

// 模拟申请数据
const mockApplicationsData = [
  {
    id: '1',
    candidate_name: '张三',
    candidate_email: 'zhangsan@example.com',
    candidate_phone: '+86 138-0013-8001',
    job_title: '资深全栈工程师',
    department: '技术部',
    status: 'pending',
    rating: 4,
    applied_at: '2025-01-20T10:30:00Z',
    reviewed_at: null,
    interview_date: null,
    notes: '技术背景扎实，有丰富的项目经验',
    tags: ['React', 'Node.js', '全栈'],
    source: '官网投递'
  },
  {
    id: '2',
    candidate_name: '李四',
    candidate_email: 'lisi@example.com',
    candidate_phone: '+86 139-0013-8002',
    job_title: '前端工程师',
    department: '技术部',
    status: 'reviewing',
    rating: 5,
    applied_at: '2025-01-19T14:20:00Z',
    reviewed_at: '2025-01-20T09:15:00Z',
    interview_date: null,
    notes: '前端技能优秀，设计感强',
    tags: ['Vue', 'React', 'UI/UX'],
    source: 'LinkedIn'
  },
  {
    id: '3',
    candidate_name: '王五',
    candidate_email: 'wangwu@example.com',
    candidate_phone: '+86 137-0013-8003',
    job_title: 'UI设计师',
    department: '设计部',
    status: 'interview',
    rating: 3,
    applied_at: '2025-01-18T16:45:00Z',
    reviewed_at: '2025-01-19T11:30:00Z',
    interview_date: '2025-01-25T14:00:00Z',
    notes: '设计作品质量不错，需要进一步了解',
    tags: ['Figma', 'Sketch', '用户体验'],
    source: '猎头推荐'
  }
];

// 模拟候选人数据
const mockCandidatesData = [
  {
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
    salary_expectation: '25-30K',
    last_contact: '2025-01-20',
    source: '官网投递',
    created_at: '2025-01-15T10:00:00Z'
  },
  {
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
    salary_expectation: '20-25K',
    last_contact: '2025-01-19',
    source: 'LinkedIn',
    created_at: '2025-01-14T15:30:00Z'
  }
];

// POST /api/hr/export - 导出数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      format = 'csv', 
      fields, 
      dateRange, 
      filters, 
      filename 
    }: {
      type: 'applications' | 'candidates' | 'reports';
      format?: 'csv' | 'excel' | 'json';
      fields?: string[];
      dateRange?: { start: string; end: string };
      filters?: Record<string, any>;
      filename?: string;
    } = body;

    // 验证必要参数
    if (!type) {
      return NextResponse.json(
        { success: false, error: '缺少导出类型参数' },
        { status: 400 }
      );
    }

    // 验证导出类型
    if (!['applications', 'candidates', 'reports'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '不支持的导出类型' },
        { status: 400 }
      );
    }

    // 验证导出格式
    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json(
        { success: false, error: '不支持的导出格式' },
        { status: 400 }
      );
    }

    let rawData: any[] = [];
    let availableFields: Record<string, string> = {};

    // 根据类型获取数据
    switch (type) {
      case 'applications':
        rawData = mockApplicationsData;
        availableFields = APPLICATION_EXPORT_FIELDS;
        break;
      case 'candidates':
        rawData = mockCandidatesData;
        availableFields = CANDIDATE_EXPORT_FIELDS;
        break;
      case 'reports':
        // 生成报告数据
        rawData = generateReportData();
        availableFields = {
          date: '日期',
          total_applications: '总申请数',
          new_applications: '新申请数',
          interviews_scheduled: '安排面试数',
          offers_made: '发出offer数',
          hires_completed: '完成录用数'
        };
        break;
    }

    // 创建导出配置
    const exportConfig: ExportConfig = {
      format,
      fields,
      dateRange,
      filters,
      filename
    };

    // 过滤数据
    const filteredData = filterDataForExport(rawData, exportConfig);

    if (filteredData.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有符合条件的数据可导出' },
        { status: 404 }
      );
    }

    // 导出数据
    const exportContent = exportData(filteredData, exportConfig);
    const exportFilename = generateExportFilename(type, format, filename);
    const stats = getExportStats(filteredData);

    console.log(`📊 数据导出完成:`, {
      type,
      format,
      filename: exportFilename,
      recordCount: filteredData.length,
      stats
    });

    // 返回导出结果
    return NextResponse.json({
      success: true,
      data: {
        content: exportContent,
        filename: exportFilename,
        format,
        stats: {
          total_records: filteredData.length,
          export_time: new Date().toISOString(),
          ...stats
        }
      },
      message: `成功导出 ${filteredData.length} 条${type === 'applications' ? '申请' : type === 'candidates' ? '候选人' : '报告'}数据`
    });

  } catch (error) {
    console.error('数据导出错误:', error);
    return NextResponse.json(
      { success: false, error: '数据导出失败' },
      { status: 500 }
    );
  }
}

// GET /api/hr/export - 获取导出配置信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let availableFields: Record<string, string> = {};
    let sampleData: any = {};

    switch (type) {
      case 'applications':
        availableFields = APPLICATION_EXPORT_FIELDS;
        sampleData = mockApplicationsData[0] || {};
        break;
      case 'candidates':
        availableFields = CANDIDATE_EXPORT_FIELDS;
        sampleData = mockCandidatesData[0] || {};
        break;
      case 'reports':
        availableFields = {
          date: '日期',
          total_applications: '总申请数',
          new_applications: '新申请数',
          interviews_scheduled: '安排面试数',
          offers_made: '发出offer数',
          hires_completed: '完成录用数'
        };
        sampleData = generateReportData()[0] || {};
        break;
      default:
        availableFields = APPLICATION_EXPORT_FIELDS;
        sampleData = mockApplicationsData[0] || {};
    }

    return NextResponse.json({
      success: true,
      data: {
        available_fields: availableFields,
        supported_formats: ['csv', 'excel', 'json'],
        sample_data: sampleData,
        total_records: type === 'applications' ? mockApplicationsData.length : 
                      type === 'candidates' ? mockCandidatesData.length : 
                      generateReportData().length
      }
    });

  } catch (error) {
    console.error('获取导出配置错误:', error);
    return NextResponse.json(
      { success: false, error: '获取导出配置失败' },
      { status: 500 }
    );
  }
}

/**
 * 生成报告数据
 */
function generateReportData() {
  const reportData = [];
  const today = new Date();
  
  // 生成过去30天的报告数据
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    reportData.push({
      date: date.toISOString().split('T')[0],
      total_applications: Math.floor(Math.random() * 20) + 10,
      new_applications: Math.floor(Math.random() * 8) + 2,
      interviews_scheduled: Math.floor(Math.random() * 5) + 1,
      offers_made: Math.floor(Math.random() * 3) + 1,
      hires_completed: Math.floor(Math.random() * 2)
    });
  }
  
  return reportData;
}
