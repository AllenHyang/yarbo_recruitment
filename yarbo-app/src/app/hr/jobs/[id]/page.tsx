'use client';

import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Users, Eye, Calendar } from "lucide-react";
import Link from "next/link";

export default function JobDetailsPage() {
  const { id } = useParams();

  // 模拟职位数据
  const job = {
    id,
    title: '🚀 资深全栈工程师',
    department: '技术部',
    location: '北京',
    status: 'published',
    salary_range: '25-40K',
    application_count: 28,
    views_count: 342,
    description: '我们正在寻找一位经验丰富的全栈工程师...',
    requirements: [
      '5年以上全栈开发经验',
      '精通React/Vue.js和Node.js',
      '熟悉TypeScript、MySQL、Redis'
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/hr/jobs">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回列表
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">{job.title}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/hr/jobs/${id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>职位信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{job.department}</Badge>
                      <Badge variant="outline">{job.location}</Badge>
                      <Badge variant="outline">{job.salary_range}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{job.views_count} 次浏览</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{job.application_count} 份申请</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>职位描述</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{job.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>任职要求</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>快速操作</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    查看申请 ({job.application_count})
                  </Button>
                  
                  <Link href={`/hr/jobs/${id}/edit`}>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      编辑职位
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
