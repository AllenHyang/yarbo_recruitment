"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Eye, ArrowLeft, Briefcase, Building2, DollarSign, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  requirements: string[];
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  benefits: string[];
  priority: number;
  deadline: string;
  is_remote_allowed: boolean;
  travel_required: boolean;
  status: 'draft' | 'published';
}

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: '',
    employment_type: 'full_time',
    experience_level: 'mid',
    description: '',
    requirements: [],
    salary_min: '',
    salary_max: '',
    salary_currency: 'CNY',
    benefits: [],
    priority: 3,
    deadline: '',
    is_remote_allowed: false,
    travel_required: false,
    status: 'draft'
  });

  const updateFormData = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (publishImmediately = false) => {
    if (!user) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
        status: publishImmediately ? 'published' : formData.status
      };

      const response = await fetch('/api/hr/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '职位创建失败');
      }

      alert('职位创建成功！');
      router.push('/hr/jobs');
    } catch (error) {
      console.error('创建职位失败:', error);
      alert('创建失败: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">发布新职位</h1>
              <p className="text-gray-600">创建一个新的招聘职位</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">职位信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">职位名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="如：高级前端工程师"
                  className="border-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">所属部门 *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                  placeholder="如：技术部"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">工作地点 *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="如：北京、上海、深圳"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">雇佣类型</Label>
                <Select value={formData.employment_type} onValueChange={(value) => updateFormData('employment_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">全职</SelectItem>
                    <SelectItem value="part_time">兼职</SelectItem>
                    <SelectItem value="contract">合同工</SelectItem>
                    <SelectItem value="internship">实习</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">职位描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="详细描述职位职责、工作内容、团队环境等..."
                rows={6}
                className="border-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>最低薪资</Label>
                <Input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => updateFormData('salary_min', e.target.value)}
                  placeholder="最低薪资"
                />
              </div>
              <div className="space-y-2">
                <Label>最高薪资</Label>
                <Input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => updateFormData('salary_max', e.target.value)}
                  placeholder="最高薪资"
                />
              </div>
              <div className="space-y-2">
                <Label>货币单位</Label>
                <Select value={formData.salary_currency} onValueChange={(value) => updateFormData('salary_currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                    <SelectItem value="USD">美元 (USD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={formData.is_remote_allowed}
                  onCheckedChange={(checked) => updateFormData('is_remote_allowed', checked)}
                />
                <Label htmlFor="remote">支持远程工作</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="travel"
                  checked={formData.travel_required}
                  onCheckedChange={(checked) => updateFormData('travel_required', checked)}
                />
                <Label htmlFor="travel">需要出差</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3 mt-8">
          <Button 
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading || !formData.title || !formData.department || !formData.location}
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </Button>
          <Button 
            onClick={() => handleSubmit(true)}
            disabled={loading || !formData.title || !formData.department || !formData.location}
            className="bg-green-600 hover:bg-green-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            发布职位
          </Button>
        </div>
      </div>
    </div>
  );
} 