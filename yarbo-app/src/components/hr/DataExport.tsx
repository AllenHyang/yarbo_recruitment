/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/hr/DataExport.tsx
 * @Description: HR数据导出组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database,
  Calendar,
  Filter
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

// 导出格式
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

// 导出数据类型
export type ExportDataType = 'candidates' | 'applications' | 'interviews' | 'jobs' | 'analytics';

// 导出字段配置
interface ExportField {
  key: string;
  label: string;
  required?: boolean;
  category?: string;
}

// 导出配置
interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
  fields: string[];
  dateRange?: DateRange;
  filters?: Record<string, any>;
}

interface DataExportProps {
  dataType: ExportDataType;
  availableFields: ExportField[];
  onExport: (config: ExportConfig) => Promise<void>;
  isExporting?: boolean;
  className?: string;
}

const FORMAT_ICONS = {
  csv: FileText,
  excel: FileSpreadsheet,
  pdf: FileText,
  json: Database
};

const FORMAT_LABELS = {
  csv: 'CSV 文件',
  excel: 'Excel 文件',
  pdf: 'PDF 文件',
  json: 'JSON 文件'
};

export function DataExport({
  dataType,
  availableFields,
  onExport,
  isExporting = false,
  className
}: DataExportProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.filter(field => field.required).map(field => field.key)
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // 按类别分组字段
  const fieldsByCategory = availableFields.reduce((acc, field) => {
    const category = field.category || '基本信息';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    if (checked) {
      setSelectedFields(prev => [...prev, fieldKey]);
    } else {
      // 不允许取消必需字段
      const field = availableFields.find(f => f.key === fieldKey);
      if (field?.required) return;
      
      setSelectedFields(prev => prev.filter(key => key !== fieldKey));
    }
  };

  const handleSelectAll = (category?: string) => {
    const fieldsToSelect = category 
      ? fieldsByCategory[category] 
      : availableFields;
    
    const newFields = fieldsToSelect.map(field => field.key);
    setSelectedFields(prev => {
      const otherFields = category 
        ? prev.filter(key => !fieldsByCategory[category].some(f => f.key === key))
        : [];
      return [...otherFields, ...newFields];
    });
  };

  const handleDeselectAll = (category?: string) => {
    if (category) {
      const categoryFieldKeys = fieldsByCategory[category].map(f => f.key);
      setSelectedFields(prev => 
        prev.filter(key => !categoryFieldKeys.includes(key) || 
          availableFields.find(f => f.key === key)?.required
        )
      );
    } else {
      setSelectedFields(availableFields.filter(f => f.required).map(f => f.key));
    }
  };

  const handleExport = async () => {
    const config: ExportConfig = {
      dataType,
      format,
      fields: selectedFields,
      dateRange,
    };

    await onExport(config);
  };

  const isFieldSelected = (fieldKey: string) => selectedFields.includes(fieldKey);
  const isFieldRequired = (fieldKey: string) => 
    availableFields.find(f => f.key === fieldKey)?.required || false;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>数据导出</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 导出格式选择 */}
        <div className="space-y-2">
          <Label>导出格式</Label>
          <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FORMAT_LABELS).map(([key, label]) => {
                const Icon = FORMAT_ICONS[key as ExportFormat];
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 日期范围选择 */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>日期范围（可选）</span>
          </Label>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
            placeholder="选择日期范围"
          />
        </div>

        {/* 字段选择 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>选择导出字段</span>
            </Label>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll()}
              >
                全选
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeselectAll()}
              >
                清除
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto">
            {Object.entries(fieldsByCategory).map(([category, fields]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                  <div className="space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectAll(category)}
                      className="h-6 px-2 text-xs"
                    >
                      全选
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeselectAll(category)}
                      className="h-6 px-2 text-xs"
                    >
                      清除
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 pl-4">
                  {fields.map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.key}
                        checked={isFieldSelected(field.key)}
                        onCheckedChange={(checked) => 
                          handleFieldToggle(field.key, checked as boolean)
                        }
                        disabled={isFieldRequired(field.key)}
                      />
                      <Label 
                        htmlFor={field.key}
                        className={`text-sm ${isFieldRequired(field.key) ? 'font-medium' : ''}`}
                      >
                        {field.label}
                        {isFieldRequired(field.key) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 导出按钮 */}
        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleExport}
            disabled={isExporting || selectedFields.length === 0}
            className="min-w-24"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                导出 ({selectedFields.length} 字段)
              </>
            )}
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 必需字段标有 * 号，无法取消选择</p>
          <p>• 导出的数据将根据您的权限进行过滤</p>
          <p>• 大量数据导出可能需要较长时间，请耐心等待</p>
        </div>
      </CardContent>
    </Card>
  );
}
