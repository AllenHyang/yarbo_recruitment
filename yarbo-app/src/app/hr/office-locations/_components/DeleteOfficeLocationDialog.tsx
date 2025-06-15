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
import { Loader2 } from "lucide-react";
import { officeLocationApi } from "@/lib/api-client";
import type { OfficeLocation } from "@/lib/database.types";

interface DeleteOfficeLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  location: OfficeLocation | null;
}

export function DeleteOfficeLocationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  location 
}: DeleteOfficeLocationDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!location) return;

    setLoading(true);
    try {
      await officeLocationApi.delete(location.id);
      onConfirm();
    } catch (error) {
      console.error('删除办公地点失败:', error);
      alert('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除办公地点</AlertDialogTitle>
          <AlertDialogDescription>
            您确定要删除办公地点 "{location?.name}" 吗？
            <br />
            <br />
            <strong>注意：</strong>如果有职位正在使用此地点，删除操作将会失败。
            请先将相关职位的地点更改为其他地点，然后再删除此地点。
            <br />
            <br />
            此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
