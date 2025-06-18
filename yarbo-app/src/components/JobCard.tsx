import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, MapPin, Building2, CheckCircle, ArrowRight } from "lucide-react";
import type { JobWithDepartment } from "@/lib/database.types";
import { getDepartmentColor } from "@/lib/supabase";
import { useState, useEffect } from "react";

// 保持向后兼容的Job类型（用于静态数据）
export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
};

interface JobCardProps {
  job: JobWithDepartment;
}

// 获取职位显示数据
function getJobDisplayData(job: JobWithDepartment) {
  // 格式化薪资显示
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (min && max) {
      return `${(min / 1000).toFixed(0)}k-${(max / 1000).toFixed(0)}k`;
    }
    return '面议';
  };

  return {
    id: job.id,
    title: job.title,
    department: job.department || '未知部门',
    departmentColorTheme: 'blue',
    location: job.location || '待定',
    salary: formatSalary(job.salary_min, job.salary_max),
  };
}

export function JobCard({ job }: JobCardProps) {
  const { title, department, departmentColorTheme, location, salary } = getJobDisplayData(job);
  const colors = getDepartmentColor(departmentColorTheme);
  const [jobDetail, setJobDetail] = useState<any>(null);

  const fetchJobDetail = async () => {
    // 直接使用传入的job数据作为详情
    setJobDetail(job);
  };

  return (
    <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-0 shadow-md">
      <CardHeader className="relative">
        <div className={`w-12 h-12 rounded-lg ${colors.bgColor} flex items-center justify-center mb-3`}>
          <Building2 className={`h-6 w-6 ${colors.color}`} />
        </div>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge} mb-2 w-fit`}>
          {department}
        </div>
        <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{salary}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={fetchJobDetail} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
              查看详情
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {department}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {salary}
                </div>
              </div>
              
              {jobDetail && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">职位描述</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {jobDetail.description || '暂无描述'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">职位要求</h3>
                    <ul className="space-y-1">
                      {(jobDetail.requirements || []).map((req: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">福利待遇</h3>
                    <ul className="space-y-1">
                      {(jobDetail.benefits || []).map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      立即申请
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
} 