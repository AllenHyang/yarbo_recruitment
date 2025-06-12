/*
 * @Author: Allen
 * @Date: 2025-06-09 15:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 15:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/jobs/[id]/page.tsx
 * @Description: 候选人职位详情页面
 *
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Briefcase, Clock, Users, Send, CheckCircle, Star } from "lucide-react";
import { getJobById } from "@/lib/api";
import { getDepartmentColor } from "@/lib/supabase";
import type { JobWithDepartment } from "@/lib/database.types";
import { mockJobs } from "../page";
import type { Job } from "@/components/JobCard";

// 获取职位显示数据的辅助函数
function getJobDisplayData(job: JobWithDepartment | Job) {
    if ('departments' in job && 'salary_display' in job) {
        // 数据库类型
        return {
            id: job.id,
            title: job.title,
            department: job.departments?.name || '未知部门',
            departmentColorTheme: job.departments?.color_theme || 'blue',
            location: job.location,
            salary: job.salary_display || '面议',
            description: job.description || '暂无描述',
            responsibilities: job.responsibilities || [],
            requirements: job.requirements || [],
            status: job.status,
            created_at: job.created_at,
        };
    } else {
        // 静态数据格式
        return {
            id: job.id,
            title: job.title,
            department: job.department,
            departmentColorTheme: 'blue',
            location: job.location,
            salary: job.salary,
            description: '我们正在寻找优秀的人才加入我们的团队。这是一个充满挑战和机遇的职位，您将有机会参与创新项目，与优秀的团队合作，实现职业发展的新突破。',
            responsibilities: [
                '参与产品功能的设计和开发',
                '与团队成员协作完成项目目标',
                '持续学习新技术，提升技术能力',
                '参与代码审查和技术分享'
            ],
            requirements: [
                '相关专业本科及以上学历',
                '具备良好的沟通能力和团队合作精神',
                '对技术有热情，学习能力强',
                '有相关工作经验者优先'
            ],
            status: 'active',
            created_at: new Date().toISOString(),
        };
    }
}

export default async function JobDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    let job: JobWithDepartment | Job | null = null;
    let isUsingMockData = false;

    // 尝试从数据库获取职位信息
    try {
        job = await getJobById(id);
    } catch (error) {
        console.error('获取职位信息失败:', error);
    }

    // 如果数据库中没有找到，尝试使用静态数据
    if (!job) {
        job = mockJobs.find((j: Job) => j.id === id) || null;
        isUsingMockData = true;
    }

    // 如果仍然没有找到职位
    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 className="h-12 w-12 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            职位不存在
                        </h1>
                        <p className="text-gray-600 mb-8">
                            抱歉，您查找的职位可能已经下线或不存在。
                        </p>
                        <Link href="/jobs">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                返回职位列表
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const jobData = getJobDisplayData(job);
    const colors = getDepartmentColor(jobData.departmentColorTheme);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-8">
                {/* 返回导航 */}
                <div className="mb-8">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回职位列表</span>
                    </Link>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* 数据来源提示 */}
                    {isUsingMockData && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <div className="text-yellow-600 text-sm">
                                    ⚠️ 正在显示演示数据，实际职位信息请联系HR
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 主要内容区域 */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 职位头部信息 */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="pb-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`w-16 h-16 rounded-xl ${colors.bgColor} flex items-center justify-center flex-shrink-0`}>
                                            <Building2 className={`h-8 w-8 ${colors.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.badge} mb-3`}>
                                                {jobData.department}
                                            </div>
                                            <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                                                {jobData.title}
                                            </CardTitle>
                                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{jobData.location}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Briefcase className="h-4 w-4" />
                                                    <span className="font-semibold">{jobData.salary}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>全职</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* 职位描述 */}
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Star className="w-5 h-5 text-blue-600" />
                                        <span>职位描述</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 leading-relaxed">
                                        {jobData.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* 岗位职责 */}
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span>岗位职责</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {jobData.responsibilities.map((responsibility, index) => (
                                            <li key={index} className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="text-gray-700">{responsibility}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* 任职要求 */}
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Users className="w-5 h-5 text-purple-600" />
                                        <span>任职要求</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {jobData.requirements.map((requirement, index) => (
                                            <li key={index} className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                                                <span className="text-gray-700">{requirement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 右侧申请区域 */}
                        <div className="space-y-6">
                            {/* 申请卡片 */}
                            <Card className="border-0 shadow-lg sticky top-8">
                                <CardHeader>
                                    <CardTitle className="text-center text-xl">
                                        立即申请
                                    </CardTitle>
                                    <CardDescription className="text-center">
                                        加入我们，开启职业新篇章
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Link href={`/apply?jobId=${jobData.id}`}>
                                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg">
                                            <Send className="w-4 h-4 mr-2" />
                                            申请此职位
                                        </Button>
                                    </Link>

                                    <div className="text-center text-sm text-gray-500">
                                        <p>申请后我们会尽快与您联系</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 公司信息 */}
                            <Card className="border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-lg">关于 Yarbo</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center space-x-2">
                                            <Building2 className="w-4 h-4" />
                                            <span>智能机器人领域领导者</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="w-4 h-4" />
                                            <span>500+ 优秀员工</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>全球多个办公地点</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-700">
                                            Yarbo 致力于打造智能机器人生态系统，为用户提供创新的智能解决方案。
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}