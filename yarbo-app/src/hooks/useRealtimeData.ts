"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  JobWithDepartment,
  Application,
  Applicant,
  Department,
  ApplicationWithDetails
} from '@/lib/database.types';

// 招聘统计数据类型
export interface RecruitmentStats {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  totalHires: number;
  conversionRate: number;
  averageTimeToHire: number;
  applicationToInterviewRate: number;
  interviewToOfferRate: number;
  offerAcceptanceRate: number;
}

// 趋势数据类型
export interface TrendData {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
}

// 部门统计类型
export interface DepartmentStats {
  department: string;
  count: number;
  color: string;
  openPositions: number;
  avgTimeToHire: number;
}

// 实时招聘数据Hook
export function useRealtimeRecruitmentData() {
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取招聘统计数据
  const fetchRecruitmentStats = useCallback(async () => {
    try {
      // 获取申请总数
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // 获取面试数量 (状态为 'interview_scheduled' 或 'interviewed')
      const { count: totalInterviews } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['interview_scheduled', 'interviewed']);

      // 获取录用数量 (状态为 'hired')
      const { count: totalHires } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'hired');

      // 获取offer数量 (状态为 'offer_made')
      const { count: totalOffers } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'offer_made');

      // 计算转化率
      const conversionRate = totalApplications ? Math.round((totalHires! / totalApplications!) * 100) : 0;
      const applicationToInterviewRate = totalApplications ? Math.round((totalInterviews! / totalApplications!) * 100) : 0;
      const interviewToOfferRate = totalInterviews ? Math.round((totalOffers! / totalInterviews!) * 100) : 0;
      const offerAcceptanceRate = totalOffers ? Math.round((totalHires! / totalOffers!) * 100) : 0;

      setStats({
        totalApplications: totalApplications || 0,
        totalInterviews: totalInterviews || 0,
        totalOffers: totalOffers || 0,
        totalHires: totalHires || 0,
        conversionRate,
        averageTimeToHire: 28, // 这个需要复杂计算，暂时使用固定值
        applicationToInterviewRate,
        interviewToOfferRate,
        offerAcceptanceRate
      });

    } catch (err) {
      console.error('获取招聘统计失败:', err);
      setError('获取统计数据失败');
    }
  }, []);

  // 获取趋势数据
  const fetchTrendData = useCallback(async () => {
    try {
      // 获取过去6个月的数据
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: applications } = await supabase
        .from('applications')
        .select('applied_at, status')
        .gte('applied_at', sixMonthsAgo.toISOString());

      if (applications) {
        // 按月分组统计
        const monthlyData: { [key: string]: TrendData } = {};

        applications.forEach(app => {
          const date = new Date(app.applied_at!);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = `${date.getMonth() + 1}月`;

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: monthName,
              applications: 0,
              interviews: 0,
              offers: 0,
              hires: 0
            };
          }

          monthlyData[monthKey].applications++;

          if (['interview_scheduled', 'interviewed'].includes(app.status)) {
            monthlyData[monthKey].interviews++;
          }
          if (app.status === 'offer_made') {
            monthlyData[monthKey].offers++;
          }
          if (app.status === 'hired') {
            monthlyData[monthKey].hires++;
          }
        });

        setTrendData(Object.values(monthlyData).slice(-6));
      }

    } catch (err) {
      console.error('获取趋势数据失败:', err);
    }
  }, []);

  // 获取部门统计 (优化版 - 减少查询次数)
  const fetchDepartmentStats = useCallback(async () => {
    try {
      // 一次性获取所有需要的数据
      const [departmentsResult, jobsResult, applicationsResult] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('jobs').select('department, status').eq('status', 'active'),
        supabase.from('applications').select(`
          status,
          jobs!inner(department)
        `).eq('status', 'hired')
      ]);

      const { data: departments } = departmentsResult;
      const { data: activeJobs } = jobsResult;
      const { data: hiredApplications } = applicationsResult;

      if (departments) {
        // 统计每个部门的职位数
        const jobCountByDept = (activeJobs || []).reduce((acc, job) => {
          acc[job.department] = (acc[job.department] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // 统计每个部门的录用数
        const hireCountByDept = (hiredApplications || []).reduce((acc, app) => {
          const dept = app.jobs?.department;
          if (dept) {
            acc[dept] = (acc[dept] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const colorMap: { [key: string]: string } = {
          'blue': '#3B82F6',
          'green': '#10B981',
          'purple': '#8B5CF6',
          'orange': '#F59E0B',
          'red': '#EF4444'
        };

        const departmentStatsData: DepartmentStats[] = departments.map(dept => ({
          department: dept.name,
          count: hireCountByDept[dept.name] || 0,
          color: colorMap[dept.color_theme] || '#3B82F6',
          openPositions: jobCountByDept[dept.name] || 0,
          avgTimeToHire: Math.floor(Math.random() * 15) + 20 // 模拟数据，实际需要复杂计算
        }));

        setDepartmentStats(departmentStatsData);
      }

    } catch (err) {
      console.error('获取部门统计失败:', err);
    }
  }, []);

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchRecruitmentStats(),
        fetchTrendData(),
        fetchDepartmentStats()
      ]);
    } catch (err) {
      setError('刷新数据失败');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecruitmentStats, fetchTrendData, fetchDepartmentStats]);

  // 初始化数据
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 设置实时订阅
  useEffect(() => {
    // 订阅申请表变化
    const applicationsSubscription = supabase
      .channel('applications_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          // 当申请数据变化时，重新获取统计数据
          fetchRecruitmentStats();
          fetchTrendData();
        }
      )
      .subscribe();

    // 订阅职位表变化
    const jobsSubscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          // 当职位数据变化时，重新获取部门统计
          fetchDepartmentStats();
        }
      )
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
      jobsSubscription.unsubscribe();
    };
  }, [fetchRecruitmentStats, fetchTrendData, fetchDepartmentStats]);

  return {
    stats,
    trendData,
    departmentStats,
    isLoading,
    error,
    refreshData
  };
}

// 缓存管理
const jobsCache = new Map<string, { data: JobWithDepartment[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 实时职位数据Hook (优化版)
export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<JobWithDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'active_jobs';
    const now = Date.now();

    // 检查缓存
    if (!forceRefresh) {
      const cached = jobsCache.get(cacheKey);
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        console.log('使用缓存的职位数据');
        setJobs(cached.data);
        setIsLoading(false);
        setInitialLoadComplete(true);
        return;
      }
    }

    console.log('开始获取职位数据...');
    try {
      setError(null);
      if (!initialLoadComplete) setIsLoading(true); // 只在首次加载时显示loading

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          department,
          location,
          salary_min,
          salary_max,
          salary_display,
          employment_type,
          experience_level,
          description,
          requirements,
          status,
          created_at,
          expires_at,
          job_category,
          graduation_year,
          is_featured,
          campus_specific,
          internship_duration,
          internship_type,
          start_date,
          stipend_amount,
          skills_gained,
          is_remote_internship
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase 查询错误:', error);
        throw error;
      }

      // 转换数据格式以匹配 JobWithDepartment 类型
      const jobsWithDepartment = (data || []).map(job => ({
        ...job,
        departments: job.department ? { name: job.department } : null
      }));

      // 更新缓存
      jobsCache.set(cacheKey, { data: jobsWithDepartment as JobWithDepartment[], timestamp: now });

      console.log(`获取到 ${jobsWithDepartment.length} 个职位`);
      setJobs(jobsWithDepartment as JobWithDepartment[]);
      setInitialLoadComplete(true);
    } catch (err) {
      console.error('获取职位数据失败:', err);
      setError(err instanceof Error ? err.message : '获取职位数据失败');
      setInitialLoadComplete(true);
    } finally {
      setIsLoading(false);
    }
  }, [jobs.length]);

  useEffect(() => {
    fetchJobs();

    // 优化的实时订阅 - 使用防抖
    let debounceTimer: NodeJS.Timeout;
    const subscription = supabase
      .channel('jobs_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          // 防抖处理，避免频繁刷新
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchJobs(true); // 强制刷新缓存
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      subscription.unsubscribe();
    };
  }, [fetchJobs]);

  return { jobs, isLoading, error, refreshJobs: (force = false) => fetchJobs(force) };
}
