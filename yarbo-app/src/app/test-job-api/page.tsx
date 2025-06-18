"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestJobApiPage() {
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testJobQuery = async () => {
    if (!jobId) {
      alert("请输入职位ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("开始查询职位，ID:", jobId);

      // 测试1: 联表查询
      console.log("测试1: 联表查询");
      const { data: data1, error: error1 } = await supabase
        .from('jobs')
        .select(`
          *,
          departments (
            id,
            name,
            color_theme
          )
        `)
        .eq('id', jobId)
        .single();

      if (error1) {
        console.error("联表查询失败:", error1);
      } else {
        console.log("联表查询成功:", data1);
      }

      // 测试2: 直接查询职位表
      console.log("测试2: 直接查询职位表");
      const { data: data2, error: error2 } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error2) {
        console.error("直接查询失败:", error2);
      } else {
        console.log("直接查询成功:", data2);
      }

      // 测试3: 查询所有职位（不带条件）
      console.log("测试3: 查询前5个职位");
      const { data: data3, error: error3 } = await supabase
        .from('jobs')
        .select('id, title, status')
        .limit(5);

      if (error3) {
        console.error("查询所有职位失败:", error3);
      } else {
        console.log("查询所有职位成功:", data3);
      }

      setResult({
        联表查询: { data: data1, error: error1 },
        直接查询: { data: data2, error: error2 },
        所有职位: { data: data3, error: error3 }
      });

    } catch (err) {
      console.error("查询异常:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const testRandomJob = async () => {
    setLoading(true);
    try {
      // 先获取一个随机职位ID
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title')
        .limit(1);

      if (jobs && jobs.length > 0) {
        setJobId(jobs[0].id);
        // 自动测试这个ID
        setTimeout(() => {
          testJobQuery();
        }, 100);
      }
    } catch (err) {
      console.error("获取随机职位失败:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">职位API测试</h1>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">职位ID:</label>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="输入职位ID"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={testJobQuery}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "查询中..." : "测试查询"}
          </button>

          <button
            onClick={testRandomJob}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            获取随机职位并测试
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="font-bold text-red-800 mb-2">错误:</h3>
          <pre className="text-sm text-red-600">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-bold text-blue-800 mb-2">测试1: 联表查询结果</h3>
            {result.联表查询.error ? (
              <div className="text-red-600">
                <p>错误: {result.联表查询.error.message}</p>
                <p>代码: {result.联表查询.error.code}</p>
              </div>
            ) : (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.联表查询.data, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h3 className="font-bold text-green-800 mb-2">测试2: 直接查询结果</h3>
            {result.直接查询.error ? (
              <div className="text-red-600">
                <p>错误: {result.直接查询.error.message}</p>
                <p>代码: {result.直接查询.error.code}</p>
              </div>
            ) : (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.直接查询.data, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h3 className="font-bold text-yellow-800 mb-2">测试3: 所有职位（前5个）</h3>
            {result.所有职位.error ? (
              <div className="text-red-600">
                <p>错误: {result.所有职位.error.message}</p>
              </div>
            ) : (
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result.所有职位.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">调试信息:</h3>
        <p className="text-sm">请打开浏览器控制台查看详细的调试日志</p>
        <p className="text-sm mt-2">当前职位详情页URL格式: /job-detail?id={jobId}</p>
        {jobId && (
          <p className="text-sm mt-2">
            <a 
              href={`/job-detail?id=${jobId}`} 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              查看当前ID的职位详情页 →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}