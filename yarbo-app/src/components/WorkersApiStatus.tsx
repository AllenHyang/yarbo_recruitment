'use client';

import { useState, useEffect } from 'react';
import { useApiTest } from '@/hooks/useWorkersApi';

interface ApiStatusProps {
  className?: string;
}

export function WorkersApiStatus({ className = '' }: ApiStatusProps) {
  const { result, loading, error, testApi } = useApiTest();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // 初始检查 API 状态
  useEffect(() => {
    const checkApi = async () => {
      await testApi();
      setLastCheck(new Date());
    };
    
    checkApi();
    
    // 每30秒检查一次
    const interval = setInterval(checkApi, 30000);
    
    return () => clearInterval(interval);
  }, [testApi]);

  const handleRefresh = async () => {
    await testApi();
    setLastCheck(new Date());
  };

  const getStatusColor = () => {
    if (loading) return 'bg-yellow-500';
    if (error || !result?.success) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (loading) return '检查中...';
    if (error) return 'API 连接失败';
    if (!result?.success) return 'API 错误';
    return 'API 正常';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${loading ? 'animate-pulse' : ''}`}></div>
          <div>
            <span className="text-sm font-medium">{getStatusText()}</span>
            {result?.runtime && (
              <div className="text-xs text-gray-500">{result.runtime}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {lastCheck && (
            <span className="text-xs text-gray-400">
              {lastCheck.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            刷新
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-600">
          错误: {error}
        </div>
      )}
      
      {result && !result.success && result.error && (
        <div className="mt-2 text-xs text-red-600">
          API 错误: {result.error}
        </div>
      )}
      
      {result?.success && result.features && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">功能特性:</div>
          <div className="flex flex-wrap gap-1">
            {result.features.slice(0, 2).map((feature: string, index: number) => (
              <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {feature.replace('✅ ', '')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 简化版本的状态指示器
export function WorkersApiIndicator({ className = '' }: ApiStatusProps) {
  const { result, loading, error, testApi } = useApiTest();

  useEffect(() => {
    testApi();
  }, [testApi]);

  const getStatusColor = () => {
    if (loading) return 'bg-yellow-500';
    if (error || !result?.success) return 'bg-red-500';
    return 'bg-green-500';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${loading ? 'animate-pulse' : ''}`}></div>
      <span className="text-xs text-gray-600">
        {loading ? '连接中' : error || !result?.success ? 'API 离线' : 'Workers API'}
      </span>
    </div>
  );
}
