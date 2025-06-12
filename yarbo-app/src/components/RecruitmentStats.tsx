/*
 * @Author: Allen
 * @Date: 2025-06-09 09:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 09:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/RecruitmentStats.tsx
 * @Description: 招聘统计面板组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/components/JobCard";
import type { JobWithDepartment } from "@/lib/database.types";
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  TrendingUp,
  Users,
  Target,
  Star,
  Clock
} from "lucide-react";

interface RecruitmentStatsProps {
  jobs: (JobWithDepartment | Job)[];
}

export function RecruitmentStats({ jobs }: RecruitmentStatsProps) {
  const stats = useMemo(() => {
    // 基础统计
    const totalJobs = jobs.length;
    
    // 地点统计
    const locationCounts = new Map<string, number>();
    // 部门统计
    const departmentCounts = new Map<string, number>();
    // 薪资级别统计
    const salaryLevels = new Map<string, number>();
    
    jobs.forEach(job => {
      // 统计地点
      if (job.location) {
        locationCounts.set(job.location, (locationCounts.get(job.location) || 0) + 1);
      }
      
      // 统计部门
      const department = ('departments' in job && job.departments?.name) || 
                        ('department' in job && job.department) || 
                        '未知部门';
      departmentCounts.set(department, (departmentCounts.get(department) || 0) + 1);
      
      // 统计薪资级别
      const salary = ('salary_display' in job && job.salary_display) || 
                    ('salary' in job && job.salary) || 
                    '';
      
      if (salary.includes('k')) {
        const salaryNum = parseInt(salary.split('-')[0] || '0');
        let level = '0-20k';
        if (salaryNum >= 50) level = '50k+';
        else if (salaryNum >= 30) level = '30-50k';
        else if (salaryNum >= 20) level = '20-30k';
        
        salaryLevels.set(level, (salaryLevels.get(level) || 0) + 1);
      }
    });

    // 排序并获取前5
    const topLocations = Array.from(locationCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
      
    const topDepartments = Array.from(departmentCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalJobs,
      totalLocations: locationCounts.size,
      totalDepartments: departmentCounts.size,
      topLocations,
      topDepartments,
      salaryLevels: Array.from(salaryLevels.entries())
    };
  }, [jobs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 总职位数 */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">招聘职位</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-xs text-gray-500 mt-1">个活跃职位</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 招聘地点 */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">招聘城市</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLocations}</p>
              <p className="text-xs text-gray-500 mt-1">个城市在招聘</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 招聘部门 */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">招聘部门</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDepartments}</p>
              <p className="text-xs text-gray-500 mt-1">个部门在招聘</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 平均增长率 */}
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">团队增长</p>
              <p className="text-3xl font-bold text-gray-900">+25%</p>
              <p className="text-xs text-gray-500 mt-1">年度增长率</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 热门地点分布 */}
      <Card className="md:col-span-2 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            热门招聘城市
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topLocations.map(([location, count], index) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900">{location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{count} 个职位</Badge>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${(count / stats.totalJobs) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 热门部门分布 */}
      <Card className="md:col-span-2 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-purple-600" />
            活跃招聘部门
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topDepartments.map(([department, count], index) => (
              <div key={department} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-purple-100' :
                    index === 1 ? 'bg-blue-100' :
                    index === 2 ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    <Users className={`h-4 w-4 ${
                      index === 0 ? 'text-purple-600' :
                      index === 1 ? 'text-blue-600' :
                      index === 2 ? 'text-green-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{department}</div>
                    <div className="text-sm text-gray-500">
                      {((count / stats.totalJobs) * 100).toFixed(1)}% 的职位
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-semibold">
                  {count} 个职位
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card className="lg:col-span-4 border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                开始您的求职之旅
              </h3>
              <p className="text-gray-600 mb-4">
                浏览我们的职位，找到最适合您的机会
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <Star className="h-3 w-3 mr-1" />
                  热门职位
                </Badge>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  <Clock className="h-3 w-3 mr-1" />
                  最新发布
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <Target className="h-3 w-3 mr-1" />
                  推荐匹配
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 