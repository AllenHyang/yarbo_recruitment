import { supabase } from './supabase';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  fileName?: string;
  cacheControl?: string;
  upsert?: boolean;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  filePath: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
  path?: string;
}

/**
 * 上传单个文件到Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket,
    folder = '',
    fileName,
    cacheControl = '3600',
    upsert = false,
    onProgress
  } = options;

  // 生成文件名
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

  try {
    // 模拟上传进度（Supabase JS客户端不直接支持进度回调）
    if (onProgress) {
      const progressInterval = setInterval(() => {
        // 这里可以实现真实的进度跟踪
        onProgress(Math.min(90, Math.random() * 80 + 10));
      }, 100);

      setTimeout(() => {
        clearInterval(progressInterval);
        onProgress(100);
      }, 1000);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl,
        upsert
      });

    if (error) {
      throw error;
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      filePath: data.path,
      fileUrl: publicUrl,
      fileName: finalFileName,
      fileSize: file.size,
      contentType: file.type
    };

  } catch (error) {
    console.error('文件上传失败:', error);
    throw new Error(`文件上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 批量上传文件
 */
export async function uploadMultipleFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadFile(file, {
        ...options,
        onProgress: (progress) => {
          if (options.onProgress) {
            // 计算总体进度
            const totalProgress = ((i * 100) + progress) / files.length;
            options.onProgress(totalProgress);
          }
        }
      });
      
      results.push(result);
    } catch (error) {
      console.error(`文件 ${file.name} 上传失败:`, error);
      throw error;
    }
  }
  
  return results;
}

/**
 * 删除文件
 */
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('文件删除失败:', error);
    throw new Error(`文件删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 批量删除文件
 */
export async function deleteMultipleFiles(
  bucket: string,
  filePaths: string[]
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('批量删除文件失败:', error);
    throw new Error(`批量删除文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取文件列表
 */
export async function listFiles(
  bucket: string,
  folder?: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: 'asc' | 'desc' };
  }
): Promise<FileMetadata[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: options?.limit,
        offset: options?.offset,
        sortBy: options?.sortBy
      });

    if (error) {
      throw error;
    }

    return data?.map(file => ({
      id: file.id || file.name,
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || '',
      lastModified: new Date(file.updated_at || file.created_at).getTime(),
      path: folder ? `${folder}/${file.name}` : file.name
    })) || [];

  } catch (error) {
    console.error('获取文件列表失败:', error);
    throw new Error(`获取文件列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 获取文件下载URL
 */
export async function getDownloadUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;

  } catch (error) {
    console.error('获取下载URL失败:', error);
    throw new Error(`获取下载URL失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(
  bucket: string,
  filePath: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: filePath
      });

    if (error) {
      return false;
    }

    return data?.some(file => file.name === filePath.split('/').pop()) || false;

  } catch (error) {
    console.error('检查文件存在性失败:', error);
    return false;
  }
}

/**
 * 获取文件信息
 */
export async function getFileInfo(
  bucket: string,
  filePath: string
): Promise<FileMetadata | null> {
  try {
    const folder = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
    const fileName = filePath.split('/').pop() || '';

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        search: fileName
      });

    if (error) {
      throw error;
    }

    const file = data?.find(f => f.name === fileName);
    if (!file) {
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      id: file.id || file.name,
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || '',
      lastModified: new Date(file.updated_at || file.created_at).getTime(),
      url: publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('获取文件信息失败:', error);
    return null;
  }
}

/**
 * 文件类型验证
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 文件大小验证
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * 生成唯一文件名
 */
export function generateUniqueFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = originalName.split('.').pop();
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  
  return prefix 
    ? `${prefix}_${baseName}_${timestamp}_${random}.${extension}`
    : `${baseName}_${timestamp}_${random}.${extension}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * 检查是否为图片文件
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * 检查是否为文档文件
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv'
  ];
  
  return documentTypes.includes(file.type);
}
