"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 颜色配置
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  teal: '#14B8A6'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.purple, COLORS.indigo];

// 申请趋势图表
interface ApplicationTrendProps {
  data: Array<{
    month: string;
    applications: number;
    interviews: number;
    offers: number;
  }>;
}

export const ApplicationTrendChart: React.FC<ApplicationTrendProps> = ({ data }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">申请趋势分析</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="applications"
              stroke={COLORS.primary}
              strokeWidth={2}
              name="申请数量"
            />
            <Line
              type="monotone"
              dataKey="interviews"
              stroke={COLORS.secondary}
              strokeWidth={2}
              name="面试数量"
            />
            <Line
              type="monotone"
              dataKey="offers"
              stroke={COLORS.accent}
              strokeWidth={2}
              name="录用数量"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 部门分布饼图
interface DepartmentDistributionProps {
  data: Array<{
    department: string;
    count: number;
    color: string;
  }>;
}

export const DepartmentDistributionChart: React.FC<DepartmentDistributionProps> = ({ data }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">部门招聘分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 转化率漏斗图
interface ConversionFunnelProps {
  data: Array<{
    stage: string;
    count: number;
    rate: number;
  }>;
}

export const ConversionFunnelChart: React.FC<ConversionFunnelProps> = ({ data }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">招聘转化率</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={80} />
            <Tooltip formatter={(value, name) => [value, name === 'count' ? '人数' : '转化率']} />
            <Bar dataKey="count" fill={COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 候选人技能雷达图
interface SkillRadarProps {
  data: Array<{
    skill: string;
    score: number;
    fullMark: number;
  }>;
  candidateName: string;
}

export const SkillRadarChart: React.FC<SkillRadarProps> = ({ data, candidateName }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{candidateName} - 技能评估</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="技能分数"
              dataKey="score"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 月度招聘统计柱状图
interface MonthlyStatsProps {
  data: Array<{
    month: string;
    applications: number;
    hires: number;
    rejections: number;
  }>;
}

export const MonthlyStatsChart: React.FC<MonthlyStatsProps> = ({ data }) => {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">月度招聘统计</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" fill={COLORS.primary} name="申请数" />
            <Bar dataKey="hires" fill={COLORS.secondary} name="录用数" />
            <Bar dataKey="rejections" fill={COLORS.danger} name="拒绝数" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// 招聘效率仪表盘
interface EfficiencyDashboardProps {
  metrics: {
    averageTimeToHire: number;
    applicationToInterviewRate: number;
    interviewToOfferRate: number;
    offerAcceptanceRate: number;
  };
}

export const EfficiencyDashboard: React.FC<EfficiencyDashboardProps> = ({ metrics }) => {
  const gaugeData = [
    { name: '申请转面试率', value: metrics.applicationToInterviewRate, color: COLORS.primary },
    { name: '面试转录用率', value: metrics.interviewToOfferRate, color: COLORS.secondary },
    { name: 'Offer接受率', value: metrics.offerAcceptanceRate, color: COLORS.accent },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">招聘效率指标</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.averageTimeToHire}</div>
              <div className="text-sm text-gray-600">平均招聘周期（天）</div>
            </div>
          </div>
          <div className="space-y-3">
            {gaugeData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 组件已经在上面单独导出，不需要重复导出
