'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  department: string | null
}

export default function TestDepartmentsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, department')
          .order('created_at', { ascending: false })

        if (error) throw error
        setJobs(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取职位数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) return <div className="p-8">加载中...</div>
  if (error) return <div className="p-8 text-red-500">错误: {error}</div>

  const jobsWithDepartment = jobs.filter(job => job.department)
  const jobsWithoutDepartment = jobs.filter(job => !job.department)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">职位部门关联测试</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-lg font-semibold">总职位数</h2>
          <p className="text-2xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h2 className="text-lg font-semibold">有部门的职位数</h2>
          <p className="text-2xl font-bold">{jobsWithDepartment.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <h2 className="text-lg font-semibold">无部门的职位数</h2>
          <p className="text-2xl font-bold">{jobsWithoutDepartment.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">有部门的职位</h2>
          <div className="space-y-2">
            {jobsWithDepartment.map(job => (
              <div key={job.id} className="bg-white p-3 rounded border">
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-gray-600">部门: {job.department}</div>
                <Link 
                  href={`/jobs/${job.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  测试详情页
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">无部门的职位</h2>
          <div className="space-y-2">
            {jobsWithoutDepartment.map(job => (
              <div key={job.id} className="bg-white p-3 rounded border border-red-300">
                <div className="font-medium text-red-600">{job.title}</div>
                <div className="text-sm text-gray-600">ID: {job.id}</div>
                <div className="text-sm text-red-500">部门: 未设置</div>
                <Link 
                  href={`/jobs/${job.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  测试详情页
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}