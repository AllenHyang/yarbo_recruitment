'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import type { Department } from "@/lib/database.types";
import { departmentApi } from "@/lib/api-client";

interface DeleteDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department: Department | null;
}

export function DeleteDepartmentDialog({
  isOpen,
  onClose,
  onSuccess,
  department
}: DeleteDepartmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!department) return;

    setLoading(true);
    setError(null);

    try {
      const result = await departmentApi.deleteDepartment(department.id);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || '删除部门失败');
      }
    } catch (error) {
      console.error('删除部门失败:', error);
      setError(error instanceof Error ? error.message : '删除部门失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <AlertDialogTitle>确认删除部门</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              您确定要删除部门 <span className="font-medium text-gray-900">"{department?.name}"</span> 吗？
            </p>
            <p className="text-sm text-red-600">
              ⚠️ 此操作不可撤销。删除前请确保该部门下没有关联的职位或员工。
            </p>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
