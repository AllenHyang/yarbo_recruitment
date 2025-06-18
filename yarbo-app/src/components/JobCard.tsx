import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, ArrowRight } from "lucide-react";
import type { JobWithDepartment } from "@/lib/database.types";
import { getDepartmentColor } from "@/lib/supabase";
import Link from "next/link";

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
        <Link href={`/job-detail?id=${job.id}`} className="w-full">
          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            查看详情
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 