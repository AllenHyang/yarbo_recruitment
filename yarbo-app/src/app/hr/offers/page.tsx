"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { withProtected } from "@/components/withProtected";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Edit,
  Trash2,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

function HROffersPage() {
  const { user, userRole } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 新offer表单数据
  const [newOfferData, setNewOfferData] = useState({
    applicationId: '',
    jobId: '',
    applicantId: '',
    salaryAmount: '',
    salaryCurrency: 'CNY',
    startDate: '',
    expiresAt: '',
    notes: '',
    benefits: ''
  });

  // 加载offer列表
  const loadOffers = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: user.id,
        role: userRole || 'hr'
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
        setOffers(result.data || []);
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

  // 撤回offer
  const handleWithdrawOffer = async (offerId: string) => {
    try {
      setProcessingOfferId(offerId);
      setError(null);

      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'withdrawn',
          userId: user?.id,
          role: userRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '撤回失败');
      }

      const result = await response.json();
      if (result.success) {
        await loadOffers();
      } else {
        throw new Error(result.error || '撤回失败');
      }
    } catch (error) {
      console.error('撤回offer失败:', error);
      setError(error instanceof Error ? error.message : '撤回失败');
    } finally {
      setProcessingOfferId(null);
    }
  };

  // 创建新offer
  const handleCreateOffer = async () => {
    try {
      setError(null);

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOfferData,
          offeredBy: user?.id,
          salaryAmount: parseFloat(newOfferData.salaryAmount)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建offer失败');
      }

      const result = await response.json();
      if (result.success) {
        setIsCreateDialogOpen(false);
        setNewOfferData({
          applicationId: '',
          jobId: '',
          applicantId: '',
          salaryAmount: '',
          salaryCurrency: 'CNY',
          startDate: '',
          expiresAt: '',
          notes: '',
          benefits: ''
        });
        await loadOffers();
      } else {
        throw new Error(result.error || '创建offer失败');
      }
    } catch (error) {
      console.error('创建offer失败:', error);
      setError(error instanceof Error ? error.message : '创建offer失败');
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer管理</h1>
            <p className="text-gray-600">管理和跟踪发出的工作邀请</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>创建Offer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建新Offer</DialogTitle>
                <DialogDescription>
                  为候选人创建工作邀请
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="applicationId">申请ID</Label>
                  <Input
                    id="applicationId"
                    value={newOfferData.applicationId}
                    onChange={(e) => setNewOfferData({ ...newOfferData, applicationId: e.target.value })}
                    placeholder="输入申请ID"
                  />
                </div>

                <div>
                  <Label htmlFor="salaryAmount">薪资金额</Label>
                  <Input
                    id="salaryAmount"
                    type="number"
                    value={newOfferData.salaryAmount}
                    onChange={(e) => setNewOfferData({ ...newOfferData, salaryAmount: e.target.value })}
                    placeholder="输入年薪金额"
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">入职时间</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newOfferData.startDate}
                    onChange={(e) => setNewOfferData({ ...newOfferData, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">有效期至</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={newOfferData.expiresAt}
                    onChange={(e) => setNewOfferData({ ...newOfferData, expiresAt: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">备注</Label>
                  <Textarea
                    id="notes"
                    value={newOfferData.notes}
                    onChange={(e) => setNewOfferData({ ...newOfferData, notes: e.target.value })}
                    placeholder="添加备注信息"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateOffer}>
                  创建Offer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* 状态过滤 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待处理' },
              { value: 'accepted', label: '已接受' },
              { value: 'rejected', label: '已拒绝' },
              { value: 'withdrawn', label: '已撤回' }
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
              <p className="text-gray-500">还没有发出任何工作邀请</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {offers.map((offer) => {
              const statusInfo = getStatusInfo(offer.status);
              const StatusIcon = statusInfo.icon;
              const expired = isExpired(offer.expires_at);
              const canWithdraw = offer.status === 'pending' && !expired;

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
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 薪资和入职时间 */}
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

                    {/* 操作按钮 */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        发出时间: {new Date(offer.offered_at).toLocaleString()}
                        {offer.responded_at && (
                          <span className="ml-4">
                            响应时间: {new Date(offer.responded_at).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {canWithdraw && (
                        <Button
                          onClick={() => handleWithdrawOffer(offer.id)}
                          disabled={processingOfferId === offer.id}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          {processingOfferId === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          撤回Offer
                        </Button>
                      )}
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

export default withProtected(HROffersPage, ["hr"]);
