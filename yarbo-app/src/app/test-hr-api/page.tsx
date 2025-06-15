'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function TestHRAPIPage() {
  const { session } = useAuth();
  const [statsResult, setStatsResult] = useState<any>(null);
  const [jobsResult, setJobsResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testStatsAPI = async () => {
    if (!session?.access_token) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hr/jobs/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setStatsResult({ status: response.status, data });
    } catch (error) {
      setStatsResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testJobsAPI = async () => {
    if (!session?.access_token) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hr/jobs', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setJobsResult({ status: response.status, data });
    } catch (error) {
      setJobsResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">HR API测试页面</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>认证状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p>登录状态: {session ? '已登录' : '未登录'}</p>
            {session && (
              <div>
                <p>用户邮箱: {session.user?.email}</p>
                <p>Token存在: {session.access_token ? '是' : '否'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>职位统计API测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testStatsAPI} disabled={loading || !session}>
              测试统计API
            </Button>
            {statsResult && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(statsResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>职位列表API测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testJobsAPI} disabled={loading || !session}>
              测试职位列表API
            </Button>
            {jobsResult && (
              <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(jobsResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
