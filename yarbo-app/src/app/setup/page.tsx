'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { CheckCircle, AlertCircle, User, Settings } from 'lucide-react';

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    type: 'success' | 'error';
    message: string;
  }>>([]);

  const addResult = (type: 'success' | 'error', message: string) => {
    setResults(prev => [...prev, { type, message }]);
  };

  const createDemoAccounts = async () => {
    setIsLoading(true);
    setResults([]);

    const demoAccounts = [
      {
        email: 'admin@yarbo.com',
        password: 'password123',
        role: 'admin',
        name: '系统管理员'
      },
      {
        email: 'hr@yarbo.com', 
        password: 'password123',
        role: 'hr',
        name: 'HR经理'
      },
      {
        email: 'test.candidate@gmail.com',
        password: 'password123', 
        role: 'candidate',
        name: '测试候选人'
      }
    ];

    for (const account of demoAccounts) {
      try {
        // 注册用户
        const { data, error } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              name: account.name,
              role: account.role,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            addResult('success', `${account.email} 账号已存在`);
          } else {
            addResult('error', `${account.email} 创建失败: ${error.message}`);
          }
        } else {
          addResult('success', `${account.email} 创建成功 (${account.role})`);
        }
      } catch (err) {
        addResult('error', `${account.email} 创建异常: ${err}`);
      }
    }

    setIsLoading(false);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      // 测试数据库连接
      const { data, error } = await supabase.from('departments').select('count');
      
      if (error) {
        addResult('error', `数据库连接失败: ${error.message}`);
      } else {
        addResult('success', '数据库连接正常');
      }

      // 测试认证服务
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addResult('error', `认证服务异常: ${authError.message}`);
      } else {
        addResult('success', '认证服务正常');
      }

    } catch (err) {
      addResult('error', `连接测试异常: ${err}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🛠️ 系统设置中心
            </h1>
            <p className="text-gray-600 text-lg">
              初始化 Yarbo 招聘平台演示数据
            </p>
          </div>

          {/* 连接测试 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                系统连接测试
              </CardTitle>
              <CardDescription>
                验证数据库和认证服务连接状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testConnection}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? '测试中...' : '测试系统连接'}
              </Button>
            </CardContent>
          </Card>

          {/* 演示账号创建 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                创建演示账号
              </CardTitle>
              <CardDescription>
                创建管理员、HR和候选人演示账号
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">将创建以下账号：</h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div><strong>管理员:</strong> admin@yarbo.com / password123</div>
                    <div><strong>HR:</strong> hr@yarbo.com / password123</div>
                    <div><strong>候选人:</strong> test.candidate@gmail.com / password123</div>
                  </div>
                </div>

                <Button 
                  onClick={createDemoAccounts}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? '创建中...' : '创建演示账号'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 结果显示 */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>操作结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-2 p-3 rounded-lg ${
                        result.type === 'success' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      {result.type === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        result.type === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 使用说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              <ul className="space-y-2">
                <li>• 首次使用请先测试系统连接</li>
                <li>• 然后创建演示账号用于测试登录</li>
                <li>• 创建成功后即可使用演示账号登录系统</li>
                <li>• 生产环境请删除此页面或限制访问</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 