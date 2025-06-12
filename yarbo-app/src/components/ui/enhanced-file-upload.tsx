"use client";

import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  File, 
  X, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface EnhancedFileUploadProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  multiple?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];

export function EnhancedFileUpload({
  onFilesChange,
  maxFiles = 5,
  maxSize = MAX_FILE_SIZE,
  acceptedTypes = ACCEPTED_FILE_TYPES,
  className,
  disabled = false,
  showPreview = true,
  multiple = true
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `文件 "${file.name}" 大小超过限制 (${(maxSize / 1024 / 1024).toFixed(1)}MB)`;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return `文件 "${file.name}" 格式不支持`;
    }
    
    return null;
  };

  const createFilePreview = (file: File): Promise<FileWithPreview> => {
    return new Promise((resolve) => {
      const fileWithId: FileWithPreview = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9)
      });

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithId.preview = e.target?.result as string;
          resolve(fileWithId);
        };
        reader.readAsDataURL(file);
      } else {
        resolve(fileWithId);
      }
    });
  };

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newErrors: string[] = [];
    
    // 检查文件数量限制
    if (files.length + fileArray.length > maxFiles) {
      newErrors.push(`最多只能上传 ${maxFiles} 个文件`);
      setErrors(newErrors);
      return;
    }

    // 验证每个文件
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // 创建文件预览
    const filesWithPreview = await Promise.all(
      validFiles.map(createFilePreview)
    );

    const updatedFiles = multiple ? [...files, ...filesWithPreview] : filesWithPreview;
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    setErrors([]);
  }, [files, maxFiles, maxSize, acceptedTypes, multiple, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // 清理预览URL
    const fileToRemove = files.find(file => file.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  }, [files, onFilesChange]);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return ImageIcon;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 拖拽上传区域 */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
          isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              拖拽文件到这里，或者
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-medium text-blue-600"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                点击选择文件
              </Button>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              支持 {acceptedTypes.map(type => {
                if (type.includes('pdf')) return 'PDF';
                if (type.includes('word')) return 'DOC';
                if (type.includes('wordprocessingml')) return 'DOCX';
                if (type.includes('image')) return '图片';
                return type.split('/')[1]?.toUpperCase();
              }).filter(Boolean).join(', ')} 格式，
              单个文件最大 {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">已选择的文件 ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const progress = uploadProgress[file.id] || 0;
              
              return (
                <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {/* 文件图标或预览 */}
                  <div className="flex-shrink-0">
                    {showPreview && file.preview ? (
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* 上传进度 */}
                    {progress > 0 && progress < 100 && (
                      <Progress value={progress} className="mt-1 h-1" />
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-1">
                    {progress === 100 && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    
                    {showPreview && file.preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.preview, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
