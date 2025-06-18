'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary_display: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted_date: string;
  deadline: string;
  experience_level: string;
  education_requirement: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchJobDetail() {
      try {
        // 由于我们没有真实的API，提供一些示例数据
        const sampleJob: JobDetail = {
          id: resolvedParams.id,
          title: '高级前端开发工程师',
          department: '技术部',
          location: '上海',
          type: '全职',
          salary_display: '20K-35K',
          description: `
我们正在寻找一位有经验的前端开发工程师加入我们的技术团队。你将负责开发和维护我们的Web应用程序，与设计师和后端开发人员密切合作，创建出色的用户体验。

主要职责：
• 开发响应式Web应用程序
• 优化应用程序性能和用户体验
• 与团队成员协作完成项目
• 参与代码审查和技术方案讨论
• 保持对新技术的学习和应用
          `,
          requirements: [
            '本科及以上学历，计算机相关专业',
            '3年以上前端开发经验',
            '精通JavaScript、HTML、CSS',
            '熟悉React、Vue等现代前端框架',
            '了解Node.js和前端工程化工具',
            '具备良好的团队合作能力'
          ],
          benefits: [
            '竞争力薪资 + 年终奖',
            '五险一金 + 补充医疗保险',
            '带薪年假 + 弹性工作时间',
            '技术培训 + 职业发展规划',
            '免费健身房 + 下午茶',
            '团队建设活动'
          ],
          posted_date: '2024-12-20',
          deadline: '2025-01-20',
          experience_level: '3-5年',
          education_requirement: '本科'
        };

        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setJob(sampleJob);
        setLoading(false);
      } catch (err) {
        setError('加载职位详情失败');
        setLoading(false);
      }
    }

    fetchJobDetail();
  }, [resolvedParams.id]);

  const handleApply = () => {
    router.push(`/apply?jobId=${resolvedParams.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">职位未找到</h2>
              <p className="text-gray-600 mb-6">抱歉，您查找的职位不存在或已被删除。</p>
              <Button onClick={() => router.push('/jobs')}>
                返回职位列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 返回按钮 */}
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          ← 返回
        </Button>

        {/* 职位标题和基本信息 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{job.department}</Badge>
                  <Badge variant="outline">{job.location}</Badge>
                  <Badge variant="outline">{job.type}</Badge>
                  <Badge variant="secondary">{job.salary_display}</Badge>
                </div>
              </div>
              <Button onClick={handleApply} size="lg">
                立即申请
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 主要内容 */}
          <div className="md:col-span-2 space-y-6">
            {/* 职位描述 */}
            <Card>
              <CardHeader>
                <CardTitle>职位描述</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-gray-700">
                  {job.description}
                </div>
              </CardContent>
            </Card>

            {/* 任职要求 */}
            <Card>
              <CardHeader>
                <CardTitle>任职要求</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 福利待遇 */}
            <Card>
              <CardHeader>
                <CardTitle>福利待遇</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-2">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>职位信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium text-gray-900">工作经验：</span>
                  <span className="text-gray-600">{job.experience_level}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">学历要求：</span>
                  <span className="text-gray-600">{job.education_requirement}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">发布时间：</span>
                  <span className="text-gray-600">{job.posted_date}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">截止时间：</span>
                  <span className="text-gray-600">{job.deadline}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Button onClick={handleApply} className="w-full" size="lg">
                  申请这个职位
                </Button>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  点击申请后将跳转到申请表单
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 