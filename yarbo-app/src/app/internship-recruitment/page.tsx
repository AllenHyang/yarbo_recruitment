"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  MapPin,
  Calendar,
  Users,
  Building,
  Search,
  Filter,
  Clock,
  DollarSign,
  Briefcase,
  ArrowRight,
  Star,
  BookOpen,
  Award,
  Target,
  Lightbulb,
  TrendingUp
} from "lucide-react";

interface InternshipJob {
  id: string;
  title: string;
  department: string;
  location: string;
  duration: string;
  type: string;
  salary_display: string;
  description: string;
  requirements: string[];
  benefits: string[];
  skills_gained: string[];
  posted_at: string;
  deadline: string;
  start_date: string;
  is_featured: boolean;
  is_remote: boolean;
}

// 缓存管理
const internshipJobsCache = new Map<string, { data: InternshipJob[], timestamp: number }>();
const CACHE_DURATION = 3 * 60 * 1000; // 3分钟缓存

function InternshipRecruitmentPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");

  // 直接使用Supabase获取并过滤实习招聘职位
  const fetchInternshipJobs = useCallback(async () => {
    setIsLoading(true);

    try {
      const { data: allJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');

      if (error) {
        throw new Error(error.message);
      }

      // 客户端过滤实习招聘职位
      const internshipJobs = (allJobs || []).filter((job: any) => {
        const title = job.title?.toLowerCase() || '';
        const department = job.department?.toLowerCase() || '';
        return title.includes('实习') || title.includes('intern') || department.includes('实习');
      });
      
      setJobs(internshipJobs);
      console.log(`获取到 ${internshipJobs.length} 个实习招聘职位`);
    } catch (error) {
      console.error('获取职位数据失败:', error);
      setJobs([]);
      setError('获取数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    fetchInternshipJobs();
  }, [fetchInternshipJobs]);

  // 优化筛选选项计算 - 使用 useMemo 避免重复计算
  const { departments, locations, durations } = useMemo(() => {
    return {
      departments: Array.from(new Set(jobs.map(job => job.department))),
      locations: Array.from(new Set(jobs.map(job => job.location))),
      durations: Array.from(new Set(jobs.map(job => job.duration)))
    };
  }, [jobs]);

  // 客户端过滤
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesDuration = selectedDuration === 'all' || job.duration === selectedDuration;
      
      return matchesSearch && matchesDepartment && matchesLocation && matchesDuration;
    });
  }, [jobs, searchTerm, selectedDepartment, selectedLocation, selectedDuration]);

  // 骨架屏组件
  const InternshipCardSkeleton = () => (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-4 w-5/6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-20"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-18"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && !jobs.length) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部骨架 */}
          <div className="text-center mb-12">
            <div className="h-12 bg-gray-200 rounded mx-auto mb-4 w-64 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded mx-auto w-96 animate-pulse"></div>
          </div>

          {/* 亮点骨架 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-3"></div>
                  <div className="h-5 bg-gray-200 rounded mb-2 w-24 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 搜索栏骨架 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 职位列表骨架 */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <InternshipCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <UserCheck className="h-12 w-12 text-green-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">实习招聘</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            为在校学生提供宝贵的实习机会，在实践中学习成长，为未来职业发展奠定基础
          </p>
        </div>

        {/* 实习亮点 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">实战项目</h3>
              <p className="text-gray-600">参与真实项目开发</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">导师制度</h3>
              <p className="text-gray-600">资深员工一对一指导</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">技能提升</h3>
              <p className="text-gray-600">快速提升专业技能</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">转正机会</h3>
              <p className="text-gray-600">优秀实习生可获转正</p>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索实习职位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有部门</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有地点</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有时长</option>
                {durations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 实习职位列表 */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配的实习职位</h3>
                <p className="text-gray-500">请尝试调整搜索条件或稍后再来查看</p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className={`hover:shadow-lg transition-shadow ${job.is_featured ? 'ring-2 ring-green-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.is_featured && (
                          <Badge className="bg-green-100 text-green-800">热门</Badge>
                        )}
                        {job.is_remote && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">远程</Badge>
                        )}
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.duration}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary_display}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        开始时间: {new Date(job.start_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        截止申请: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      <Link href={`/apply?jobId=${job.id}&type=internship`}>
                        <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                          <span>申请实习</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{job.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">申请要求</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">实习收获</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_gained.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      发布于 {new Date(job.posted_at).toLocaleDateString()}
                    </div>
                    <Link href={`/internship-recruitment/${job.id}`} className="text-green-600 hover:text-green-800 text-sm">
                      查看详情 →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 实习申请流程 */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-center">实习申请流程</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">在线申请</h4>
                <p className="text-sm text-gray-600">提交简历和申请</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">简历筛选</h4>
                <p className="text-sm text-gray-600">HR初步筛选</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">面试评估</h4>
                <p className="text-sm text-gray-600">部门面试</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <h4 className="font-medium mb-2">确认录用</h4>
                <p className="text-sm text-gray-600">发放实习Offer</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">5</span>
                </div>
                <h4 className="font-medium mb-2">开始实习</h4>
                <p className="text-sm text-gray-600">入职培训</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InternshipRecruitmentPage;
