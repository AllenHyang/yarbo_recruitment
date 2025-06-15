/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/hr/BulkActionToolbar.tsx
 * @Description: HR批量操作工具栏组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Mail, 
  UserCheck, 
  UserX, 
  Archive, 
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionToolbarProps {
  selectedCount: number;
  onExport?: () => void;
  onSendEmail?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onClearSelection?: () => void;
  disabled?: boolean;
}

export function BulkActionToolbar({
  selectedCount,
  onExport,
  onSendEmail,
  onApprove,
  onReject,
  onArchive,
  onDelete,
  onClearSelection,
  disabled = false
}: BulkActionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-blue-900">
          已选择 {selectedCount} 项
        </span>
        
        <div className="flex items-center space-x-2">
          {/* 导出按钮 */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={disabled}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          )}

          {/* 发送邮件按钮 */}
          {onSendEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendEmail}
              disabled={disabled}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </Button>
          )}

          {/* 批准按钮 */}
          {onApprove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onApprove}
              disabled={disabled}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              批准
            </Button>
          )}

          {/* 拒绝按钮 */}
          {onReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReject}
              disabled={disabled}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              <UserX className="w-4 h-4 mr-2" />
              拒绝
            </Button>
          )}

          {/* 更多操作下拉菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="w-4 h-4 mr-2" />
                  归档
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 清除选择按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={disabled}
        className="text-blue-700 hover:bg-blue-100"
      >
        清除选择
      </Button>
    </div>
  );
}

// 使用示例的接口
export interface BulkActionConfig {
  showExport?: boolean;
  showEmail?: boolean;
  showApprove?: boolean;
  showReject?: boolean;
  showArchive?: boolean;
  showDelete?: boolean;
}

// 预设配置
export const BULK_ACTION_CONFIGS = {
  candidates: {
    showExport: true,
    showEmail: true,
    showApprove: true,
    showReject: true,
    showArchive: true,
    showDelete: false
  },
  applications: {
    showExport: true,
    showEmail: true,
    showApprove: true,
    showReject: true,
    showArchive: true,
    showDelete: true
  },
  interviews: {
    showExport: true,
    showEmail: true,
    showApprove: false,
    showReject: false,
    showArchive: true,
    showDelete: false
  }
} as const;

// 带配置的工具栏组件
interface ConfigurableBulkActionToolbarProps extends Omit<BulkActionToolbarProps, 'onExport' | 'onSendEmail' | 'onApprove' | 'onReject' | 'onArchive' | 'onDelete'> {
  config: BulkActionConfig;
  onAction: (action: string) => void;
}

export function ConfigurableBulkActionToolbar({
  config,
  onAction,
  ...props
}: ConfigurableBulkActionToolbarProps) {
  return (
    <BulkActionToolbar
      {...props}
      onExport={config.showExport ? () => onAction('export') : undefined}
      onSendEmail={config.showEmail ? () => onAction('email') : undefined}
      onApprove={config.showApprove ? () => onAction('approve') : undefined}
      onReject={config.showReject ? () => onAction('reject') : undefined}
      onArchive={config.showArchive ? () => onAction('archive') : undefined}
      onDelete={config.showDelete ? () => onAction('delete') : undefined}
    />
  );
}
