/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/export.ts
 * @Description: 数据导出工具函数
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

// 导出格式类型
export type ExportFormat = 'csv' | 'excel' | 'json';

// 导出配置接口
export interface ExportConfig {
  format: ExportFormat;
  filename?: string;
  fields?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

// 申请数据导出字段映射
export const APPLICATION_EXPORT_FIELDS = {
  id: '申请ID',
  candidate_name: '候选人姓名',
  candidate_email: '邮箱',
  candidate_phone: '电话',
  job_title: '申请职位',
  department: '部门',
  status: '申请状态',
  rating: '评分',
  applied_at: '申请时间',
  reviewed_at: '审核时间',
  interview_date: '面试时间',
  notes: '备注',
  tags: '标签',
  source: '来源渠道'
};

// 候选人数据导出字段映射
export const CANDIDATE_EXPORT_FIELDS = {
  id: '候选人ID',
  name: '姓名',
  email: '邮箱',
  phone: '电话',
  location: '所在地',
  experience: '工作经验',
  education: '学历',
  skills: '技能',
  rating: '评分',
  status: '状态',
  salary_expectation: '期望薪资',
  last_contact: '最后联系时间',
  source: '来源',
  created_at: '创建时间'
};

// 状态中文映射
export const STATUS_MAPPING = {
  pending: '待审核',
  reviewing: '审核中',
  interview: '面试中',
  hired: '已录用',
  rejected: '已拒绝',
  archived: '已归档',
  active: '活跃',
  inactive: '非活跃'
};

/**
 * 将数据转换为CSV格式
 */
export function convertToCSV(data: any[], fields: Record<string, string>): string {
  if (!data || data.length === 0) {
    return '';
  }

  // 创建表头
  const headers = Object.values(fields);
  const csvHeaders = headers.join(',');

  // 转换数据行
  const csvRows = data.map(item => {
    return Object.keys(fields).map(key => {
      let value = item[key];
      
      // 处理特殊值
      if (value === null || value === undefined) {
        value = '';
      } else if (Array.isArray(value)) {
        value = value.join('; ');
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      
      // 状态翻译
      if (key === 'status' && STATUS_MAPPING[value as keyof typeof STATUS_MAPPING]) {
        value = STATUS_MAPPING[value as keyof typeof STATUS_MAPPING];
      }
      
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * 将数据转换为Excel格式（简化版，实际项目中可使用xlsx库）
 */
export function convertToExcel(data: any[], fields: Record<string, string>): string {
  // 这里返回CSV格式，实际项目中应该使用xlsx库生成真正的Excel文件
  return convertToCSV(data, fields);
}

/**
 * 将数据转换为JSON格式
 */
export function convertToJSON(data: any[], fields: Record<string, string>): string {
  if (!data || data.length === 0) {
    return JSON.stringify([]);
  }

  const processedData = data.map(item => {
    const processedItem: any = {};
    
    Object.keys(fields).forEach(key => {
      let value = item[key];
      
      // 处理特殊值
      if (value === null || value === undefined) {
        value = null;
      } else if (key === 'status' && STATUS_MAPPING[value as keyof typeof STATUS_MAPPING]) {
        value = STATUS_MAPPING[value as keyof typeof STATUS_MAPPING];
      }
      
      processedItem[fields[key]] = value;
    });
    
    return processedItem;
  });

  return JSON.stringify(processedData, null, 2);
}

/**
 * 根据配置导出数据
 */
export function exportData(data: any[], config: ExportConfig): string {
  const { format, fields } = config;
  
  // 确定要导出的字段
  let exportFields: Record<string, string>;
  if (fields && fields.length > 0) {
    // 使用自定义字段
    exportFields = {};
    fields.forEach(field => {
      if (APPLICATION_EXPORT_FIELDS[field as keyof typeof APPLICATION_EXPORT_FIELDS]) {
        exportFields[field] = APPLICATION_EXPORT_FIELDS[field as keyof typeof APPLICATION_EXPORT_FIELDS];
      } else if (CANDIDATE_EXPORT_FIELDS[field as keyof typeof CANDIDATE_EXPORT_FIELDS]) {
        exportFields[field] = CANDIDATE_EXPORT_FIELDS[field as keyof typeof CANDIDATE_EXPORT_FIELDS];
      }
    });
  } else {
    // 使用默认字段（申请数据）
    exportFields = APPLICATION_EXPORT_FIELDS;
  }

  // 根据格式转换数据
  switch (format) {
    case 'csv':
      return convertToCSV(data, exportFields);
    case 'excel':
      return convertToExcel(data, exportFields);
    case 'json':
      return convertToJSON(data, exportFields);
    default:
      throw new Error(`不支持的导出格式: ${format}`);
  }
}

/**
 * 生成导出文件名
 */
export function generateExportFilename(type: string, format: ExportFormat, customName?: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (customName) {
    return `${customName}_${timestamp}.${format}`;
  }
  
  const typeNames = {
    applications: '申请数据',
    candidates: '候选人数据',
    reports: '招聘报告'
  };
  
  const typeName = typeNames[type as keyof typeof typeNames] || type;
  return `${typeName}_${timestamp}.${format}`;
}

/**
 * 创建下载链接
 */
export function createDownloadLink(content: string, filename: string, mimeType: string): string {
  const blob = new Blob([content], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * 触发文件下载
 */
export function downloadFile(content: string, filename: string, format: ExportFormat): void {
  const mimeTypes = {
    csv: 'text/csv;charset=utf-8;',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    json: 'application/json;charset=utf-8;'
  };
  
  const mimeType = mimeTypes[format];
  const url = createDownloadLink(content, filename, mimeType);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理URL对象
  URL.revokeObjectURL(url);
}

/**
 * 过滤数据（根据日期范围和其他条件）
 */
export function filterDataForExport(data: any[], config: ExportConfig): any[] {
  let filteredData = [...data];
  
  // 日期范围过滤
  if (config.dateRange) {
    const { start, end } = config.dateRange;
    filteredData = filteredData.filter(item => {
      const itemDate = item.applied_at || item.created_at;
      if (!itemDate) return true;
      
      const date = new Date(itemDate);
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      return date >= startDate && date <= endDate;
    });
  }
  
  // 其他过滤条件
  if (config.filters) {
    Object.keys(config.filters).forEach(key => {
      const filterValue = config.filters![key];
      if (filterValue && filterValue !== 'all') {
        filteredData = filteredData.filter(item => {
          if (Array.isArray(item[key])) {
            return item[key].includes(filterValue);
          }
          return item[key] === filterValue;
        });
      }
    });
  }
  
  return filteredData;
}

/**
 * 获取导出统计信息
 */
export function getExportStats(data: any[]): Record<string, number> {
  const stats: Record<string, number> = {
    total: data.length
  };
  
  // 按状态统计
  data.forEach(item => {
    const status = item.status || 'unknown';
    stats[`status_${status}`] = (stats[`status_${status}`] || 0) + 1;
  });
  
  return stats;
}
