"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TestJobDetailDirectPage() {
  const router = useRouter();

  useEffect(() => {
    const testJobDetail = async () => {
      // 获取第一个活跃的职位
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('status', 'active')
        .limit(1);

      if (jobs && jobs.length > 0) {
        const jobId = jobs[0].id;
        console.log('找到职位:', jobs[0].title, 'ID:', jobId);
        
        // 自动跳转到职位详情页
        setTimeout(() => {
          router.push(`/job-detail?id=${jobId}`);
        }, 2000);
      }
    };

    testJobDetail();
  }, [router]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">自动测试职位详情页</h1>
      <p>正在查找活跃职位并自动跳转到详情页...</p>
      <p className="text-sm text-gray-600 mt-4">请查看浏览器控制台的日志信息</p>
    </div>
  );
}