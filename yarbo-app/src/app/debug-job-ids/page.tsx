"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DebugJobIdsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, status')
        .order('created_at', { ascending: false });

      if (data) {
        setJobs(data);
      }
      if (error) {
        console.error('获取职位失败:', error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">职位ID调试</h1>
      
      {loading ? (
        <p>加载中...</p>
      ) : (
        <div className="space-y-2">
          <p className="mb-4">找到 {jobs.length} 个职位</p>
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded">
              <p><strong>ID:</strong> {job.id}</p>
              <p><strong>标题:</strong> {job.title}</p>
              <p><strong>状态:</strong> {job.status}</p>
              <p>
                <a 
                  href={`/job-detail?id=${job.id}`} 
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  查看详情页
                </a>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}