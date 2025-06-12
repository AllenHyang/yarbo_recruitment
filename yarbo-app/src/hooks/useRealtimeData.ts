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
        .select('created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString());

      if (applications) {
        // 按月分组统计
        const monthlyData: { [key: string]: TrendData } = {};
        
        applications.forEach(app => {
          const date = new Date(app.created_at!);
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

  // 获取部门统计
  const fetchDepartmentStats = useCallback(async () => {
    try {
      // 获取所有部门
      const { data: departments } = await supabase
        .from('departments')
        .select('*');

      if (departments) {
        const departmentStatsData: DepartmentStats[] = [];

        for (const dept of departments) {
          // 获取该部门的职位数
          const { count: openPositions } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('department_id', dept.id)
            .eq('status', 'active');

          // 获取该部门的录用数
          const { data: hiredApplications } = await supabase
            .from('applications')
            .select(`
              *,
              jobs!inner(department_id)
            `)
            .eq('jobs.department_id', dept.id)
            .eq('status', 'hired');

          const colorMap: { [key: string]: string } = {
            'blue': '#3B82F6',
            'green': '#10B981',
            'purple': '#8B5CF6',
            'orange': '#F59E0B',
            'red': '#EF4444'
          };

          departmentStatsData.push({
            department: dept.name,
            count: hiredApplications?.length || 0,
            color: colorMap[dept.color_theme] || '#3B82F6',
            openPositions: openPositions || 0,
            avgTimeToHire: Math.floor(Math.random() * 15) + 20 // 模拟数据，实际需要复杂计算
          });
        }

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

// 实时职位数据Hook
export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<JobWithDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          departments (*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error('获取职位数据失败:', err);
      setError('获取职位数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    // 实时订阅职位变化
    const subscription = supabase
      .channel('jobs_realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchJobs]);

  return { jobs, isLoading, error, refreshJobs: fetchJobs };
}
