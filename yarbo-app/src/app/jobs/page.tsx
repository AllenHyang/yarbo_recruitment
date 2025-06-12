/*
 * @Author: Allen
 * @Date: 2025-06-09 09:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 09:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/app/jobs/page.tsx
 * @Description: 职位搜索页面
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect } from "react";
import { JobCard, type Job } from "@/components/JobCard";
import { JobSearch } from "@/components/JobSearch";
import { RecruitmentStats } from "@/components/RecruitmentStats";
import { NotificationBanner } from "@/components/NotificationBanner";
import { getJobs } from "@/lib/api";
import { useRealtimeJobs } from "@/hooks/useRealtimeData";
import type { JobWithDepartment } from "@/lib/database.types";

// 保留静态数据作为备用
export const mockJobs: Job[] = [
  {
    id: "1",
    title: "高级前端工程师",
    department: "产品研发部",
    location: "上海",
    salary: "25k-45k",
  },
  {
    id: "2",
    title: "嵌入式软件工程师 (Linux/RTOS)",
    department: "机器人系统部",
    location: "上海",
    salary: "20k-40k",
  },
  {
    id: "3",
    title: "产品经理 (智能硬件)",
    department: "产品规划部",
    location: "上海",
    salary: "20k-35k",
  },
  {
    id: "4",
    title: "测试开发工程师",
    department: "质量与可靠性部",
    location: "上海",
    salary: "18k-30k",
  },
  {
    id: "5",
    title: "算法工程师 (计算机视觉)",
    department: "人工智能部",
    location: "北京",
    salary: "30k-50k",
  },
  {
    id: "6",
    title: "硬件工程师 (电子设计)",
    department: "机器人系统部",
    location: "深圳",
    salary: "22k-38k",
  },
  {
    id: "7",
    title: "数据科学家",
    department: "数据与分析部",
    location: "上海",
    salary: "28k-45k",
  },
  {
    id: "8",
    title: "DevOps工程师",
    department: "基础设施部",
    location: "上海",
    salary: "25k-40k",
  },
];

export default function JobsPage() {
  // 使用实时数据Hook
  const { jobs: realtimeJobs, isLoading: realtimeLoading, error: realtimeError } = useRealtimeJobs();

  // 备用状态管理
  const [jobs, setJobs] = useState<(JobWithDepartment | Job)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useStaticData, setUseStaticData] = useState(false);

  // 处理数据源选择
  useEffect(() => {
    if (!realtimeLoading) {
      if (realtimeError || realtimeJobs.length === 0) {
        // 如果实时数据失败或为空，使用静态数据
        setJobs(mockJobs);
        setUseStaticData(true);
      } else {
        // 使用实时数据
        setJobs(realtimeJobs);
        setUseStaticData(false);
      }
      setIsLoading(false);
    }
  }, [realtimeJobs, realtimeLoading, realtimeError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col items-center justify-between gap-4 mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            探索我们的工作机会
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            寻找最适合您的岗位，与我们一起成长。
          </p>
          <div className="w-24 h-1 bg-blue-600 rounded-full mt-2"></div>
        </div>

        {/* 显示数据来源提示 */}
        {useStaticData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-600 text-sm">
                ⚠️ 正在使用演示数据，实际职位信息请联系HR
              </div>
            </div>
          </div>
        )}

        {/* 通知横幅 */}
        <NotificationBanner />

        {/* 招聘统计面板 */}
        <RecruitmentStats jobs={jobs} />

        {/* 集成搜索功能 */}
        <JobSearch jobs={jobs} isLoading={isLoading} />
      </main>
    </div>
  );
} 