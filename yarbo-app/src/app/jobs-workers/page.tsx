'use client';

import { useState, useEffect } from 'react';
import { useJobs } from '@/hooks/useWorkersApi';
import { JobCard } from '@/components/JobCard';
import { NotificationBanner } from '@/components/NotificationBanner';

export default function JobsWorkersPage() {
  const { jobs, loading, error, fetchJobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  // 初始加载职位
  useEffect(() => {
    fetchJobs({ limit: 50 });
  }, [fetchJobs]);

  // 搜索过滤
  useEffect(() => {
    if (!jobs) {
      setFilteredJobs([]);
      return;
    }

    if (!searchTerm) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job: any) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [jobs, searchTerm]);

  const handleRefresh = () => {
    fetchJobs({ limit: 50 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* 页面标题 */}
        <div className="flex flex-col items-center justify-between gap-4 mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            探索我们的工作机会
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            基于 Cloudflare Workers API 的职位搜索
          </p>
          <div className="w-24 h-1 bg-blue-600 rounded-full mt-2"></div>
        </div>

        {/* API 状态指示器 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                loading ? 'bg-yellow-500 animate-pulse' : 
                error ? 'bg-red-500' : 
                'bg-green-500'
              }`}></div>
              <span className="text-sm font-medium">
                {loading ? '加载中...' : 
                 error ? 'API 连接失败' : 
                 `Cloudflare Workers API 已连接 (${jobs?.length || 0} 个职位)`}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              刷新
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">错误: {error}</p>
          )}
        </div>

        {/* 通知横幅 */}
        <NotificationBanner />

        {/* 搜索栏 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="搜索职位、部门或地点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">所有部门</option>
                <option value="技术部">技术部</option>
                <option value="产品部">产品部</option>
                <option value="市场部">市场部</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">所有地点</option>
                <option value="深圳">深圳</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
              </select>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        {jobs && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">总职位数</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter((job: any) => job.job_category === 'campus').length}
              </div>
              <div className="text-sm text-gray-600">校园招聘</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {jobs.filter((job: any) => job.job_category === 'internship').length}
              </div>
              <div className="text-sm text-gray-600">实习职位</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {jobs.filter((job: any) => job.job_category === 'regular').length}
              </div>
              <div className="text-sm text-gray-600">社会招聘</div>
            </div>
          </div>
        )}

        {/* 职位列表 */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">正在加载职位信息...</p>
            </div>
          )}

          {!loading && filteredJobs.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm ? '没有找到匹配的职位' : '暂无职位信息'}
              </p>
            </div>
          )}

          {!loading && filteredJobs.length > 0 && (
            <div className="grid gap-6">
              {filteredJobs.map((job: any) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {job.department || '未分配部门'}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {job.location}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {job.salary_display}
                          </span>
                          {job.is_remote && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              远程工作
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {job.job_category === 'campus' && '校园招聘'}
                          {job.job_category === 'internship' && '实习职位'}
                          {job.job_category === 'regular' && '社会招聘'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          浏览: {job.views_count || 0} | 申请: {job.application_count || 0}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">职位要求:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {job.requirements.slice(0, 3).map((req: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        发布时间: {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors">
                          查看详情
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          立即申请
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 分页 */}
        {!loading && filteredJobs.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                上一页
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
