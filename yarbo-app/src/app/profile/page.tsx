"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { withProtected } from "@/components/withProtected";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Shield,
  Phone,
  FileText,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Upload,
  Download,
  Trash2,
  Eye,
  Star
} from "lucide-react";
import { updateUserProfile, getUserResumes, uploadUserResume, deleteUserResume, setPrimaryResume } from "@/lib/api";
import { EnhancedFileUpload } from "@/components/ui/enhanced-file-upload";
import { ResumeViewer } from "@/components/ResumeViewer";

function ProfilePage() {
  const { user, userProfile, userRole, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 简历管理相关状态
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isResumeViewerOpen, setIsResumeViewerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [currentViewingResume, setCurrentViewingResume] = useState<any>(null);

  // 表单数据状态
  const [formData, setFormData] = useState({
    first_name: userProfile?.user_profiles?.first_name || '',
    last_name: userProfile?.user_profiles?.last_name || '',
    phone: userProfile?.user_profiles?.phone || '',
    bio: userProfile?.user_profiles?.bio || ''
  });

  // 简历文件限制
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除错误和成功消息
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // 重置表单数据
  const resetFormData = () => {
    setFormData({
      first_name: userProfile?.user_profiles?.first_name || '',
      last_name: userProfile?.user_profiles?.last_name || '',
      phone: userProfile?.user_profiles?.phone || '',
      bio: userProfile?.user_profiles?.bio || ''
    });
  };

  // 取消编辑
  const handleCancel = () => {
    resetFormData();
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  // 表单验证
  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('姓名不能为空');
      return false;
    }

    if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入有效的手机号码');
      return false;
    }

    return true;
  };

  // 清除所有客户端缓存
  const clearAllCaches = async () => {
    try {
      console.log('🧹 清除所有客户端缓存...');

      // 清除 localStorage
      localStorage.clear();

      // 清除 sessionStorage
      sessionStorage.clear();

      // 清除 IndexedDB 中的 Supabase 数据
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && db.name.includes('supabase')) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }

      // 清除 cookies（如果有的话）
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      console.log('✅ 缓存清除完成');
    } catch (error) {
      console.error('❌ 缓存清除失败:', error);
    }
  };

  // 强制重新登录以刷新认证状态
  const handleForceReauth = async () => {
    try {
      console.log('🔄 开始强制重新认证...');

      // 清除所有客户端缓存
      await clearAllCaches();

      // 登出当前用户
      await supabase.auth.signOut();

      // 跳转到登录页面
      window.location.href = '/auth/login?message=请重新登录以刷新认证状态';
    } catch (error) {
      console.error('强制重新认证失败:', error);
      setError('重新认证失败，请手动刷新页面');
    }
  };

  // 保存个人资料
  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      setError('用户信息不完整，请重新登录');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(user.id, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null
      });

      // 刷新用户数据
      await refreshUser();

      setSuccess('个人资料更新成功！');
      setIsEditing(false);
    } catch (error) {
      console.error('更新个人资料失败:', error);

      // 如果是枚举错误，提供重新认证选项
      if (error instanceof Error && error.message.includes('does not exist')) {
        setError(
          <div className="space-y-2">
            <p>检测到认证状态问题，可能需要重新登录。</p>
            <Button
              onClick={handleForceReauth}
              variant="outline"
              size="sm"
              className="w-full"
            >
              重新登录修复问题
            </Button>
          </div>
        );
      } else {
        setError(error instanceof Error ? error.message : '更新失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // JWT 令牌调试 - 诊断阶段
  useEffect(() => {
    if (user) {
      console.log('🔍 开始 JWT 令牌诊断...');

      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ 获取会话失败:', error);
          return;
        }

        if (session) {
          console.log('✅ 会话存在');
          console.log('📋 Access Token:', session.access_token.substring(0, 50) + '...');

          // 解码 JWT 令牌
          try {
            const tokenParts = session.access_token.split('.');
            if (tokenParts.length === 3) {
              // 正确处理 base64 解码，添加必要的填充
              let base64 = tokenParts[1];

              // 验证base64字符串是否有效
              if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
                throw new Error('Invalid base64 characters in JWT payload');
              }

              // 添加必要的填充字符
              while (base64.length % 4) {
                base64 += '=';
              }

              // 安全的atob调用
              let decodedPayload;
              try {
                decodedPayload = atob(base64);
              } catch (atobError) {
                throw new Error(`Base64 decode failed: ${atobError.message}`);
              }

              const payload = JSON.parse(decodedPayload);
              console.log('🔓 JWT Payload 解码成功:');
              console.log('  - User ID:', payload.sub);
              console.log('  - Email:', payload.email);
              console.log('  - Role (app_metadata):', payload.app_metadata?.role);
              console.log('  - Role (user_metadata):', payload.user_metadata?.role);
              console.log('  - Raw app_metadata:', payload.app_metadata);
              console.log('  - Raw user_metadata:', payload.user_metadata);
              console.log('  - Issued at:', new Date(payload.iat * 1000));
              console.log('  - Expires at:', new Date(payload.exp * 1000));
              console.log('  - 完整 Payload:', payload);
            } else {
              console.warn('⚠️ JWT token格式不正确，部分数量不是3个');
            }
          } catch (decodeError) {
            console.error('❌ JWT 解码失败:', decodeError);
            console.log('🔍 尝试其他方法获取用户信息...');
            console.log('  - Session User:', session.user);
            console.log('  - User App Metadata:', session.user.app_metadata);
            console.log('  - User User Metadata:', session.user.user_metadata);
          }
        } else {
          console.log('❌ 没有活动会话');
        }
      });
    }
  }, [user]);

  // 加载用户简历函数
  const loadUserResumes = async () => {
    if (!user?.id) return;

    setIsResumeLoading(true);
    setResumeError(null);

    try {
      const resumes = await getUserResumes(user.id);
      setUserResumes(resumes);
    } catch (error) {
      console.error('加载简历失败:', error);
      setResumeError('加载简历失败');
    } finally {
      setIsResumeLoading(false);
    }
  };

  // 加载用户简历
  useEffect(() => {
    if (user?.id) {
      loadUserResumes();
    }
  }, [user?.id]);

  // 处理简历上传
  const handleResumeUpload = async (files: File[]) => {
    if (!user?.id || !user?.email || files.length === 0) return;

    setIsResumeLoading(true);
    setResumeError(null);

    try {
      const result = await uploadUserResume(user.id, files[0], user.email);
      if (result.success) {
        // 重新加载所有简历
        await loadUserResumes();
        setUploadedFiles([]);
        setSuccess('简历上传成功！');
      } else {
        setResumeError(result.error || '简历上传失败');
      }
    } catch (error) {
      console.error('简历上传失败:', error);
      setResumeError('简历上传失败');
    } finally {
      setIsResumeLoading(false);
    }
  };

  // 删除指定简历
  const handleResumeDelete = async (resumeId: string) => {
    if (!user?.id) return;

    setIsResumeLoading(true);
    setResumeError(null);

    try {
      const result = await deleteUserResume(user.id, resumeId);
      if (result.success) {
        // 重新加载所有简历
        await loadUserResumes();
        setSuccess('简历删除成功！');
      } else {
        setResumeError(result.error || '简历删除失败');
      }
    } catch (error) {
      console.error('简历删除失败:', error);
      setResumeError('简历删除失败');
    } finally {
      setIsResumeLoading(false);
    }
  };

  // 设置主简历
  const handleSetPrimaryResume = async (resumeId: string) => {
    if (!user?.id) return;

    setIsResumeLoading(true);
    setResumeError(null);

    try {
      const result = await setPrimaryResume(user.id, resumeId);
      if (result.success) {
        // 重新加载所有简历
        await loadUserResumes();
        setSuccess('主简历设置成功！');
      } else {
        setResumeError(result.error || '设置主简历失败');
      }
    } catch (error) {
      console.error('设置主简历失败:', error);
      setResumeError('设置主简历失败');
    } finally {
      setIsResumeLoading(false);
    }
  };

  // 获取简历文件URL
  const getResumeUrl = async (resume: any) => {
    if (!resume?.id || !user) return null;

    try {
      // 获取用户认证token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('用户未认证');
        setResumeError('用户认证已过期，请重新登录');
        return null;
      }

      // 调用安全的API端点获取签名URL
      const response = await fetch(`/api/resumes/${resume.id}/url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('获取简历URL失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        if (response.status === 401) {
          setResumeError('认证失败，请重新登录');
        } else if (response.status === 403) {
          setResumeError('没有权限访问此简历');
        } else if (response.status === 404) {
          setResumeError('简历文件不存在');
        } else {
          setResumeError(`无法获取简历预览链接: ${errorData.error || '未知错误'}`);
        }
        return null;
      }

      const result = await response.json();
      if (result.success && result.data?.url) {
        return result.data.url;
      } else {
        setResumeError('服务器返回无效的简历链接');
        return null;
      }
    } catch (error) {
      console.error('获取简历URL失败:', error);
      setResumeError('获取简历链接时发生网络错误');
      return null;
    }
  };

  // 获取显示的姓名
  const getDisplayName = () => {
    const profile = userProfile?.user_profiles;
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return '未设置';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">个人资料</CardTitle>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>编辑</span>
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>保存</span>
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>取消</span>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 成功提示 */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {!isEditing ? (
              // 查看模式
              <>
                <div className="flex items-center space-x-4">
                  <User className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">姓名</p>
                    <p className="text-gray-700">{getDisplayName()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">邮箱</p>
                    <p className="text-gray-700">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">电话</p>
                    <p className="text-gray-700">{userProfile?.user_profiles?.phone || '未设置'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Shield className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="font-medium">角色</p>
                    <p className="text-gray-700 capitalize">{userRole}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <FileText className="h-6 w-6 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium">个人简介</p>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {userProfile?.user_profiles?.bio || '未设置'}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // 编辑模式
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">姓 *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="请输入姓"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">名</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="请输入名"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">邮箱地址不可修改</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="请输入手机号码"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">角色</Label>
                  <Input
                    id="role"
                    value={userRole || ''}
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                  <p className="text-sm text-gray-500">角色由管理员设置</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="请输入个人简介..."
                    rows={4}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 简历管理卡片 - 只对候选人显示 */}
        {userRole === 'candidate' && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>简历管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 简历错误提示 */}
              {resumeError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resumeError}</AlertDescription>
                </Alert>
              )}

              {isResumeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>加载中...</span>
                </div>
              ) : userResumes.length > 0 ? (
                // 已有简历列表
                <div className="space-y-4">
                  {/* 简历列表 */}
                  <div className="space-y-3">
                    {userResumes.map((resume, index) => (
                      <div
                        key={resume.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${resume.is_primary ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className={`h-8 w-8 ${resume.is_primary ? 'text-blue-600' : 'text-gray-600'}`} />
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium">{resume.filename}</p>
                              {resume.is_primary && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  主简历
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              上传时间: {new Date(resume.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const url = await getResumeUrl(resume);
                              if (url) {
                                setCurrentViewingResume(resume);
                                setResumeUrl(url);
                                setIsResumeViewerOpen(true);
                              }
                            }}
                            className="flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>预览</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const url = await getResumeUrl(resume);
                              if (url) {
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = resume.filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>下载</span>
                          </Button>
                          {!resume.is_primary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPrimaryResume(resume.id)}
                              disabled={isResumeLoading}
                              className="flex items-center space-x-2"
                            >
                              <Star className="h-4 w-4" />
                              <span>设为主简历</span>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleResumeDelete(resume.id)}
                            disabled={isResumeLoading}
                            className="flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>删除</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 上传新简历 */}
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600 mb-3">上传新简历:</p>
                    <EnhancedFileUpload
                      onFilesChange={handleResumeUpload}
                      maxFiles={1}
                      maxSize={MAX_FILE_SIZE}
                      acceptedTypes={ACCEPTED_FILE_TYPES}
                      multiple={false}
                      showPreview={false}
                      disabled={isResumeLoading}
                    />
                  </div>
                </div>
              ) : (
                // 未上传简历
                <div className="space-y-4">
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">还未上传简历</p>
                    <p className="text-sm text-gray-500">请上传您的简历以便申请职位</p>
                  </div>

                  <EnhancedFileUpload
                    onFilesChange={handleResumeUpload}
                    maxFiles={1}
                    maxSize={MAX_FILE_SIZE}
                    acceptedTypes={ACCEPTED_FILE_TYPES}
                    multiple={false}
                    showPreview={true}
                    disabled={isResumeLoading}
                  />

                  <p className="text-sm text-gray-500">
                    支持 PDF、DOC、DOCX 格式，大小不超过 5MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 简历预览器 */}
        <ResumeViewer
          isOpen={isResumeViewerOpen}
          onClose={() => {
            setIsResumeViewerOpen(false);
            setResumeUrl(null); // 清除URL以释放资源
          }}
          resumeUrl={resumeUrl}
          resumeName={currentViewingResume?.filename}
          candidateName={getDisplayName()}
        />
      </div>
    </div>
  );
}

export default withProtected(ProfilePage, ["admin", "hr", "candidate"]);