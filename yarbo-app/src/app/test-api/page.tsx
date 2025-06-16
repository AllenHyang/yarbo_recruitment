"use client";

import { useState, useEffect } from 'react';
import { getJobs } from '@/lib/api';

export default function TestAPIPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        console.log('开始测试 Supabase 连接...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

        const jobsData = await getJobs();
        console.log('获取到的职位数据:', jobsData);
        setJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error('获取职位失败:', err);
        setError(err instanceof Error ? err.message : '获取职位失败');
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">API 测试页面</h1>

      {loading && <p>加载中...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <p className="text-red-600">错误: {error}</p>
        </div>
      )}

      <div className="bg-gray-50 border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">职位数据 ({jobs.length} 个):</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(jobs, null, 2)}
        </pre>
      </div>
    </div>
  );
}
