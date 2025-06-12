/*
 * @Author: Allen
 * @Date: 2025-01-27
 * @LastEditors: Allen
 * @LastEditTime: 2025-01-27
 * @FilePath: /yarbo_招聘/yarbo-app/src/lib/interview-scheduling.ts
 * @Description: 智能面试调度算法和工具函数
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

// 时间段接口
export interface TimeSlot {
  start_time: string; // HH:mm 格式
  end_time: string;
  date: string; // YYYY-MM-DD 格式
}

// 面试官可用时间
export interface InterviewerAvailability {
  id: string;
  interviewer_id: string;
  interviewer_name: string;
  date: string;
  time_slots: {
    start_time: string;
    end_time: string;
    is_available: boolean;
    max_interviews: number;
    current_interviews: number;
  }[];
  skills: string[];
  interview_types: string[];
  workload_score: number; // 0-100，当前工作负载
}

// 调度约束条件
export interface SchedulingConstraints {
  interview_duration: number; // 分钟
  interview_type: 'phone' | 'video' | 'onsite' | 'technical';
  required_skills?: string[];
  preferred_interviewers?: string[];
  candidate_preferences?: TimeSlot[];
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  buffer_time: number; // 面试间隔缓冲时间（分钟）
}

// 调度选项
export interface SchedulingOption {
  date: string;
  start_time: string;
  end_time: string;
  interviewer_ids: string[];
  interviewer_names: string[];
  meeting_room_id?: string;
  meeting_room_name?: string;
  confidence_score: number; // 0-100
  conflict_risks: string[];
  scheduling_notes: string[];
}

// 调度结果
export interface SchedulingResult {
  success: boolean;
  recommended_slots: SchedulingOption[];
  alternative_options: SchedulingOption[];
  total_options: number;
  scheduling_summary: {
    best_score: number;
    average_score: number;
    total_conflicts: number;
    recommendations: string[];
  };
}

/**
 * 智能面试调度主算法
 */
export class SmartInterviewScheduler {
  private interviewers: InterviewerAvailability[] = [];
  private meetingRooms: any[] = [];
  private existingInterviews: any[] = [];

  constructor(
    interviewers: InterviewerAvailability[],
    meetingRooms: any[] = [],
    existingInterviews: any[] = []
  ) {
    this.interviewers = interviewers;
    this.meetingRooms = meetingRooms;
    this.existingInterviews = existingInterviews;
  }

  /**
   * 生成智能调度推荐
   */
  public generateScheduleRecommendations(
    constraints: SchedulingConstraints,
    candidatePreferences?: TimeSlot[]
  ): SchedulingResult {
    try {
      // 1. 筛选合适的面试官
      const suitableInterviewers = this.filterSuitableInterviewers(constraints);
      
      if (suitableInterviewers.length === 0) {
        return {
          success: false,
          recommended_slots: [],
          alternative_options: [],
          total_options: 0,
          scheduling_summary: {
            best_score: 0,
            average_score: 0,
            total_conflicts: 0,
            recommendations: ['没有找到合适的面试官，请检查技能要求或扩大时间范围']
          }
        };
      }

      // 2. 生成所有可能的时间组合
      const possibleSlots = this.generatePossibleTimeSlots(
        suitableInterviewers,
        constraints,
        candidatePreferences
      );

      // 3. 评分和排序
      const scoredOptions = possibleSlots.map(slot => ({
        ...slot,
        confidence_score: this.calculateSchedulingScore(slot, constraints)
      })).sort((a, b) => b.confidence_score - a.confidence_score);

      // 4. 分类推荐和备选方案
      const recommended = scoredOptions.filter(option => option.confidence_score >= 70);
      const alternatives = scoredOptions.filter(option => 
        option.confidence_score >= 50 && option.confidence_score < 70
      );

      // 5. 生成调度总结
      const summary = this.generateSchedulingSummary(scoredOptions, constraints);

      return {
        success: true,
        recommended_slots: recommended.slice(0, 5), // 最多5个推荐
        alternative_options: alternatives.slice(0, 3), // 最多3个备选
        total_options: scoredOptions.length,
        scheduling_summary: summary
      };

    } catch (error) {
      console.error('调度算法错误:', error);
      return {
        success: false,
        recommended_slots: [],
        alternative_options: [],
        total_options: 0,
        scheduling_summary: {
          best_score: 0,
          average_score: 0,
          total_conflicts: 0,
          recommendations: ['调度算法执行失败，请重试']
        }
      };
    }
  }

  /**
   * 筛选合适的面试官
   */
  private filterSuitableInterviewers(constraints: SchedulingConstraints): InterviewerAvailability[] {
    return this.interviewers.filter(interviewer => {
      // 检查面试类型匹配
      if (!interviewer.interview_types.includes(constraints.interview_type)) {
        return false;
      }

      // 检查技能匹配
      if (constraints.required_skills && constraints.required_skills.length > 0) {
        const hasRequiredSkills = constraints.required_skills.some(skill =>
          interviewer.skills.includes(skill)
        );
        if (!hasRequiredSkills) {
          return false;
        }
      }

      // 检查工作负载
      if (interviewer.workload_score > 90) {
        return false; // 工作负载过高
      }

      return true;
    });
  }

  /**
   * 生成可能的时间段
   */
  private generatePossibleTimeSlots(
    interviewers: InterviewerAvailability[],
    constraints: SchedulingConstraints,
    candidatePreferences?: TimeSlot[]
  ): SchedulingOption[] {
    const options: SchedulingOption[] = [];
    const durationMinutes = constraints.interview_duration;
    const bufferMinutes = constraints.buffer_time;

    // 获取未来7天的日期
    const dates = this.getNextWeekDates();

    for (const date of dates) {
      for (const interviewer of interviewers) {
        const dayAvailability = interviewer.time_slots;

        for (const slot of dayAvailability) {
          if (!slot.is_available || slot.current_interviews >= slot.max_interviews) {
            continue;
          }

          // 生成该时间段内的所有可能面试时间
          const possibleTimes = this.generateTimeSlots(
            slot.start_time,
            slot.end_time,
            durationMinutes,
            bufferMinutes
          );

          for (const timeSlot of possibleTimes) {
            // 检查是否与候选人偏好匹配
            const matchesPreference = !candidatePreferences || 
              candidatePreferences.some(pref => 
                pref.date === date && 
                this.timeOverlaps(timeSlot, { start_time: pref.start_time, end_time: pref.end_time })
              );

            if (matchesPreference) {
              options.push({
                date,
                start_time: timeSlot.start_time,
                end_time: timeSlot.end_time,
                interviewer_ids: [interviewer.interviewer_id],
                interviewer_names: [interviewer.interviewer_name],
                confidence_score: 0, // 稍后计算
                conflict_risks: [],
                scheduling_notes: []
              });
            }
          }
        }
      }
    }

    return options;
  }

  /**
   * 计算调度评分
   */
  private calculateSchedulingScore(option: SchedulingOption, constraints: SchedulingConstraints): number {
    let score = 100;
    const factors: { name: string; weight: number; value: number }[] = [];

    // 1. 时间偏好匹配 (30%)
    const timePreferenceScore = this.calculateTimePreferenceScore(option);
    factors.push({ name: '时间偏好', weight: 0.3, value: timePreferenceScore });

    // 2. 面试官工作量平衡 (25%)
    const workloadScore = this.calculateWorkloadScore(option);
    factors.push({ name: '工作量平衡', weight: 0.25, value: workloadScore });

    // 3. 紧急程度匹配 (20%)
    const urgencyScore = this.calculateUrgencyScore(option, constraints.urgency_level);
    factors.push({ name: '紧急程度', weight: 0.2, value: urgencyScore });

    // 4. 冲突风险 (15%)
    const conflictScore = this.calculateConflictScore(option);
    factors.push({ name: '冲突风险', weight: 0.15, value: conflictScore });

    // 5. 资源利用效率 (10%)
    const efficiencyScore = this.calculateEfficiencyScore(option);
    factors.push({ name: '资源效率', weight: 0.1, value: efficiencyScore });

    // 计算加权总分
    score = factors.reduce((total, factor) => {
      return total + (factor.value * factor.weight);
    }, 0);

    // 添加调度说明
    option.scheduling_notes = factors.map(factor => 
      `${factor.name}: ${factor.value.toFixed(1)}分 (权重${(factor.weight * 100).toFixed(0)}%)`
    );

    return Math.round(score);
  }

  /**
   * 时间偏好评分
   */
  private calculateTimePreferenceScore(option: SchedulingOption): number {
    const hour = parseInt(option.start_time.split(':')[0]);
    
    // 上午9-11点和下午2-4点为最佳时间
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16)) {
      return 100;
    }
    // 上午8-9点和下午4-5点为良好时间
    if ((hour >= 8 && hour < 9) || (hour >= 16 && hour <= 17)) {
      return 80;
    }
    // 其他时间为一般
    return 60;
  }

  /**
   * 工作量平衡评分
   */
  private calculateWorkloadScore(option: SchedulingOption): number {
    // 获取面试官当前工作负载
    const interviewer = this.interviewers.find(i => 
      i.interviewer_id === option.interviewer_ids[0]
    );
    
    if (!interviewer) return 50;
    
    // 工作负载越低，评分越高
    return 100 - interviewer.workload_score;
  }

  /**
   * 紧急程度评分
   */
  private calculateUrgencyScore(option: SchedulingOption, urgency: string): number {
    const today = new Date();
    const optionDate = new Date(option.date);
    const daysDiff = Math.ceil((optionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    switch (urgency) {
      case 'urgent':
        return daysDiff <= 1 ? 100 : Math.max(0, 100 - daysDiff * 20);
      case 'high':
        return daysDiff <= 3 ? 100 : Math.max(0, 100 - daysDiff * 10);
      case 'medium':
        return daysDiff <= 7 ? 100 : Math.max(0, 100 - daysDiff * 5);
      case 'low':
        return daysDiff <= 14 ? 100 : 80;
      default:
        return 80;
    }
  }

  /**
   * 冲突风险评分
   */
  private calculateConflictScore(option: SchedulingOption): number {
    // 检查是否有时间冲突
    const conflicts = this.detectTimeConflicts(option);
    option.conflict_risks = conflicts;
    
    // 冲突越少，评分越高
    return Math.max(0, 100 - conflicts.length * 25);
  }

  /**
   * 资源效率评分
   */
  private calculateEfficiencyScore(option: SchedulingOption): number {
    // 简单的效率评分，可以根据会议室利用率等因素优化
    return 80;
  }

  /**
   * 检测时间冲突
   */
  private detectTimeConflicts(option: SchedulingOption): string[] {
    const conflicts: string[] = [];
    
    // 检查与现有面试的冲突
    for (const existing of this.existingInterviews) {
      if (existing.date === option.date && 
          existing.interviewer_ids.some((id: string) => option.interviewer_ids.includes(id))) {
        
        if (this.timeOverlaps(
          { start_time: option.start_time, end_time: option.end_time },
          { start_time: existing.start_time, end_time: existing.end_time }
        )) {
          conflicts.push(`与现有面试时间冲突 (${existing.start_time}-${existing.end_time})`);
        }
      }
    }

    return conflicts;
  }

  /**
   * 检查时间重叠
   */
  private timeOverlaps(slot1: { start_time: string; end_time: string }, 
                      slot2: { start_time: string; end_time: string }): boolean {
    const start1 = this.timeToMinutes(slot1.start_time);
    const end1 = this.timeToMinutes(slot1.end_time);
    const start2 = this.timeToMinutes(slot2.start_time);
    const end2 = this.timeToMinutes(slot2.end_time);

    return start1 < end2 && start2 < end1;
  }

  /**
   * 时间转换为分钟数
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 分钟数转换为时间
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * 生成时间段
   */
  private generateTimeSlots(startTime: string, endTime: string, duration: number, buffer: number): 
    { start_time: string; end_time: string }[] {
    const slots = [];
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    for (let current = startMinutes; current + duration <= endMinutes; current += duration + buffer) {
      slots.push({
        start_time: this.minutesToTime(current),
        end_time: this.minutesToTime(current + duration)
      });
    }
    
    return slots;
  }

  /**
   * 获取未来一周的日期
   */
  private getNextWeekDates(): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  /**
   * 生成调度总结
   */
  private generateSchedulingSummary(options: SchedulingOption[], constraints: SchedulingConstraints) {
    const scores = options.map(o => o.confidence_score);
    const bestScore = Math.max(...scores, 0);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const totalConflicts = options.reduce((total, option) => total + option.conflict_risks.length, 0);

    const recommendations = [];
    
    if (bestScore < 50) {
      recommendations.push('建议扩大时间范围或增加面试官资源');
    }
    if (totalConflicts > options.length * 0.3) {
      recommendations.push('检测到较多时间冲突，建议优化面试官时间安排');
    }
    if (options.length < 3) {
      recommendations.push('可选时间段较少，建议放宽约束条件');
    }
    if (recommendations.length === 0) {
      recommendations.push('调度方案质量良好，可以选择推荐时间段');
    }

    return {
      best_score: bestScore,
      average_score: Math.round(averageScore),
      total_conflicts: totalConflicts,
      recommendations
    };
  }
}
