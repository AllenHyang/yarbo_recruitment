"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { withProtected } from "@/components/withProtected";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Building,
  AlertCircle,
  Loader2,
  FileText,
  Trash2,
  User,
  BarChart3
} from "lucide-react";


interface Offer {
  id: string;
  salary_amount: number;
  salary_currency: string;
  start_date: string;
  status: string;
  expires_at: string;
  offered_at: string;
  responded_at: string | null;
  notes: string | null;
  benefits: any;
  jobs: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  applications: {
    id: string;
    status: string;
    applied_at: string;
  };
  applicants: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface OfferStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  expired: number;
  acceptanceRate: number;
}

function AdminOffersPage() {
  const { user, userRole } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
    expired: 0,
    acceptanceRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 加载offer列表和统计数据
  const loadOffers = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: user.id,
        role: userRole || 'admin'
      });

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/offers?${params}`);
      
      if (!response.ok) {
        throw new Error('获取offer列表失败');
      }

      const result = await response.json();
      if (result.success) {
        const offerData = result.data || [];
        setOffers(offerData);
        
        // 计算统计数据
        const total = offerData.length;
        const pending = offerData.filter((o: Offer) => o.status === 'pending').length;
        const accepted = offerData.filter((o: Offer) => o.status === 'accepted').length;
        const rejected = offerData.filter((o: Offer) => o.status === 'rejected').length;
        const withdrawn = offerData.filter((o: Offer) => o.status === 'withdrawn').length;
        const expired = offerData.filter((o: Offer) => o.status === 'expired').length;
        const acceptanceRate = total > 0 ? (accepted / (accepted + rejected)) * 100 : 0;

        setStats({
          total,
          pending,
          accepted,
          rejected,
          withdrawn,
          expired,
          acceptanceRate: isNaN(acceptanceRate) ? 0 : acceptanceRate
        });
      } else {
        throw new Error(result.error || '获取offer列表失败');
      }
    } catch (error) {
      console.error('加载offer失败:', error);
      setError(error instanceof Error ? error.message : '加载offer失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除offer
  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('确定要删除这个offer吗？此操作不可撤销。')) {
      return;
    }

    try {
      setProcessingOfferId(offerId);
      setError(null);

      const response = await fetch(`/api/offers/${offerId}?role=admin`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除失败');
      }

      const result = await response.json();
      if (result.success) {
        await loadOffers();
      } else {
        throw new Error(result.error || '删除失败');
      }
    } catch (error) {
      console.error('删除offer失败:', error);
      setError(error instanceof Error ? error.message : '删除失败');
    } finally {
      setProcessingOfferId(null);
    }
  };

  // 更新offer状态
  const handleUpdateOfferStatus = async (offerId: string, status: string) => {
    try {
      setProcessingOfferId(offerId);
      setError(null);

      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          userId: user?.id,
          role: userRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新失败');
      }

      const result = await response.json();
      if (result.success) {
        await loadOffers();
      } else {
        throw new Error(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新offer失败:', error);
      setError(error instanceof Error ? error.message : '更新失败');
    } finally {
      setProcessingOfferId(null);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [user?.id, userRole, selectedStatus]);

  // 获取状态显示信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待处理', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'accepted':
        return { label: '已接受', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { label: '已拒绝', color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'withdrawn':
        return { label: '已撤回', color: 'bg-gray-100 text-gray-800', icon: XCircle };
      case 'expired':
        return { label: '已过期', color: 'bg-gray-100 text-gray-800', icon: Clock };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  // 格式化薪资
  const formatSalary = (amount: number, currency: string) => {
    return `${(amount / 1000).toFixed(0)}K ${currency}`;
  };

  // 检查offer是否过期
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer管理中心</h1>
          <p className="text-gray-600">全面管理和监控所有工作邀请</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">总Offer数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">待处理</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">已接受</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">接受率</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.acceptanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 状态过滤 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待处理' },
              { value: 'accepted', label: '已接受' },
              { value: 'rejected', label: '已拒绝' },
              { value: 'withdrawn', label: '已撤回' },
              { value: 'expired', label: '已过期' }
            ].map((status) => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status.value)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无Offer</h3>
              <p className="text-gray-500">系统中还没有任何工作邀请</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => {
              const statusInfo = getStatusInfo(offer.status);
              const StatusIcon = statusInfo.icon;
              const expired = isExpired(offer.expires_at);

              return (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{offer.jobs.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {offer.jobs.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {offer.jobs.location}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {offer.applicants.name} ({offer.applicants.email})
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 薪资和时间信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">薪资</p>
                          <p className="font-semibold">{formatSalary(offer.salary_amount, offer.salary_currency)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">入职时间</p>
                          <p className="font-semibold">{new Date(offer.start_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">有效期至</p>
                          <p className={`font-semibold ${expired ? 'text-red-600' : ''}`}>
                            {new Date(offer.expires_at).toLocaleDateString()}
                            {expired && ' (已过期)'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 备注 */}
                    {offer.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">备注</p>
                        <p className="text-gray-800">{offer.notes}</p>
                      </div>
                    )}

                    {/* 操作按钮和时间信息 */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        发出时间: {new Date(offer.offered_at).toLocaleString()}
                        {offer.responded_at && (
                          <span className="ml-4">
                            响应时间: {new Date(offer.responded_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {offer.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleUpdateOfferStatus(offer.id, 'expired')}
                              disabled={processingOfferId === offer.id}
                              variant="outline"
                              size="sm"
                            >
                              标记过期
                            </Button>
                            <Button
                              onClick={() => handleUpdateOfferStatus(offer.id, 'withdrawn')}
                              disabled={processingOfferId === offer.id}
                              variant="outline"
                              size="sm"
                            >
                              撤回
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteOffer(offer.id)}
                          disabled={processingOfferId === offer.id}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {processingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default withProtected(AdminOffersPage, ["admin"]);
