'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
  });

  const handleSubmit = () => {
    console.log('提交职位数据:', formData);
    alert('职位创建成功！');
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
                <Input
                  id="location"
                  placeholder="如：北京"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
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

              <Button onClick={handleSubmit} className="w-full btn-hover shadow-lg">
                创建职位
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 