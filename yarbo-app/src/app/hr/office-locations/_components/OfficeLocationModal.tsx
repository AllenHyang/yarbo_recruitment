'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Loader2 } from "lucide-react";
import { officeLocationApi } from "@/lib/api-client";
import type { OfficeLocation } from "@/lib/database.types";

interface OfficeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: OfficeLocation | null;
}

const commonFacilities = [
  '会议室', '咖啡厅', '健身房', '停车场', '食堂', '休息区',
  '实验室', '图书馆', '医务室', '打印室', '茶水间', '阳台',
  '在线协作工具', '弹性工作时间', '视频会议设备'
];

const timezones = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: '香港时间 (UTC+8)' },
  { value: 'Asia/Taipei', label: '台北时间 (UTC+8)' },
  { value: 'Asia/Tokyo', label: '日本时间 (UTC+9)' },
  { value: 'Asia/Seoul', label: '韩国时间 (UTC+9)' },
  { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)' },
  { value: 'America/New_York', label: '美国东部时间 (UTC-5)' },
  { value: 'America/Los_Angeles', label: '美国西部时间 (UTC-8)' },
  { value: 'Europe/London', label: '英国时间 (UTC+0)' },
];

export function OfficeLocationModal({ isOpen, onClose, location }: OfficeLocationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    country: '中国',
    postal_code: '',
    phone: '',
    email: '',
    capacity: '',
    facilities: [] as string[],
    timezone: 'Asia/Shanghai',
    is_active: true,
    is_remote: false,
    description: ''
  });
  const [newFacility, setNewFacility] = useState('');

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        province: location.province || '',
        country: location.country || '中国',
        postal_code: location.postal_code || '',
        phone: location.phone || '',
        email: location.email || '',
        capacity: location.capacity?.toString() || '',
        facilities: location.facilities || [],
        timezone: location.timezone || 'Asia/Shanghai',
        is_active: location.is_active !== false,
        is_remote: location.is_remote || false,
        description: location.description || ''
      });
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        province: '',
        country: '中国',
        postal_code: '',
        phone: '',
        email: '',
        capacity: '',
        facilities: [],
        timezone: 'Asia/Shanghai',
        is_active: true,
        is_remote: false,
        description: ''
      });
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (location) {
        await officeLocationApi.update(location.id, submitData);
      } else {
        await officeLocationApi.create(submitData);
      }

      onClose();
    } catch (error) {
      console.error('保存办公地点失败:', error);
      alert('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const addFacility = (facility: string) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
    }
    setNewFacility('');
  };

  const removeFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facility)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {location ? '编辑办公地点' : '添加办公地点'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">地点名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="如：深圳总部"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city">城市 *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="如：深圳"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">省份/州</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="如：广东省"
                />
              </div>
              <div>
                <Label htmlFor="country">国家</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="如：中国"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">详细地址</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="如：华南数字谷L栋"
                rows={2}
              />
            </div>
          </div>

          {/* 联系信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">联系信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="如：010-12345678"
                />
              </div>
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="如：beijing@yarbo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal_code">邮政编码</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="如：100000"
                />
              </div>
              <div>
                <Label htmlFor="capacity">容量（人数）</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="如：100"
                />
              </div>
            </div>
          </div>

          {/* 设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">设置</h3>

            <div>
              <Label htmlFor="timezone">时区</Label>
              <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">启用此地点</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_remote: checked }))}
                />
                <Label htmlFor="is_remote">远程办公</Label>
              </div>
            </div>
          </div>

          {/* 设施 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">设施</h3>

            <div className="space-y-2">
              <Label>常用设施</Label>
              <div className="flex flex-wrap gap-2">
                {commonFacilities.map((facility) => (
                  <Button
                    key={facility}
                    type="button"
                    variant={formData.facilities.includes(facility) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (formData.facilities.includes(facility)) {
                        removeFacility(facility);
                      } else {
                        addFacility(facility);
                      }
                    }}
                  >
                    {facility}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>自定义设施</Label>
              <div className="flex gap-2">
                <Input
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="输入设施名称"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFacility(newFacility);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addFacility(newFacility)}
                  disabled={!newFacility}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {formData.facilities.length > 0 && (
              <div className="space-y-2">
                <Label>已选设施</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.facilities.map((facility) => (
                    <Badge key={facility} variant="secondary" className="flex items-center gap-1">
                      {facility}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeFacility(facility)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 描述 */}
          <div>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="地点的详细描述..."
              rows={3}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {location ? '更新' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
