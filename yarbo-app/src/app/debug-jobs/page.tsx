"use client";

import { useState, useEffect } from 'react';
import { useRealtimeJobs } from '@/hooks/useRealtimeData';
import { supabase } from '@/lib/supabase';

export default function DebugJobsPage() {
  const { jobs, isLoading, error } = useRealtimeJobs();
  const [directApiResult, setDirectApiResult] = useState<any>(null);
  const [directApiLoading, setDirectApiLoading] = useState(false);
  const [directApiError, setDirectApiError] = useState<string | null>(null);

  // 直接测试 Supabase API
  const testDirectApi = async () => {
    console.log('开始直接测试 Supabase API...');
    setDirectApiLoading(true);
    setDirectApiError(null);

    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      console.log('直接 API 调用结果:', { data, error });

      if (error) {
        setDirectApiError(error.message);
      } else {
        setDirectApiResult(data);
      }
    } catch (err) {
      console.error('直接 API 调用失败:', err);
      setDirectApiError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setDirectApiLoading(false);
    }
  };

  useEffect(() => {
    testDirectApi();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">调试 Supabase 数据获取</h1>

      <div className="space-y-6">
        {/* useRealtimeJobs Hook 结果 */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">useRealtimeJobs Hook:</h2>
          <div className="space-y-2">
            <div><strong>Loading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>Error:</strong> {error || 'null'}</div>
            <div><strong>Jobs Count:</strong> {jobs.length}</div>
          </div>
        </div>

        {/* 直接 API 调用结果 */}
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">直接 Supabase API 调用:</h2>
          <div className="space-y-2">
            <div><strong>Loading:</strong> {directApiLoading ? 'true' : 'false'}</div>
            <div><strong>Error:</strong> {directApiError || 'null'}</div>
            <div><strong>Data Count:</strong> {directApiResult ? directApiResult.length : 0}</div>
          </div>

          <button
            onClick={testDirectApi}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            重新测试直接 API
          </button>
        </div>

        {/* 数据详情 */}
        <div className="bg-gray-50 border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">数据详情:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Hook 数据:</h3>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border max-h-64">
                {JSON.stringify(jobs, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-medium mb-2">直接 API 数据:</h3>
              <pre className="text-xs overflow-auto bg-white p-2 rounded border max-h-64">
                {JSON.stringify(directApiResult, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
