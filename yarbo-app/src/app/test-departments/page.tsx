"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDepartmentsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 查询所有职位的部门情况
        const { data: allJobs } = await supabase
          .from('jobs')
          .select('id, title, department_id');

        // 查询有部门的职位
        const { data: jobsWithDept } = await supabase
          .from('jobs')
          .select('id')
          .not('department_id', 'is', null);

        // 查询没有部门的职位
        const { data: jobsWithoutDept } = await supabase
          .from('jobs')
          .select('id, title')
          .is('department_id', null);

        // 查询所有部门
        const { data: departments } = await supabase
          .from('departments')
          .select('id, name');

        setStats({
          totalJobs: allJobs?.length || 0,
          jobsWithDepartment: jobsWithDept?.length || 0,
          jobsWithoutDepartment: jobsWithoutDept?.length || 0,
          departments: departments || [],
          jobsWithoutDeptList: jobsWithoutDept || []
        });

      } catch (error) {
        console.error('查询失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">部门关联测试</h1>

      {stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-bold text-blue-800">总职位数</h3>
              <p className="text-2xl">{stats.totalJobs}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-bold text-green-800">有部门的职位</h3>
              <p className="text-2xl">{stats.jobsWithDepartment}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-bold text-red-800">无部门的职位</h3>
              <p className="text-2xl">{stats.jobsWithoutDepartment}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">部门列表 ({stats.departments.length}个)</h2>
            <div className="grid grid-cols-2 gap-2">
              {stats.departments.map((dept: any) => (
                <div key={dept.id} className="p-2 bg-gray-50 rounded">
                  {dept.name}
                </div>
              ))}
            </div>
          </div>

          {stats.jobsWithoutDeptList.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-red-600">
                没有部门的职位 ({stats.jobsWithoutDeptList.length}个)
              </h2>
              <div className="space-y-2">
                {stats.jobsWithoutDeptList.map((job: any) => (
                  <div key={job.id} className="p-2 bg-red-50 rounded">
                    <p>{job.title}</p>
                    <p className="text-sm text-gray-600">ID: {job.id}</p>
                    <a 
                      href={`/job-detail?id=${job.id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      测试详情页 →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}