/*
 * @Author: Allen
 * @Date: 2025-06-09 09:00:00
 * @LastEditors: Allen
 * @LastEditTime: 2025-06-09 09:00:00
 * @FilePath: /yarbo_招聘/yarbo-app/src/components/JobSearch.tsx
 * @Description: 智能职位搜索组件
 * 
 * Copyright (c) 2025 by Yarbo Inc., All Rights Reserved. 
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import type { Job } from "@/components/JobCard";
import type { JobWithDepartment } from "@/lib/database.types";
import { 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  DollarSign, 
  X,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";

interface JobSearchProps {
  jobs: (JobWithDepartment | Job)[];
  isLoading?: boolean;
}

interface SearchFilters {
  keyword: string;
  location: string;
  department: string;
  salaryRange: string;
}

export function JobSearch({ jobs, isLoading = false }: JobSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: "",
    location: "",
    department: "",
    salaryRange: ""
  });
  
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 提取唯一的地点和部门选项
  const { locations, departments, salaryRanges } = useMemo(() => {
    const locationSet = new Set<string>();
    const departmentSet = new Set<string>();
    const salarySet = new Set<string>();

    jobs.forEach(job => {
      if (job.location) locationSet.add(job.location);
      
      if ('departments' in job && job.departments?.name) {
        departmentSet.add(job.departments.name);
      } else if ('department' in job && job.department) {
        departmentSet.add(job.department);
      }
      
      if ('salary_display' in job && job.salary_display) {
        salarySet.add(job.salary_display);
      } else if ('salary' in job && job.salary) {
        salarySet.add(job.salary);
      }
    });

    return {
      locations: Array.from(locationSet).sort(),
      departments: Array.from(departmentSet).sort(),
      salaryRanges: ["0-10k", "10k-20k", "20k-30k", "30k-50k", "50k+"]
    };
  }, [jobs]);

  // 搜索建议
  const searchSuggestions = useMemo(() => {
    if (!filters.keyword || filters.keyword.length < 2) return [];
    
    const suggestions: string[] = [];
    const keyword = filters.keyword.toLowerCase();
    
    // 基于职位标题的建议
    jobs.forEach(job => {
      if (job.title.toLowerCase().includes(keyword)) {
        const words = job.title.split(' ');
        words.forEach(word => {
          if (word.toLowerCase().includes(keyword) && word.length > 2) {
            if (!suggestions.includes(word) && suggestions.length < 5) {
              suggestions.push(word);
            }
          }
        });
      }
    });

    return suggestions;
  }, [filters.keyword, jobs]);

  // 筛选后的职位
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 关键词搜索
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const titleMatch = job.title.toLowerCase().includes(keyword);
        const departmentMatch = ('departments' in job && job.departments?.name?.toLowerCase().includes(keyword)) ||
                               ('department' in job && job.department?.toLowerCase().includes(keyword));
        
        if (!titleMatch && !departmentMatch) return false;
      }

      // 地点筛选
      if (filters.location && job.location !== filters.location) {
        return false;
      }

      // 部门筛选
      if (filters.department) {
        const jobDepartment = ('departments' in job && job.departments?.name) || 
                             ('department' in job && job.department);
        if (jobDepartment !== filters.department) {
          return false;
        }
      }

      // 薪资筛选 (简化实现)
      if (filters.salaryRange) {
        // 这里可以实现更复杂的薪资范围匹配逻辑
        // 暂时跳过，因为需要解析薪资字符串
      }

      return true;
    });
  }, [jobs, filters]);

  const handleSearch = (keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
    
    // 添加到搜索历史
    if (keyword && !searchHistory.includes(keyword)) {
      setSearchHistory(prev => [keyword, ...prev.slice(0, 4)]);
    }
    
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      location: "",
      department: "",
      salaryRange: ""
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 主搜索框 */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索职位、公司或技能..."
                  value={filters.keyword}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, keyword: e.target.value }));
                    setShowSuggestions(true);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(filters.keyword);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-4 h-12 text-base"
                />
              </div>

              {/* 搜索建议 */}
              {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && (
                <Card className="absolute top-14 left-0 right-0 z-50 shadow-lg border">
                  <CardContent className="p-3">
                    {searchSuggestions.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          搜索建议
                        </div>
                        <div className="space-y-1">
                          {searchSuggestions.map(suggestion => (
                            <button
                              key={suggestion}
                              onClick={() => handleSearch(suggestion)}
                              className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-50 rounded"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchHistory.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          最近搜索
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {searchHistory.map(term => (
                            <Badge
                              key={term}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleSearch(term)}
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 筛选器 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 地点筛选 */}
              <Select value={filters.location} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, location: value === "all" ? "" : value }))
              }>
                <SelectTrigger className="h-10">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="所有地点" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有地点</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 部门筛选 */}
              <Select value={filters.department} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, department: value === "all" ? "" : value }))
              }>
                <SelectTrigger className="h-10">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="所有部门" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有部门</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department} value={department}>{department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 薪资范围 */}
              <Select value={filters.salaryRange} onValueChange={(value) => 
                setFilters(prev => ({ ...prev, salaryRange: value === "all" ? "" : value }))
              }>
                <SelectTrigger className="h-10">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="薪资范围" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限薪资</SelectItem>
                  {salaryRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 搜索/清除按钮 */}
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSearch(filters.keyword)}
                  className="flex-1 h-10"
                >
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="h-10 px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            找到 <span className="font-semibold text-gray-900">{filteredJobs.length}</span> 个职位
          </span>
          
          {hasActiveFilters && (
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600">筛选条件已应用</span>
            </div>
          )}
        </div>

        {/* 排序选项 */}
        <Select defaultValue="latest">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">最新发布</SelectItem>
            <SelectItem value="relevant">相关性</SelectItem>
            <SelectItem value="salary">薪资排序</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 搜索结果 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-48 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              没有找到匹配的职位
            </h3>
            <p className="text-gray-600 mb-4">
              尝试调整搜索条件或筛选器
            </p>
            <Button variant="outline" onClick={clearFilters}>
              清除所有筛选条件
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 点击外部关闭建议 */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
} 