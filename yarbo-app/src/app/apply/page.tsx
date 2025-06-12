import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyForm } from "./_components/ApplyForm";
import { mockJobs } from "../jobs/page";
import { Job } from "@/components/JobCard";
import { getJobById } from "@/lib/api";
import { getDepartmentColor } from "@/lib/supabase";
import type { JobWithDepartment } from "@/lib/database.types";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle, FileText, Send, User } from "lucide-react";

// 获取职位显示数据的工具函数
function getJobDisplayData(job: JobWithDepartment | Job) {
  if ('departments' in job && 'salary_display' in job) {
    // 数据库数据
    return {
      id: job.id,
      title: job.title,
      department: job.departments?.name || '未知部门',
      departmentColorTheme: job.departments?.color_theme || 'blue',
      location: job.location,
      salary: job.salary_display || '面议',
    };
  } else {
    // 静态数据
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      departmentColorTheme: 'blue',
      location: job.location,
      salary: job.salary,
    };
  }
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: { jobId?: string };
}) {
  const { jobId } = await searchParams;
  let job: JobWithDepartment | Job | null = null;
  let isUsingMockData = false;

  // 尝试从数据库获取职位信息
  if (jobId) {
    try {
      job = await getJobById(jobId);
    } catch (error) {
      console.error('获取职位信息失败:', error);
    }
    
    // 如果数据库中没有找到，尝试使用静态数据
    if (!job) {
      job = mockJobs.find((j: Job) => j.id === jobId) || null;
      isUsingMockData = true;
    }
  }

  const jobData = job ? getJobDisplayData(job) : null;
  const colors = jobData ? getDepartmentColor(jobData.departmentColorTheme) : getDepartmentColor('blue');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* 返回导航 */}
        <div className="mb-8">
          <Link 
            href={job ? `/jobs/${job.id}` : "/jobs"} 
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回{job ? "职位详情" : "职位列表"}</span>
          </Link>
        </div>

        {/* 演示数据提示 */}
        {isUsingMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-600 text-sm">
                ⚠️ 正在显示演示数据，申请信息将保存但请同时发送简历到 hr@yarbo.com
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* 头部信息区域 */}
          {jobData && (
            <Card className="mb-8 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl ${colors.bgColor} flex items-center justify-center`}>
                    <Building2 className={`h-8 w-8 ${colors.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.badge} mb-2`}>
                      {jobData.department}
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      申请职位: {jobData.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {jobData.location} • {jobData.salary}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧主要申请表单 */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl ${colors.bgColor} flex items-center justify-center`}>
                      <FileText className={`h-6 w-6 ${colors.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">申请信息</CardTitle>
                      <CardDescription>
                        请完整填写以下信息，我们会尽快与您联系
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ApplyForm 
                    positionTitle={jobData?.title} 
                    jobId={jobId}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 右侧信息边栏 */}
            <div className="space-y-6">
              {/* 申请流程 */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>申请流程</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <span className="text-gray-600">提交申请</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">2</span>
                    </div>
                    <span className="text-gray-600">简历筛选</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">3</span>
                    </div>
                    <span className="text-gray-600">面试邀请</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">4</span>
                    </div>
                    <span className="text-gray-600">发送offer</span>
                  </div>
                </CardContent>
              </Card>

              {/* 联系方式 */}
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>联系我们</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">人事部门</div>
                    <div className="text-gray-600">hr@yarbo.com</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">联系电话</div>
                    <div className="text-gray-600">021-1234-5678</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">工作时间</div>
                    <div className="text-gray-600">周一至周五 9:00-18:00</div>
                  </div>
                </CardContent>
              </Card>

              {/* 温馨提示 */}
              <Card className={`border-0 shadow-md hover:shadow-lg transition-all duration-300 ${colors.accent}`}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className={`w-12 h-12 rounded-xl ${colors.bgColor} flex items-center justify-center mx-auto`}>
                      <Send className={`h-6 w-6 ${colors.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">温馨提示</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        我们承诺在收到您的申请后3个工作日内给予回复。请保持电话畅通，期待与您的沟通！
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 