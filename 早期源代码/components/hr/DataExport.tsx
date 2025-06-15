/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/hr/DataExport.tsx
 * @Description: 数据导出组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  Table, 
  Code, 
  Calendar,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { downloadFile } from '@/lib/export';

// 导出类型定义
export type ExportType = 'applications' | 'candidates' | 'reports';
export type ExportFormat = 'csv' | 'excel' | 'json';

interface ExportConfig {
  type: ExportType;
  format: ExportFormat;
  fields: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  filename?: string;
}

interface DataExportProps {
  type: ExportType;
  trigger?: React.ReactNode;
  onExportComplete?: (result: any) => void;
}

// 格式选项
const FORMAT_OPTIONS = [
  {
    value: 'csv' as ExportFormat,
    label: 'CSV',
    icon: Table,
    description: '逗号分隔值，适合Excel打开'
  },
  {
    value: 'excel' as ExportFormat,
    label: 'Excel',
    icon: FileText,
    description: 'Excel工作簿格式'
  },
  {
    value: 'json' as ExportFormat,
    label: 'JSON',
    icon: Code,
    description: '结构化数据格式，适合程序处理'
  }
];

export function DataExport({ type, trigger, onExportComplete }: DataExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    type,
    format: 'csv',
    fields: []
  });
  const [availableFields, setAvailableFields] = useState<Record<string, string>>({});
  const [exportStats, setExportStats] = useState<any>(null);

  // 获取可用字段
  useEffect(() => {
    if (isOpen) {
      fetchAvailableFields();
    }
  }, [isOpen, type]);

  const fetchAvailableFields = async () => {
    try {
      const response = await fetch(`/api/hr/export?type=${type}`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableFields(result.data.available_fields);
        setExportStats({
          total_records: result.data.total_records,
          sample_data: result.data.sample_data
        });
        
        // 默认选择所有字段
        setExportConfig(prev => ({
          ...prev,
          fields: Object.keys(result.data.available_fields)
        }));
      }
    } catch (error) {
      console.error('获取导出配置失败:', error);
    }
  };

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      fields: checked 
        ? [...prev.fields, fieldKey]
        : prev.fields.filter(f => f !== fieldKey)
    }));
  };

  const handleSelectAllFields = (checked: boolean) => {
    setExportConfig(prev => ({
      ...prev,
      fields: checked ? Object.keys(availableFields) : []
    }));
  };

  const handleExport = async () => {
    if (exportConfig.fields.length === 0) {
      alert('请至少选择一个导出字段');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/hr/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportConfig)
      });

      const result = await response.json();
      
      if (result.success) {
        // 触发文件下载
        downloadFile(
          result.data.content,
          result.data.filename,
          result.data.format
        );

        console.log('✅ 导出成功:', result.data.stats);
        
        if (onExportComplete) {
          onExportComplete(result);
        }
        
        setIsOpen(false);
      } else {
        throw new Error(result.error || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = () => {
    const labels = {
      applications: '申请数据',
      candidates: '候选人数据',
      reports: '招聘报告'
    };
    return labels[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出{getTypeLabel()}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-600" />
            <span>导出{getTypeLabel()}</span>
          </DialogTitle>
          <DialogDescription>
            选择导出格式、字段和筛选条件，然后下载数据文件。
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="format">格式设置</TabsTrigger>
            <TabsTrigger value="fields">字段选择</TabsTrigger>
            <TabsTrigger value="filters">筛选条件</TabsTrigger>
          </TabsList>

          {/* 格式设置 */}
          <TabsContent value="format" className="space-y-4">
            <div>
              <Label>导出格式</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {FORMAT_OPTIONS.map(option => {
                  const Icon = option.icon;
                  return (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        exportConfig.format === option.value 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setExportConfig(prev => ({ ...prev, format: option.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                          {exportConfig.format === option.value && (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="filename">文件名（可选）</Label>
              <Input
                id="filename"
                placeholder={`${getTypeLabel()}_${new Date().toISOString().split('T')[0]}`}
                value={exportConfig.filename || ''}
                onChange={(e) => setExportConfig(prev => ({ ...prev, filename: e.target.value }))}
              />
            </div>

            {exportStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">数据统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    总记录数：<span className="font-medium">{exportStats.total_records}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 字段选择 */}
          <TabsContent value="fields" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>选择导出字段</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={exportConfig.fields.length === Object.keys(availableFields).length}
                  onCheckedChange={handleSelectAllFields}
                />
                <Label htmlFor="select-all" className="text-sm">全选</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {Object.entries(availableFields).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={exportConfig.fields.includes(key)}
                    onCheckedChange={(checked) => handleFieldToggle(key, checked as boolean)}
                  />
                  <Label htmlFor={key} className="text-sm flex-1">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              已选择 {exportConfig.fields.length} / {Object.keys(availableFields).length} 个字段
            </div>
          </TabsContent>

          {/* 筛选条件 */}
          <TabsContent value="filters" className="space-y-4">
            <div>
              <Label>日期范围</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label htmlFor="start-date" className="text-xs">开始日期</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={exportConfig.dateRange?.start || ''}
                    onChange={(e) => setExportConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: e.target.value,
                        end: prev.dateRange?.end || ''
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date" className="text-xs">结束日期</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={exportConfig.dateRange?.end || ''}
                    onChange={(e) => setExportConfig(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: prev.dateRange?.start || '',
                        end: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>
            </div>

            {type === 'applications' && (
              <div>
                <Label>申请状态</Label>
                <Select 
                  value={exportConfig.filters?.status || 'all'}
                  onValueChange={(value) => setExportConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: value === 'all' ? undefined : value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="reviewing">审核中</SelectItem>
                    <SelectItem value="interview">面试中</SelectItem>
                    <SelectItem value="hired">已录用</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">筛选提示</p>
                    <p>设置筛选条件可以减少导出的数据量，提高导出速度。</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading || exportConfig.fields.length === 0}
          >
            {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            导出数据
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
