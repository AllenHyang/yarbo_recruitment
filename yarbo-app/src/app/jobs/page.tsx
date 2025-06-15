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



export default function JobsPage() {
  // 使用实时数据Hook
  const { jobs: realtimeJobs, isLoading: realtimeLoading, error: realtimeError } = useRealtimeJobs();

  // 只使用真实数据
  const jobs: JobWithDepartment[] = realtimeJobs;
  const isLoading = realtimeLoading;

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

        {/* 显示错误信息 */}
        {realtimeError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                ⚠️ 获取职位数据失败: {realtimeError}
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