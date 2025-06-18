"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  Building,
  GraduationCap,
  Share2,
  Copy
} from "lucide-react";

interface JobDetail {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  salary_display: string;
  description: string;
  requirements: string[];
  benefits: string[];
  created_at: string;
  status: string;
  is_featured: boolean;
}

// 模拟职位数据 - 在实际应用中这些会从数据库获取
const mockJobs: { [key: string]: JobDetail } = {
  "1": {
    id: "1",
    title: "高级前端开发工程师",
    department: "技术研发部",
    location: "北京",
    type: "全职",
    level: "高级",
    salary_display: "25K-35K",
    description: `我们正在寻找一位经验丰富的高级前端开发工程师加入我们的团队。您将负责：

• 负责公司核心产品的前端架构设计和开发
• 与产品经理、设计师和后端工程师协作，打造优秀的用户体验
• 参与前端技术选型和最佳实践制定
• 指导和培养初中级前端工程师
• 持续优化前端性能和用户体验

加入我们，您将有机会：
• 参与从0到1的产品建设
• 使用最新的前端技术栈
• 在快速发展的团队中获得成长
• 享受灵活的工作环境和丰厚的薪酬福利`,
    requirements: [
      "本科及以上学历，计算机相关专业",
      "5年以上前端开发经验，有大型项目经验",
      "精通React/Vue.js等主流前端框架",
      "熟悉TypeScript、Webpack、Vite等现代前端工具链",
      "熟悉HTML5、CSS3、ES6+等前端技术",
      "了解Node.js和后端开发基础",
      "有良好的代码规范和团队协作能力",
      "对新技术有敏锐的嗅觉和学习能力"
    ],
    benefits: [
      "具有竞争力的薪酬：25K-35K + 年终奖",
      "五险一金 + 补充商业保险",
      "14薪 + 股票期权",
      "弹性工作时间，支持远程办公",
      "年假15天起 + 带薪病假",
      "免费三餐 + 下午茶 + 零食饮料",
      "年度体检 + 健身房会员",
      "技术培训津贴 + 技术会议支持",
      "团队建设活动 + 年度旅游",
      "MacBook Pro + 4K显示器等顶级设备"
    ],
    created_at: "2025-01-15T08:00:00Z",
    status: "active",
    is_featured: true
  },
  "2": {
    id: "2",
    title: "产品经理",
    department: "产品部",
    location: "上海",
    type: "全职",
    level: "中级",
    salary_display: "20K-30K",
    description: `我们正在寻找一位富有激情的产品经理，负责核心产品的规划和迭代。您将：

• 负责产品需求分析和功能设计
• 与技术团队紧密协作，推动产品开发
• 进行用户调研和数据分析
• 制定产品路线图和版本规划
• 跟踪产品指标，持续优化用户体验

这是一个充满挑战和成长机会的岗位，适合有想法、有执行力的产品人才。`,
    requirements: [
      "本科及以上学历，3年以上产品经理经验",
      "有ToB或ToC产品经验，了解用户需求分析",
      "熟悉产品设计流程和原型工具",
      "具备良好的逻辑思维和沟通能力",
      "有数据分析能力，能够制定并跟踪产品指标",
      "了解技术实现原理，能与技术团队有效沟通"
    ],
    benefits: [
      "薪酬范围：20K-30K + 绩效奖金",
      "完善的福利体系",
      "职业发展通道明确",
      "优秀的团队氛围",
      "学习成长机会丰富"
    ],
    created_at: "2025-01-10T08:00:00Z",
    status: "active",
    is_featured: false
  }
};

function JobDetailContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('id');
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('职位ID不能为空');
      setIsLoading(false);
      return;
    }

    // 首先检查真实数据，如果没有则使用模拟数据
    const fetchJobData = async () => {
      try {
        // 这里应该从Supabase获取真实数据
        // const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();
        
        // 暂时使用模拟数据
        const jobData = mockJobs[jobId];
        if (jobData) {
          setJob(jobData);
        } else {
          setError('职位不存在或已下线');
        }
      } catch (err) {
        setError('获取职位信息失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="h-10 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h1 className="text-2xl font-bold text-red-800 mb-4">职位未找到</h1>
            <p className="text-red-600 mb-6">{error || '抱歉，您查看的职位不存在或已下线。'}</p>
            <Link href="/jobs">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回职位列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <Link href="/jobs" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回职位列表
        </Link>

        {/* 职位标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            {job.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                推荐职位
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              {job.department}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              {job.type}
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              {job.level}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="md:col-span-2 space-y-6">
            {/* 职位描述 */}
            <Card>
              <CardHeader>
                <CardTitle>职位描述</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 职位要求 */}
            <Card>
              <CardHeader>
                <CardTitle>职位要求</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">薪资范围</span>
                  <span className="font-semibold text-green-600">{job.salary_display}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">发布时间</span>
                  <span className="text-gray-900">
                    {new Date(job.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">职位状态</span>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                    {job.status === 'active' ? '招聘中' : '已暂停'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* 申请按钮 */}
            <Card>
              <CardContent className="pt-6">
                <Link href={`/apply?jobId=${job.id}`} className="w-full">
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={job.status !== 'active'}
                  >
                    {job.status === 'active' ? '立即申请' : '暂停招聘'}
                  </Button>
                </Link>
                {!user && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    需要先 <Link href="/auth/login" className="text-blue-600 hover:underline">登录</Link> 才能申请
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 分享 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">分享职位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    复制链接
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-3 w-3 mr-1" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-32"></div>
            <div className="h-10 bg-gray-200 rounded mb-6 w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <JobDetailContent />
    </Suspense>
  );
}