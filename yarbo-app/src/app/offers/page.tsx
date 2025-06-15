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
  FileText
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
}

function OffersPage() {
  const { user, userRole } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);

  // 加载offer列表
  const loadOffers = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/offers?userId=${user.id}&role=${userRole || 'candidate'}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Offers API error:', response.status, errorText);
        throw new Error(`网络错误 (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        const offersData = result.data || [];
        setOffers(offersData);

        // 如果没有offers，这不是错误，只是空状态
        if (offersData.length === 0) {
          console.log('用户暂无offer记录');
        } else {
          console.log('成功加载', offersData.length, '个offer');
        }
      } else {
        // 只有在真正的错误情况下才抛出异常
        throw new Error(result.error || '服务器错误');
      }
    } catch (error) {
      console.error('加载offer失败:', error);
      // 区分网络错误和其他错误
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理offer响应（接受/拒绝）
  const handleOfferResponse = async (offerId: string, status: 'accepted' | 'rejected') => {
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
        throw new Error(errorData.error || '操作失败');
      }

      const result = await response.json();
      if (result.success) {
        // 重新加载offer列表
        await loadOffers();
      } else {
        throw new Error(result.error || '操作失败');
      }
    } catch (error) {
      console.error('处理offer失败:', error);
      setError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setProcessingOfferId(null);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [user?.id, userRole]);

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的Offer</h1>
          <p className="text-gray-600">查看和管理您收到的工作邀请</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!error && offers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无Offer</h3>
              <p className="text-gray-500">您还没有收到任何工作邀请</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => {
              const statusInfo = getStatusInfo(offer.status);
              const StatusIcon = statusInfo.icon;
              const expired = isExpired(offer.expires_at);
              const canRespond = offer.status === 'pending' && !expired;

              return (
                <Card key={offer.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{offer.jobs.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {offer.jobs.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {offer.jobs.location}
                          </div>
                        </div>
                      </div>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 薪资和入职时间 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    {/* 过期时间 */}
                    {offer.expires_at && (
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
                    )}

                    {/* 备注 */}
                    {offer.notes && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">备注</p>
                        <p className="text-gray-800">{offer.notes}</p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    {canRespond && (
                      <div className="flex space-x-3 pt-4 border-t">
                        <Button
                          onClick={() => handleOfferResponse(offer.id, 'accepted')}
                          disabled={processingOfferId === offer.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {processingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          接受Offer
                        </Button>
                        <Button
                          onClick={() => handleOfferResponse(offer.id, 'rejected')}
                          disabled={processingOfferId === offer.id}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {processingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          拒绝Offer
                        </Button>
                      </div>
                    )}

                    {/* 响应时间 */}
                    {offer.responded_at && (
                      <div className="text-sm text-gray-500 pt-2 border-t">
                        响应时间: {new Date(offer.responded_at).toLocaleString()}
                      </div>
                    )}
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

export default withProtected(OffersPage, ["candidate"]);
