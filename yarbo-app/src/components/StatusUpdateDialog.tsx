/*
 * @Author: Allen
 * @Date: 2025-06-09 16:30:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 16:30:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/StatusUpdateDialog.tsx
 * @Description: 申请状态更新对话框组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { updateApplicationStatus } from "@/lib/api";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  currentStatus: string;
  candidateName: string;
  onStatusUpdated: (newStatus: string, statusHistory: any[]) => void;
}

// 状态配置
const statusConfig = {
  pending: { text: '待处理', color: 'bg-yellow-100 text-yellow-800' },
  reviewing: { text: '审核中', color: 'bg-blue-100 text-blue-800' },
  interview: { text: '面试中', color: 'bg-purple-100 text-purple-800' },
  hired: { text: '已录用', color: 'bg-green-100 text-green-800' },
  rejected: { text: '已拒绝', color: 'bg-red-100 text-red-800' }
};

export function StatusUpdateDialog({
  open,
  onOpenChange,
  applicationId,
  currentStatus,
  candidateName,
  onStatusUpdated
}: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (newStatus === currentStatus) {
      setError('请选择不同的状态');
      return;
    }

    if (!note.trim()) {
      setError('请填写状态变更说明');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await updateApplicationStatus(
        applicationId,
        newStatus,
        note.trim(),
        'hr@yarbo.com' // 这里应该从用户上下文获取
      );

      if (result.success) {
        setSuccess(true);
        // 延迟关闭对话框，让用户看到成功提示
        setTimeout(() => {
          onStatusUpdated(newStatus, result.data?.status_history || []);
          onOpenChange(false);
          // 重置状态
          setNote('');
          setError('');
          setSuccess(false);
        }, 1500);
      } else {
        setError(result.error || '状态更新失败');
      }
    } catch (error) {
      setError('状态更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewStatus(currentStatus);
    setNote('');
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  const getStatusText = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.text || status;
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>更新申请状态</span>
          </DialogTitle>
          <DialogDescription>
            更新 <span className="font-medium">{candidateName}</span> 的申请状态
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700">状态更新成功！</h3>
              <p className="text-sm text-gray-600 mt-1">
                状态已更新为：{getStatusText(newStatus)}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 当前状态 */}
            <div className="space-y-2">
              <Label>当前状态</Label>
              <Badge className={getStatusColor(currentStatus)}>
                {getStatusText(currentStatus)}
              </Badge>
            </div>

            {/* 新状态选择 */}
            <div className="space-y-2">
              <Label htmlFor="status">新状态 *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择新状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="reviewing">审核中</SelectItem>
                  <SelectItem value="interview">面试中</SelectItem>
                  <SelectItem value="hired">已录用</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态变更说明 */}
            <div className="space-y-2">
              <Label htmlFor="note">状态变更说明 *</Label>
              <Textarea
                id="note"
                placeholder="请输入状态变更的原因或说明..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                此说明将记录在申请历史中，并可能发送给候选人
              </p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* 预览新状态 */}
            {newStatus !== currentStatus && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">状态将更新为：</span>
                  <Badge className={getStatusColor(newStatus)}>
                    {getStatusText(newStatus)}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || newStatus === currentStatus || !note.trim()}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? '更新中...' : '确认更新'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
