/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/hr/BulkActionToolbar.tsx
 * @Description: 批量操作工具栏组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckSquare, 
  Mail, 
  Tag, 
  FileText, 
  Archive, 
  Trash2, 
  RefreshCw,
  X,
  AlertTriangle
} from "lucide-react";

// 批量操作类型定义
export interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  requiresInput?: boolean;
}

// 批量操作配置
export const BULK_ACTIONS: Record<string, BulkAction> = {
  update_status: {
    id: 'update_status',
    label: '更新状态',
    icon: CheckSquare,
    color: 'text-blue-600',
    description: '批量更新申请状态',
    requiresInput: true
  },
  send_email: {
    id: 'send_email',
    label: '发送邮件',
    icon: Mail,
    color: 'text-green-600',
    description: '批量发送邮件通知',
    requiresInput: true
  },
  add_tags: {
    id: 'add_tags',
    label: '添加标签',
    icon: Tag,
    color: 'text-purple-600',
    description: '批量添加标签',
    requiresInput: true
  },
  add_note: {
    id: 'add_note',
    label: '添加备注',
    icon: FileText,
    color: 'text-orange-600',
    description: '批量添加备注',
    requiresInput: true
  },
  archive: {
    id: 'archive',
    label: '归档',
    icon: Archive,
    color: 'text-gray-600',
    description: '批量归档记录'
  },
  delete: {
    id: 'delete',
    label: '删除',
    icon: Trash2,
    color: 'text-red-600',
    description: '批量删除记录'
  }
};

// 状态选项
export const STATUS_OPTIONS = [
  { value: 'pending', label: '待审核' },
  { value: 'reviewing', label: '审核中' },
  { value: 'interview', label: '面试中' },
  { value: 'hired', label: '已录用' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'archived', label: '已归档' }
];

interface BulkActionToolbarProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => Promise<void>;
  availableActions?: string[];
  isLoading?: boolean;
}

export function BulkActionToolbar({
  selectedItems,
  onClearSelection,
  onBulkAction,
  availableActions = ['update_status', 'send_email', 'add_tags', 'add_note', 'archive', 'delete'],
  isLoading = false
}: BulkActionToolbarProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null);
  const [actionData, setActionData] = useState<any>({});

  // 如果没有选中项目，不显示工具栏
  if (selectedItems.length === 0) {
    return null;
  }

  const handleActionClick = (actionId: string) => {
    const action = BULK_ACTIONS[actionId];
    if (!action) return;

    setCurrentAction(action);
    setActionData({});
    
    if (action.requiresInput) {
      setShowDialog(true);
    } else {
      // 直接执行不需要输入的操作
      handleConfirmAction();
    }
  };

  const handleConfirmAction = async () => {
    if (!currentAction) return;

    try {
      await onBulkAction(currentAction.id, actionData);
      setShowDialog(false);
      setCurrentAction(null);
      setActionData({});
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  const renderActionInput = () => {
    if (!currentAction) return null;

    switch (currentAction.id) {
      case 'update_status':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">选择新状态</Label>
              <Select 
                value={actionData.status || ''} 
                onValueChange={(value) => setActionData({ ...actionData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="note">备注（可选）</Label>
              <Textarea
                id="note"
                placeholder="添加状态变更备注..."
                value={actionData.note || ''}
                onChange={(e) => setActionData({ ...actionData, note: e.target.value })}
              />
            </div>
          </div>
        );

      case 'send_email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email_subject">邮件主题</Label>
              <Input
                id="email_subject"
                placeholder="输入邮件主题..."
                value={actionData.email_subject || ''}
                onChange={(e) => setActionData({ ...actionData, email_subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email_content">邮件内容</Label>
              <Textarea
                id="email_content"
                placeholder="输入邮件内容..."
                rows={6}
                value={actionData.email_content || ''}
                onChange={(e) => setActionData({ ...actionData, email_content: e.target.value })}
              />
            </div>
          </div>
        );

      case 'add_tags':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tags">标签（用逗号分隔）</Label>
              <Input
                id="tags"
                placeholder="例如：紧急,优先,技术面试..."
                value={actionData.tags_input || ''}
                onChange={(e) => {
                  const tagsInput = e.target.value;
                  const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
                  setActionData({ ...actionData, tags_input: tagsInput, tags });
                }}
              />
              {actionData.tags && actionData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {actionData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'add_note':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="note_content">备注内容</Label>
              <Textarea
                id="note_content"
                placeholder="输入备注内容..."
                rows={4}
                value={actionData.note || ''}
                onChange={(e) => setActionData({ ...actionData, note: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isActionValid = () => {
    if (!currentAction) return false;

    switch (currentAction.id) {
      case 'update_status':
        return !!actionData.status;
      case 'send_email':
        return !!actionData.email_subject && !!actionData.email_content;
      case 'add_tags':
        return actionData.tags && actionData.tags.length > 0;
      case 'add_note':
        return !!actionData.note;
      default:
        return true;
    }
  };

  return (
    <>
      {/* 批量操作工具栏 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                已选择 {selectedItems.length} 项
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {availableActions.map(actionId => {
                const action = BULK_ACTIONS[actionId];
                if (!action) return null;
                
                const Icon = action.icon;
                return (
                  <Button
                    key={actionId}
                    variant="outline"
                    size="sm"
                    onClick={() => handleActionClick(actionId)}
                    disabled={isLoading}
                    className={`${action.color} border-current hover:bg-current hover:text-white`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            取消选择
          </Button>
        </div>
      </div>

      {/* 批量操作确认对话框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {currentAction && (
                <>
                  <currentAction.icon className={`w-5 h-5 ${currentAction.color}`} />
                  <span>{currentAction.label}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {currentAction?.description}，将影响 {selectedItems.length} 个项目。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {renderActionInput()}
          </div>

          {(currentAction?.id === 'delete' || currentAction?.id === 'archive') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">注意</p>
                <p>
                  {currentAction.id === 'delete' 
                    ? '此操作将永久删除选中的记录，无法恢复。' 
                    : '此操作将归档选中的记录，归档后可以在归档列表中查看。'
                  }
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={isLoading || !isActionValid()}
              className={currentAction?.id === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              确认{currentAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
