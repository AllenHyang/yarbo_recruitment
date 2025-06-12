import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, MapPin, Building2 } from "lucide-react";
import type { JobWithDepartment } from "@/lib/database.types";
import { getDepartmentColor } from "@/lib/supabase";

// 保持向后兼容的Job类型（用于静态数据）
export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
};

interface JobCardProps {
  job: JobWithDepartment | Job;
}

// 类型守卫：检查是否为数据库类型
function isJobWithDepartment(job: JobWithDepartment | Job): job is JobWithDepartment {
  return 'departments' in job && 'salary_display' in job;
}

// 获取职位显示数据
function getJobDisplayData(job: JobWithDepartment | Job) {
  if (isJobWithDepartment(job)) {
    return {
      id: job.id,
      title: job.title,
      department: job.departments?.name || '未知部门',
      departmentColorTheme: job.departments?.color_theme || 'blue',
      location: job.location,
      salary: job.salary_display || '面议',
    };
  } else {
    // 静态数据格式
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      departmentColorTheme: 'blue', // 默认颜色
      location: job.location,
      salary: job.salary,
    };
  }
}

export function JobCard({ job }: JobCardProps) {
  const { title, department, departmentColorTheme, location, salary } = getJobDisplayData(job);
  const colors = getDepartmentColor(departmentColorTheme);
  
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
        <Button asChild className="w-full bg-gray-900 hover:bg-gray-800 text-white">
          <Link href={`/jobs/${job.id}`}>查看详情</Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 