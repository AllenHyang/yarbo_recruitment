'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { withRoleBasedAccess } from "@/components/withProtected";
import { supabase } from '@/lib/supabase';
import { officeLocationApi } from '@/lib/api-client';
import type { OfficeLocation } from '@/lib/database.types';


function CreateJobPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location_id: '',
    description: '',
  });

  // 获取办公地点列表
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await officeLocationApi.getPublic({ include_remote: true });
        if (response.success) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('获取办公地点失败:', error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  const handleSubmit = async () => {
    // 验证必要字段
    if (!formData.title || !formData.department || !formData.location_id || !formData.description) {
      alert('请填写所有必要字段');
      return;
    }

    setIsLoading(true);
    try {
      console.log('提交数据:', {
        title: formData.title,
        department: formData.department,
        location_id: formData.location_id,
        description: formData.description,
        employment_type: 'full-time',
        requirements: []
      });

      // 获取认证令牌
      const token = session?.access_token;
      if (!token) {
        alert('认证令牌缺失，请重新登录');
        return;
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          location_id: formData.location_id,
          description: formData.description,
          employment_type: 'full-time',
          requirements: []
        }),
      });

      console.log('响应状态:', response.status);
      const result = await response.json();
      console.log('响应结果:', result);

      if (!response.ok) {
        throw new Error(result.error || '职位创建失败');
      }

      alert('职位创建成功！');

      // 跳转到职位列表页面
      router.push('/hr/jobs');
    } catch (error) {
      console.error('创建职位失败:', error);
      alert('创建失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto fade-in">
          <div className="flex items-center space-x-4 mb-8">
            <Link href="/hr/dashboard">
              <Button variant="outline" size="sm" className="btn-hover">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-4xl font-bold gradient-text">发布新职位</h1>
          </div>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">职位名称</Label>
                <Input
                  id="title"
                  placeholder="如：高级前端工程师"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="department">所属部门</Label>
                <Input
                  id="department"
                  placeholder="如：技术部"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">工作地点</Label>
                {loadingLocations ? (
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-500">加载地点...</span>
                  </div>
                ) : (
                  <Select value={formData.location_id} onValueChange={(value) => setFormData(prev => ({ ...prev, location_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择工作地点" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} - {location.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="description">职位描述</Label>
                <Textarea
                  id="description"
                  placeholder="详细描述工作内容..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.title || !formData.department || !formData.location_id || !formData.description}
                className="w-full btn-hover shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建职位'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 使用权限保护包装组件
export default withRoleBasedAccess(CreateJobPage);