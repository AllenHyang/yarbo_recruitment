/*
 * @Author: Allen
 * @Date: 2025-06-09 08:15:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 08:15:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/ResumeViewer.tsx
 * @Description: 简历在线预览组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, X, Eye } from "lucide-react";

interface ResumeViewerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string;
  resumeName?: string;
  candidateName?: string;
}

export function ResumeViewer({
  isOpen,
  onClose,
  resumeUrl,
  resumeName = "简历文件",
  candidateName = "候选人"
}: ResumeViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useEmbedViewer, setUseEmbedViewer] = useState(false);

  const handleDownload = () => {
    if (resumeUrl) {
      const link = document.createElement('a');
      link.href = resumeUrl;
      link.download = resumeName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    if (!useEmbedViewer) {
      // 第一次失败，尝试使用嵌入式查看器
      setUseEmbedViewer(true);
      setIsLoading(true);
      setError(null);
    } else {
      setError("简历预览失败，请尝试下载查看");
    }
  };

  // 重置状态当URL改变时
  const resetViewerState = () => {
    setIsLoading(true);
    setError(null);
    setUseEmbedViewer(false);
  };

  // 获取优化的PDF URL
  const getOptimizedPdfUrl = () => {
    if (!resumeUrl) return '';

    if (useEmbedViewer) {
      // 使用Google Docs Viewer作为备用方案
      return `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}&embedded=true`;
    } else {
      // 使用原始URL并添加PDF查看器参数
      const url = new URL(resumeUrl);
      // 添加PDF查看器参数以优化显示
      return `${resumeUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH&zoom=page-width`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {candidateName} 的简历
                </DialogTitle>
                <DialogDescription>
                  {resumeName}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>下载</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>新窗口打开</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 pt-2 min-h-0">
          {!resumeUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FileText className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">暂无简历文件</p>
              <p className="text-sm">该候选人尚未上传简历</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <Eye className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-red-600 mb-2">预览失败</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <div className="flex space-x-3">
                <Button onClick={handleDownload} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>直接下载</span>
                </Button>
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  新窗口打开
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full relative bg-gray-100 rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载简历...</p>
                  </div>
                </div>
              )}

              <iframe
                key={`${resumeUrl}-${useEmbedViewer}`} // 强制重新加载当切换查看器时
                src={getOptimizedPdfUrl()}
                className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                title={`${candidateName} 的简历`}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ minHeight: '600px' }}
                allow="fullscreen"
              />

              {/* 查看器切换提示 */}
              {useEmbedViewer && !isLoading && (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                  使用备用查看器
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 简历预览触发按钮组件
interface ResumePreviewButtonProps {
  resumeUrl?: string;
  resumeName?: string;
  candidateName?: string;
  className?: string;
}

export function ResumePreviewButton({
  resumeUrl,
  resumeName,
  candidateName,
  className = ""
}: ResumePreviewButtonProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsViewerOpen(true)}
        className={`flex items-center space-x-2 ${className}`}
        disabled={!resumeUrl}
      >
        <FileText className="h-4 w-4" />
        <span>查看简历</span>
      </Button>

      <ResumeViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        resumeUrl={resumeUrl}
        resumeName={resumeName}
        candidateName={candidateName}
      />
    </>
  );
} 