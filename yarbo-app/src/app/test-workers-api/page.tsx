'use client';

import { useState } from 'react';
import { useApiTest, useJobs, useWorkersAuth, useFileUpload, useNotifications } from '@/hooks/useWorkersApi';

export default function TestWorkersApiPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  // API 测试
  const { result: apiTestResult, loading: apiTestLoading, testApi, getApiInfo } = useApiTest();

  // 职位测试
  const { jobs, loading: jobsLoading, error: jobsError, fetchJobs } = useJobs();

  // 认证测试
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    error: authError,
    login,
    register,
    logout
  } = useWorkersAuth();

  // 文件上传测试
  const {
    result: uploadResult,
    loading: uploadLoading,
    error: uploadError,
    uploadResume
  } = useFileUpload();

  // 通知测试
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    fetchNotifications
  } = useNotifications();

  const addTestResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleTestApi = async () => {
    const result = await testApi();
    addTestResult('API 测试', result);
  };

  const handleGetApiInfo = async () => {
    const result = await getApiInfo();
    addTestResult('API 信息', result);
  };

  const handleFetchJobs = async () => {
    const result = await fetchJobs({ limit: 5 });
    addTestResult('获取职位', result);
  };

  const handleLogin = async () => {
    const result = await login('test@example.com', 'password123');
    addTestResult('用户登录', result);
  };

  const handleRegister = async () => {
    const result = await register({
      email: 'newuser@example.com',
      password: 'password123',
      fullName: '新用户',
      role: 'candidate'
    });
    addTestResult('用户注册', result);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadResume(file);
      addTestResult('文件上传', result);
    }
  };

  const handleFetchNotifications = async () => {
    const result = await fetchNotifications({ limit: 10 });
    addTestResult('获取通知', result);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cloudflare Workers API 测试</h1>

      {/* 认证状态 */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">认证状态</h2>
        <p>已认证: {isAuthenticated ? '是' : '否'}</p>
        {user && <p>用户: {JSON.stringify(user, null, 2)}</p>}
        {authError && <p className="text-red-500">错误: {authError}</p>}
      </div>

      {/* 测试按钮组 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={handleTestApi}
          disabled={apiTestLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {apiTestLoading ? '测试中...' : 'API 测试'}
        </button>

        <button
          onClick={handleGetApiInfo}
          disabled={apiTestLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {apiTestLoading ? '获取中...' : 'API 信息'}
        </button>

        <button
          onClick={handleFetchJobs}
          disabled={jobsLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {jobsLoading ? '加载中...' : '获取职位'}
        </button>

        <button
          onClick={handleLogin}
          disabled={authLoading}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
        >
          {authLoading ? '登录中...' : '测试登录'}
        </button>

        <button
          onClick={handleRegister}
          disabled={authLoading}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
        >
          {authLoading ? '注册中...' : '测试注册'}
        </button>

        <button
          onClick={logout}
          disabled={authLoading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {authLoading ? '登出中...' : '登出'}
        </button>

        <button
          onClick={handleFetchNotifications}
          disabled={notificationsLoading}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          {notificationsLoading ? '加载中...' : '获取通知'}
        </button>

        <div className="bg-gray-100 p-2 rounded">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploadLoading}
            className="text-sm"
            accept=".pdf,.doc,.docx"
          />
          {uploadLoading && <p className="text-sm text-blue-500">上传中...</p>}
        </div>
      </div>

      {/* 职位数据显示 */}
      {jobs && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">职位数据 ({jobs.length} 个)</h2>
          <div className="max-h-40 overflow-y-auto">
            {jobs.slice(0, 3).map((job: any, index: number) => (
              <div key={index} className="border-b pb-2 mb-2">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-gray-600">{job.department} - {job.location}</p>
                <p className="text-sm text-blue-600">{job.salary_display}</p>
              </div>
            ))}
          </div>
          {jobsError && <p className="text-red-500">错误: {jobsError}</p>}
        </div>
      )}

      {/* 通知数据显示 */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">通知 (未读: {unreadCount})</h2>
          <div className="max-h-40 overflow-y-auto">
            {notifications.slice(0, 3).map((notification: any, index: number) => (
              <div key={index} className="border-b pb-2 mb-2">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400">
                  {notification.is_read ? '已读' : '未读'} - {notification.created_at}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文件上传结果 */}
      {uploadResult && (
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">文件上传结果</h2>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
          {uploadError && <p className="text-red-500">错误: {uploadError}</p>}
        </div>
      )}

      {/* 测试结果 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">测试结果</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{result.test}</h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <div className="text-sm">
                <div className="flex items-center mb-1">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.result.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  <span>{result.result.success ? '成功' : '失败'}</span>
                </div>
                {result.result.message && (
                  <p className="text-blue-600 mb-1">消息: {result.result.message}</p>
                )}
                {result.result.error && (
                  <p className="text-red-600 mb-1">错误: {result.result.error}</p>
                )}
                {result.result.runtime && (
                  <p className="text-gray-600 mb-1">
                    运行时: {typeof result.result.runtime === 'string'
                      ? result.result.runtime
                      : JSON.stringify(result.result.runtime)}
                  </p>
                )}
                {result.result.count !== undefined && (
                  <p className="text-purple-600">数量: {result.result.count}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {testResults.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            点击上方按钮开始测试 API 功能
          </p>
        )}
      </div>
    </div>
  );
}
