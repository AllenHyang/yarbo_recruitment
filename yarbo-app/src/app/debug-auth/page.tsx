"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionInfo({
        session: session ? {
          access_token: session.access_token ? '存在' : '不存在',
          user: session.user ? {
            id: session.user.id,
            email: session.user.email,
          } : null,
          expires_at: session.expires_at,
        } : null,
        error: error?.message,
      });
    } catch (error) {
      setSessionInfo({
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      // 获取session
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // 测试API调用
      const response = await fetch('/api/hr/departments', {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      setApiTestResult({
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(Object.entries(headers)),
        response: data,
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0,
      });
    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateDepartment = async () => {
    setLoading(true);
    try {
      // 获取session
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // 测试创建部门API
      const response = await fetch('/api/hr/departments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: '调试测试部门',
          description: '这是一个调试测试部门',
          color_theme: 'blue'
        }),
      });

      const data = await response.json();

      setApiTestResult({
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(Object.entries(headers)),
        response: data,
        hasToken: !!session?.access_token,
        tokenLength: session?.access_token?.length || 0,
        method: 'POST',
      });
    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : '未知错误'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">认证调试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session 状态</CardTitle>
            <CardDescription>当前用户的认证状态</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkSession} className="mb-4">
              刷新 Session
            </Button>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API 测试</CardTitle>
            <CardDescription>测试API认证</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <Button onClick={testApiCall} disabled={loading}>
                测试获取部门列表
              </Button>
              <Button onClick={testCreateDepartment} disabled={loading} variant="outline">
                测试创建部门
              </Button>
            </div>
            {apiTestResult && (
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(apiTestResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
