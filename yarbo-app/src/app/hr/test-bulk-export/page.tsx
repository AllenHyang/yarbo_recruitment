/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/hr/test-bulk-export/page.tsx
 * @Description: 批量操作和数据导出功能测试页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulkActionToolbar } from "@/components/hr/BulkActionToolbar";
import { DataExport } from "@/components/hr/DataExport";
import {
  CheckSquare,
  Download,
  FileText,
  Users,
  TestTube
} from "lucide-react";

export default function TestBulkExportPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 模拟数据
  const mockItems = [
    { id: '1', name: '张三申请', type: 'application' },
    { id: '2', name: '李四申请', type: 'application' },
    { id: '3', name: '王五候选人', type: 'candidate' },
    { id: '4', name: '赵六候选人', type: 'candidate' },
  ];

  const handleBulkAction = async (action: string, data?: any) => {
    setIsLoading(true);
    console.log('🧪 测试批量操作:', { action, selectedItems, data });

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`批量操作 "${action}" 执行成功！\n选中项目: ${selectedItems.length} 个`);
      setSelectedItems([]);
    } catch (error) {
      alert('批量操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportComplete = (result: any) => {
    console.log('🧪 导出完成:', result);
    alert(`导出成功！\n文件名: ${result.data.filename}\n记录数: ${result.data.stats.total_records}`);
  };

  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(mockItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
                <TestTube className="w-8 h-8 text-blue-600" />
                <span>批量操作 & 数据导出测试</span>
              </h1>
              <p className="text-gray-600 mt-1">测试HR系统的批量操作和数据导出功能</p>
            </div>
          </div>

          {/* 功能测试区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 数据导出测试 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span>数据导出测试</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <DataExport
                    dataType="applications"
                    availableFields={[
                      { key: 'name', label: '申请人姓名', required: true },
                      { key: 'position', label: '申请职位', required: true },
                      { key: 'status', label: '申请状态', required: false },
                      { key: 'date', label: '申请日期', required: false }
                    ]}
                    onExport={async (config) => {
                      console.log('导出申请数据:', config);
                      handleExportComplete({ data: { filename: 'applications.xlsx', stats: { total_records: 10 } } });
                    }}
                  />

                  <div className="mt-4">
                    <DataExport
                      dataType="candidates"
                      availableFields={[
                        { key: 'name', label: '候选人姓名', required: true },
                        { key: 'email', label: '邮箱', required: true },
                        { key: 'phone', label: '电话', required: false },
                        { key: 'skills', label: '技能', required: false }
                      ]}
                      onExport={async (config) => {
                        console.log('导出候选人数据:', config);
                        handleExportComplete({ data: { filename: 'candidates.xlsx', stats: { total_records: 25 } } });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 批量操作控制 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  <span>批量操作控制</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button onClick={selectAll} size="sm">
                    全选
                  </Button>
                  <Button onClick={clearSelection} variant="outline" size="sm">
                    清空
                  </Button>
                </div>

                <div className="text-sm text-gray-600">
                  已选择: {selectedItems.length} / {mockItems.length} 项
                </div>

                {selectedItems.length > 0 && (
                  <div className="space-y-2">
                    <Badge variant="secondary">
                      选中项目: {selectedItems.join(', ')}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 批量操作工具栏 */}
          <BulkActionToolbar
            selectedCount={selectedItems.length}
            onClearSelection={clearSelection}
            onExport={() => handleBulkAction('export')}
            onSendEmail={() => handleBulkAction('email')}
            onApprove={() => handleBulkAction('approve')}
            onReject={() => handleBulkAction('reject')}
            onArchive={() => handleBulkAction('archive')}
            onDelete={() => handleBulkAction('delete')}
            disabled={isLoading}
          />

          {/* 模拟数据列表 */}
          <Card>
            <CardHeader>
              <CardTitle>测试数据列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedItems.includes(item.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
                      }`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="rounded"
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">ID: {item.id}</div>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {item.type === 'application' ? '申请' : '候选人'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 测试说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>测试说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• <strong>数据导出测试</strong>：点击导出按钮测试不同类型的数据导出功能</p>
                <p>• <strong>批量操作测试</strong>：选择项目后使用批量操作工具栏测试各种批量操作</p>
                <p>• <strong>支持的操作</strong>：状态更新、邮件发送、标签管理、备注添加、归档删除等</p>
                <p>• <strong>导出格式</strong>：支持CSV、Excel、JSON三种格式</p>
                <p>• <strong>自定义字段</strong>：可以选择需要导出的字段和筛选条件</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
