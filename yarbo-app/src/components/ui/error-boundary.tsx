"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 调用错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境中打印错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback组件，使用它
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.retry} />;
      }

      // 默认错误UI
      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

export function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            出现了一些问题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            应用程序遇到了意外错误，请尝试刷新页面或联系技术支持。
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-gray-50 p-3 rounded-lg text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                错误详情 (开发模式)
              </summary>
              <pre className="text-red-600 whitespace-pre-wrap break-words">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex space-x-3">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 简化的错误显示组件，用于页面内的错误状态
interface InlineErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-3 h-3 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-red-700 text-sm">{error}</p>
          {onRetry && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRetry}
              className="text-red-600 hover:text-red-700 mt-2 p-0 h-auto"
            >
              点击重试
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    setError(errorMessage);
    
    // 在开发环境中打印错误
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled by useErrorHandler:', error);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}
