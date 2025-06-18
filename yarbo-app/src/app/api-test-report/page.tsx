"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function APITestReportPage() {
  const [report, setReport] = useState<any>({
    debugJobIds: { status: "pending", data: null, error: null },
    testJobAPI: { status: "pending", data: null, error: null },
    summary: null
  });

  useEffect(() => {
    runFullTest();
  }, []);

  const runFullTest = async () => {
    console.log("=== 开始完整的职位API测试 ===");
    
    // 测试1: 获取所有职位ID
    try {
      const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, title, status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReport(prev => ({
        ...prev,
        debugJobIds: {
          status: "success",
          data: {
            totalJobs: jobs.length,
            first5Jobs: jobs.slice(0, 5),
            allJobs: jobs
          },
          error: null
        }
      }));

      // 如果有职位，继续测试API
      if (jobs.length > 0) {
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        await testJobAPI(randomJob.id);
      }
    } catch (error) {
      setReport(prev => ({
        ...prev,
        debugJobIds: {
          status: "error",
          data: null,
          error: error.message
        }
      }));
    }
  };

  const testJobAPI = async (jobId: string) => {
    try {
      const results = {
        jobId,
        tests: []
      };

      // 测试1: 联表查询
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

      results.tests.push({
        name: "联表查询",
        success: !error1,
        data: data1,
        error: error1
      });

      // 测试2: 直接查询
      const { data: data2, error: error2 } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      results.tests.push({
        name: "直接查询",
        success: !error2,
        data: data2,
        error: error2
      });

      // 测试3: 批量查询
      const { data: data3, error: error3 } = await supabase
        .from('jobs')
        .select('id, title, status')
        .limit(5);

      results.tests.push({
        name: "批量查询",
        success: !error3,
        data: data3,
        error: error3
      });

      setReport(prev => ({
        ...prev,
        testJobAPI: {
          status: "success",
          data: results,
          error: null
        },
        summary: {
          totalTests: 3,
          passed: results.tests.filter(t => t.success).length,
          failed: results.tests.filter(t => !t.success).length
        }
      }));

    } catch (error) {
      setReport(prev => ({
        ...prev,
        testJobAPI: {
          status: "error",
          data: null,
          error: error.message
        }
      }));
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">职位API测试报告</h1>
      
      {/* 测试1: Debug Job IDs */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          步骤1: 获取所有职位ID列表 
          <span className={`ml-2 text-sm ${
            report.debugJobIds.status === "success" ? "text-green-600" : 
            report.debugJobIds.status === "error" ? "text-red-600" : 
            "text-gray-500"
          }`}>
            {report.debugJobIds.status === "success" ? "✅ 成功" : 
             report.debugJobIds.status === "error" ? "❌ 失败" : 
             "⏳ 测试中..."}
          </span>
        </h2>
        
        {report.debugJobIds.status === "success" && (
          <div>
            <p className="mb-2">找到 <strong>{report.debugJobIds.data.totalJobs}</strong> 个职位</p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">前5个职位：</h3>
              <div className="space-y-2">
                {report.debugJobIds.data.first5Jobs.map((job, index) => (
                  <div key={job.id} className="p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{index + 1}.</span> 
                    <span className="ml-2 font-medium">{job.title}</span>
                    <span className="ml-2 text-sm text-gray-500">({job.status})</span>
                    <div className="text-xs text-gray-400 mt-1">ID: {job.id}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {report.debugJobIds.status === "error" && (
          <div className="text-red-600">
            错误: {report.debugJobIds.error}
          </div>
        )}
      </div>

      {/* 测试2: Test Job API */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          步骤2-4: 测试职位API功能
          <span className={`ml-2 text-sm ${
            report.testJobAPI.status === "success" ? "text-green-600" : 
            report.testJobAPI.status === "error" ? "text-red-600" : 
            "text-gray-500"
          }`}>
            {report.testJobAPI.status === "success" ? "✅ 完成" : 
             report.testJobAPI.status === "error" ? "❌ 失败" : 
             "⏳ 测试中..."}
          </span>
        </h2>
        
        {report.testJobAPI.status === "success" && (
          <div>
            <p className="mb-4">测试职位ID: <code className="bg-gray-100 px-2 py-1 rounded">{report.testJobAPI.data.jobId}</code></p>
            
            <div className="space-y-4">
              {report.testJobAPI.data.tests.map((test, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  test.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}>
                  <h3 className="font-medium mb-2">
                    测试{index + 1}: {test.name} 
                    <span className="ml-2">
                      {test.success ? "✅ 成功" : "❌ 失败"}
                    </span>
                  </h3>
                  
                  {test.error && (
                    <div className="text-red-600 text-sm">
                      <p>错误信息: {test.error.message}</p>
                      <p>错误代码: {test.error.code}</p>
                    </div>
                  )}
                  
                  {test.success && test.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-gray-600">查看返回数据</summary>
                      <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {report.testJobAPI.status === "error" && (
          <div className="text-red-600">
            错误: {report.testJobAPI.error}
          </div>
        )}
      </div>

      {/* 测试总结 */}
      {report.summary && (
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">测试结果总结</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold">{report.summary.totalTests}</div>
              <div className="text-gray-600">总测试数</div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-green-600">{report.summary.passed}</div>
              <div className="text-gray-600">通过</div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-red-600">{report.summary.failed}</div>
              <div className="text-gray-600">失败</div>
            </div>
          </div>
          
          {report.testJobAPI.data && (
            <div className="mt-4 text-center">
              <a 
                href={`/job-detail?id=${report.testJobAPI.data.jobId}`}
                target="_blank"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                查看测试职位的详情页 →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}