/**
 * React Hook for Cloudflare Workers API
 * 提供便捷的 API 调用和状态管理
 */

import { useState, useCallback, useEffect } from 'react';
import { workersApi, WorkersApiResponse, JobsQuery, ApplicationSubmit, NotificationsQuery } from '@/lib/workers-api';

// 通用 API 状态类型
interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// 通用 API Hook
export function useWorkersApiCall<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<WorkersApiResponse<T>>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error || '请求失败',
        });
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      } as WorkersApiResponse<T>;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// 职位相关 Hook
export function useJobs() {
  const { data, loading, error, execute, reset } = useWorkersApiCall<any[]>();

  const fetchJobs = useCallback((query?: JobsQuery) => {
    return execute(() => workersApi.getJobs(query));
  }, [execute]);

  return {
    jobs: data,
    loading,
    error,
    fetchJobs,
    reset,
  };
}

// 申请相关 Hook
export function useApplications() {
  const { data, loading, error, execute, reset } = useWorkersApiCall();

  const submitApplication = useCallback((application: ApplicationSubmit) => {
    return execute(() => workersApi.submitApplication(application));
  }, [execute]);

  return {
    result: data,
    loading,
    error,
    submitApplication,
    reset,
  };
}

// 认证相关 Hook
export function useWorkersAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const { data, loading, error, execute, reset } = useWorkersApiCall();

  // 检查认证状态
  useEffect(() => {
    const token = localStorage.getItem('workers_access_token');
    if (token) {
      setIsAuthenticated(true);
      // 获取用户信息
      workersApi.getUser().then(response => {
        if (response.success) {
          setUser(response.data);
        } else {
          // 令牌可能已过期
          setIsAuthenticated(false);
          workersApi.clearAccessToken();
        }
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await execute(() => workersApi.login({ email, password }));
    
    if (response.success) {
      setIsAuthenticated(true);
      setUser(response.data?.user || null);
    }

    return response;
  }, [execute]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    fullName: string;
    role?: 'candidate' | 'hr' | 'admin';
  }) => {
    return execute(() => workersApi.register(userData));
  }, [execute]);

  const logout = useCallback(async () => {
    await workersApi.logout();
    setIsAuthenticated(false);
    setUser(null);
    reset();
  }, [reset]);

  const refreshToken = useCallback(async () => {
    const response = await workersApi.refreshToken();
    
    if (response.success) {
      setIsAuthenticated(true);
      // 重新获取用户信息
      const userResponse = await workersApi.getUser();
      if (userResponse.success) {
        setUser(userResponse.data);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      workersApi.clearAccessToken();
    }

    return response;
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    reset,
  };
}

// 文件上传相关 Hook
export function useFileUpload() {
  const { data, loading, error, execute, reset } = useWorkersApiCall();

  const uploadResume = useCallback((file: File, fileName?: string) => {
    return execute(() => workersApi.uploadResume(file, fileName));
  }, [execute]);

  const uploadAvatar = useCallback((file: File) => {
    return execute(() => workersApi.uploadAvatar(file));
  }, [execute]);

  const deleteFile = useCallback((fileName: string) => {
    return execute(() => workersApi.deleteFile(fileName));
  }, [execute]);

  const getSignedUrl = useCallback((fileName: string, fileType: string, bucket?: string) => {
    return execute(() => workersApi.getSignedUrl(fileName, fileType, bucket));
  }, [execute]);

  return {
    result: data,
    loading,
    error,
    uploadResume,
    uploadAvatar,
    deleteFile,
    getSignedUrl,
    reset,
  };
}

// 通知相关 Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { loading, error, execute } = useWorkersApiCall();

  const fetchNotifications = useCallback(async (query?: NotificationsQuery) => {
    const response = await execute(() => workersApi.getNotifications(query));
    
    if (response.success && response.data) {
      setNotifications(response.data);
    }

    return response;
  }, [execute]);

  const fetchUnreadCount = useCallback(async () => {
    const response = await workersApi.getUnreadNotificationCount();
    
    if (response.success && response.data) {
      setUnreadCount(response.data.unreadCount || 0);
    }

    return response;
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    const response = await workersApi.markNotificationAsRead(notificationId);
    
    if (response.success) {
      // 更新本地状态
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      // 更新未读数量
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    return response;
  }, []);

  const markAllAsRead = useCallback(async () => {
    const response = await workersApi.markAllNotificationsAsRead();
    
    if (response.success) {
      // 更新本地状态
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    }

    return response;
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const response = await workersApi.deleteNotification(notificationId);
    
    if (response.success) {
      // 更新本地状态
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    }

    return response;
  }, []);

  const createNotification = useCallback(async (notification: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
  }) => {
    return execute(() => workersApi.createNotification(notification));
  }, [execute]);

  // 初始化时获取通知和未读数量
  useEffect(() => {
    const token = localStorage.getItem('workers_access_token');
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
}

// API 测试 Hook
export function useApiTest() {
  const { data, loading, error, execute, reset } = useWorkersApiCall();

  const testApi = useCallback(() => {
    return execute(() => workersApi.testApi());
  }, [execute]);

  const getApiInfo = useCallback(() => {
    return execute(() => workersApi.getApiInfo());
  }, [execute]);

  return {
    result: data,
    loading,
    error,
    testApi,
    getApiInfo,
    reset,
  };
}
