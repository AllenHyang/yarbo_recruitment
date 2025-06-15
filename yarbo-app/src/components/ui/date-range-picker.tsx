/*
 * @Author: Allen
 * @Date: 2025-06-10 12:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-10 12:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/ui/date-range-picker.tsx
 * @Description: 简化版日期范围选择器组件
 *
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved.
 */

"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

// 简化的日期范围类型
export interface DateRange {
  from?: Date;
  to?: Date;
}

interface DatePickerWithRangeProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePickerWithRange({
  date,
  onDateChange,
  placeholder = "选择日期范围",
  className,
  disabled = false
}: DatePickerWithRangeProps) {
  const [fromDate, setFromDate] = useState(date?.from?.toISOString().split('T')[0] || '');
  const [toDate, setToDate] = useState(date?.to?.toISOString().split('T')[0] || '');

  const handleFromDateChange = (value: string) => {
    setFromDate(value);
    const from = value ? new Date(value) : undefined;
    const to = toDate ? new Date(toDate) : undefined;
    onDateChange?.({ from, to });
  };

  const handleToDateChange = (value: string) => {
    setToDate(value);
    const from = fromDate ? new Date(fromDate) : undefined;
    const to = value ? new Date(value) : undefined;
    onDateChange?.({ from, to });
  };

  const clearDates = () => {
    setFromDate('');
    setToDate('');
    onDateChange?.(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            placeholder="开始日期"
            disabled={disabled}
          />
        </div>
        <span className="text-gray-500">至</span>
        <div className="flex-1">
          <Input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            placeholder="结束日期"
            disabled={disabled}
            min={fromDate}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={clearDates}
          disabled={disabled || (!fromDate && !toDate)}
        >
          清除
        </Button>
      </div>
    </div>
  );
}

// 预设日期范围
export const DATE_RANGE_PRESETS = {
  today: {
    label: '今天',
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  last7Days: {
    label: '最近7天',
    getValue: () => {
      const today = new Date();
      const last7Days = new Date();
      last7Days.setDate(today.getDate() - 6);
      return { from: last7Days, to: today };
    }
  },
  last30Days: {
    label: '最近30天',
    getValue: () => {
      const today = new Date();
      const last30Days = new Date();
      last30Days.setDate(today.getDate() - 29);
      return { from: last30Days, to: today };
    }
  },
  thisMonth: {
    label: '本月',
    getValue: () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: firstDay, to: lastDay };
    }
  }
};
