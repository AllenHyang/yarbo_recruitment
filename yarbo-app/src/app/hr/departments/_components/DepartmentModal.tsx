'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import type { Department } from "@/lib/database.types";
import { departmentApi } from "@/lib/api-client";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department | null;
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  description: string;
  color_theme: string;
}

const colorThemes = [
  { value: 'blue', label: '蓝色', color: 'bg-blue-500' },
  { value: 'green', label: '绿色', color: 'bg-green-500' },
  { value: 'purple', label: '紫色', color: 'bg-purple-500' },
  { value: 'orange', label: '橙色', color: 'bg-orange-500' },
  { value: 'red', label: '红色', color: 'bg-red-500' },
  { value: 'indigo', label: '靛蓝', color: 'bg-indigo-500' },
];

export function DepartmentModal({ isOpen, onClose, onSuccess, department, mode }: DepartmentModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color_theme: 'blue'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // 初始化表单数据
  useEffect(() => {
    if (mode === 'edit' && department) {
      setFormData({
        name: department.name,
        description: department.description || '',
        color_theme: department.color_theme
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color_theme: 'blue'
      });
    }
    setErrors({});
  }, [mode, department, isOpen]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '部门名称不能为空';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '部门名称至少需要2个字符';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = '部门名称不能超过50个字符';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = '部门描述不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color_theme: formData.color_theme
      };

      const result = mode === 'create'
        ? await departmentApi.createDepartment(requestData)
        : await departmentApi.updateDepartment(department!.id, requestData);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || `${mode === 'create' ? '创建' : '更新'}部门失败`);
      }
    } catch (error) {
      console.error(`${mode === 'create' ? '创建' : '更新'}部门失败:`, error);
      setErrors({
        name: error instanceof Error ? error.message : `${mode === 'create' ? '创建' : '更新'}部门失败`
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span>{mode === 'create' ? '创建部门' : '编辑部门'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 部门名称 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              部门名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="请输入部门名称"
              className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 部门描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              部门描述
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="请输入部门描述（可选）"
              rows={3}
              className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {formData.description.length}/200 字符
            </p>
          </div>

          {/* 颜色主题 */}
          <div className="space-y-2">
            <Label htmlFor="color_theme" className="text-sm font-medium">
              颜色主题
            </Label>
            <Select
              value={formData.color_theme}
              onValueChange={(value) => handleInputChange('color_theme', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择颜色主题" />
              </SelectTrigger>
              <SelectContent>
                {colorThemes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full ${theme.color}`} />
                      <span>{theme.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? '创建部门' : '更新部门'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
