'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Loader2,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Users,
  Clock
} from "lucide-react";
import Link from "next/link";
import { withProtected } from "@/components/withProtected";
import type { OfficeLocation } from "@/lib/database.types";
import { OfficeLocationModal } from "./_components/OfficeLocationModal";
import { DeleteOfficeLocationDialog } from "./_components/DeleteOfficeLocationDialog";
import { officeLocationApi } from "@/lib/api-client";

interface OfficeLocationWithStats extends OfficeLocation {
  jobCount?: number;
}

function OfficeLocationsPage() {
  const [locations, setLocations] = useState<OfficeLocationWithStats[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<OfficeLocationWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<OfficeLocationWithStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLocations = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await officeLocationApi.getAll({ include_inactive: true });
      if (response.success) {
        setLocations(response.data.locations);
        setFilteredLocations(response.data.locations);
      }
    } catch (error) {
      console.error('获取办公地点失败:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredLocations(filtered);
  }, [searchTerm, locations]);

  const handleEdit = (location: OfficeLocationWithStats) => {
    setSelectedLocation(location);
    setShowModal(true);
  };

  const handleDelete = (location: OfficeLocationWithStats) => {
    setSelectedLocation(location);
    setShowDeleteDialog(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedLocation(null);
    fetchLocations(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    setSelectedLocation(null);
    fetchLocations(true);
  };

  const getLocationTypeColor = (isRemote: boolean) => {
    return isRemote ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* 页面标题 */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">办公地点管理</h1>
                <p className="text-gray-600">管理公司的办公地点和工作场所</p>
              </div>
            </div>
          </header>

          {/* 操作栏 */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索地点名称、城市或地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchLocations(true)}
                variant="outline"
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>添加地点</span>
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总地点数</p>
                    <p className="text-3xl font-bold text-blue-600">{locations.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">活跃地点</p>
                    <p className="text-3xl font-bold text-green-600">
                      {locations.filter(l => l.is_active).length}
                    </p>
                  </div>
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">实体办公室</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {locations.filter(l => !l.is_remote).length}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">远程办公</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {locations.filter(l => l.is_remote).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 地点列表 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>办公地点列表</span>
                <Badge variant="secondary">{filteredLocations.length} 个地点</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLocations.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? '没有找到匹配的办公地点' : '暂无办公地点'}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setShowModal(true)}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      添加第一个地点
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLocations.map((location) => (
                    <Card key={location.id} className="hover:shadow-md transition-all duration-300 border border-gray-100">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* 地点标题和状态 */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {location.name}
                              </h3>
                              <p className="text-sm text-gray-600 flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {location.city}
                                {location.province && `, ${location.province}`}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={getStatusColor(location.is_active)}>
                                {location.is_active ? '活跃' : '停用'}
                              </Badge>
                              <Badge className={getLocationTypeColor(location.is_remote)}>
                                {location.is_remote ? '远程' : '实体'}
                              </Badge>
                            </div>
                          </div>

                          {/* 地址信息 */}
                          {location.address && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {location.address}
                            </p>
                          )}

                          {/* 联系信息 */}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {location.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {location.phone}
                              </div>
                            )}
                            {location.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {location.email}
                              </div>
                            )}
                            {location.capacity && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                容量: {location.capacity}人
                              </div>
                            )}
                          </div>

                          {/* 设施标签 */}
                          {location.facilities && location.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {location.facilities.map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* 操作按钮 */}
                          <div className="flex justify-end space-x-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(location)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="w-4 h-4" />
                              <span>编辑</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(location)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>删除</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 模态框和对话框 */}
      <OfficeLocationModal
        isOpen={showModal}
        onClose={handleModalClose}
        location={selectedLocation}
      />

      <DeleteOfficeLocationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        location={selectedLocation}
      />
    </div>
  );
}

export default withProtected(OfficeLocationsPage, ['hr', 'admin']);
