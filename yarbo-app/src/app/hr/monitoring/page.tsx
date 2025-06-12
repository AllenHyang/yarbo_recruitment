'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  Server,
  Database,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Globe
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  responseTime: string;
  endpoint: string;
}

export default function MonitoringPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 系统指标数据
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU使用率',
      value: '23%',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2025-06-09T17:30:00Z'
    },
    {
      name: '内存使用率',
      value: '67%',
      status: 'warning',
      trend: 'up',
      lastUpdated: '2025-06-09T17:30:00Z'
    },
    {
      name: '磁盘使用率',
      value: '45%',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: '2025-06-09T17:30:00Z'
    },
    {
      name: '网络延迟',
      value: '12ms',
      status: 'healthy',
      trend: 'down',
      lastUpdated: '2025-06-09T17:30:00Z'
    }
  ]);

  // 服务状态数据
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: '主应用服务',
      status: 'online',
      uptime: '99.9%',
      responseTime: '150ms',
      endpoint: '/api/health'
    },
    {
      name: '数据库服务',
      status: 'online',
      uptime: '99.8%',
      responseTime: '45ms',
      endpoint: '/api/db/health'
    },
    {
      name: '邮件服务',
      status: 'online',
      uptime: '98.5%',
      responseTime: '320ms',
      endpoint: '/api/email/health'
    },
    {
      name: '文件存储',
      status: 'online',
      uptime: '99.7%',
      responseTime: '80ms',
      endpoint: '/api/storage/health'
    }
  ]);

  // 业务指标
  const businessMetrics = {
    activeUsers: 156,
    todayApplications: 23,
    systemErrors: 2,
    avgResponseTime: '186ms'
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // 模拟刷新数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdate(new Date());
      
      // 模拟更新一些指标
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.name === 'CPU使用率' ? `${Math.floor(Math.random() * 30 + 10)}%` : metric.value,
        lastUpdated: new Date().toISOString()
      })));
    } catch (error) {
      console.error('刷新失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <Badge className="bg-green-100 text-green-800">正常</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">警告</Badge>;
      case 'error':
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">错误</Badge>;
      case 'maintenance':
        return <Badge className="bg-blue-100 text-blue-800">维护中</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-green-500" />;
      default:
        return <Activity className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面头部 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                系统监控
              </h1>
              <p className="text-gray-600 mt-1">实时监控系统状态和性能指标</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
              </span>
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                刷新数据
              </Button>
            </div>
          </div>

          {/* 业务指标概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">在线用户</p>
                    <p className="text-2xl font-bold text-blue-600">{businessMetrics.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">今日申请</p>
                    <p className="text-2xl font-bold text-green-600">{businessMetrics.todayApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">系统错误</p>
                    <p className="text-2xl font-bold text-red-600">{businessMetrics.systemErrors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">响应时间</p>
                    <p className="text-2xl font-bold text-purple-600">{businessMetrics.avgResponseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 系统资源监控 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <span>系统资源</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {metric.name === 'CPU使用率' && <Cpu className="w-4 h-4 text-gray-600" />}
                          {metric.name === '内存使用率' && <Monitor className="w-4 h-4 text-gray-600" />}
                          {metric.name === '磁盘使用率' && <HardDrive className="w-4 h-4 text-gray-600" />}
                          {metric.name === '网络延迟' && <Wifi className="w-4 h-4 text-gray-600" />}
                          <span className="font-medium">{metric.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(metric.trend)}
                          <span className="text-lg font-bold">{metric.value}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(metric.status)}
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 服务状态监控 */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-green-600" />
                  <span>服务状态</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(service.status)}
                          <span className="font-medium">{service.name}</span>
                        </div>
                        {getStatusBadge(service.status)}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">可用性:</span>
                          <span className="ml-1">{service.uptime}</span>
                        </div>
                        <div>
                          <span className="font-medium">响应:</span>
                          <span className="ml-1">{service.responseTime}</span>
                        </div>
                        <div>
                          <span className="font-medium">端点:</span>
                          <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                            {service.endpoint}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 系统日志和警报 */}
          <div className="mt-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <span>系统事件</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      time: '17:32:15',
                      type: 'info',
                      message: '系统正常运行，所有服务状态良好'
                    },
                    {
                      time: '17:28:43',
                      type: 'warning',
                      message: '内存使用率达到警告阈值 (67%)'
                    },
                    {
                      time: '17:15:22',
                      type: 'info',
                      message: '数据库连接池已优化，响应时间提升15%'
                    },
                    {
                      time: '16:58:11',
                      type: 'error',
                      message: '邮件服务短暂中断 2 分钟，现已恢复'
                    },
                    {
                      time: '16:45:33',
                      type: 'info',
                      message: '用户 张三 登录系统'
                    }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <span className="text-sm text-gray-500 font-mono w-20">{event.time}</span>
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'error' ? 'bg-red-500' :
                        event.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-sm flex-1">{event.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 