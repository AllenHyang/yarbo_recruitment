/**
 * Cloudflare Workers API 客户端
 * 专门用于调用我们的 Cloudflare Workers API
 */

// API 基础配置
const WORKERS_API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
  : 'http://localhost:8787';

// API 响应类型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface WorkersApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  runtime?: string;
  count?: number;
}

// 认证相关类型
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: 'candidate' | 'hr' | 'admin';
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}

// 职位相关类型
interface JobsQuery {
  fields?: string;
  limit?: number;
  offset?: number;
}

// 申请相关类型
interface ApplicationSubmit {
  jobId: string;
  candidateId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

// 通知相关类型
interface NotificationsQuery {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
}

class WorkersApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = WORKERS_API_BASE_URL;
    // 从 localStorage 获取访问令牌
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('workers_access_token');
    }
  }

  // 设置访问令牌
  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('workers_access_token', token);
    }
  }

  // 清除访问令牌
  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('workers_access_token');
      localStorage.removeItem('workers_refresh_token');
    }
  }

  // 通用请求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<WorkersApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 添加认证头
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Workers API Error [${response.status}]:`, data);
      }

      return data;
    } catch (error) {
      console.error('Workers API Request Error:', error);
      return {
        success: false,
        error: '网络请求失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==================== 基础 API ====================

  // 获取 API 信息
  async getApiInfo(): Promise<WorkersApiResponse> {
    return this.request('/');
  }

  // 测试 API
  async testApi(): Promise<WorkersApiResponse> {
    return this.request('/api/test');
  }

  // ==================== 认证 API ====================

  // 用户登录
  async login(credentials: LoginRequest): Promise<WorkersApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // 登录成功后保存令牌
    if (response.success && response.data) {
      this.setAccessToken(response.data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('workers_refresh_token', response.data.refresh_token);
      }
    }

    return response;
  }

  // 用户注册
  async register(userData: RegisterRequest): Promise<WorkersApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // 获取用户信息
  async getUser(): Promise<WorkersApiResponse> {
    return this.request('/api/auth/user');
  }

  // 刷新令牌
  async refreshToken(): Promise<WorkersApiResponse<AuthResponse>> {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('workers_refresh_token') 
      : null;

    if (!refreshToken) {
      return {
        success: false,
        error: '没有刷新令牌'
      };
    }

    const response = await this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    // 刷新成功后更新令牌
    if (response.success && response.data) {
      this.setAccessToken(response.data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('workers_refresh_token', response.data.refresh_token);
      }
    }

    return response;
  }

  // 用户登出
  async logout(): Promise<WorkersApiResponse> {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });

    // 清除本地令牌
    this.clearAccessToken();

    return response;
  }

  // ==================== 职位 API ====================

  // 获取职位列表
  async getJobs(query: JobsQuery = {}): Promise<WorkersApiResponse> {
    const params = new URLSearchParams();
    
    if (query.fields) params.append('fields', query.fields);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/jobs${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // ==================== 申请 API ====================

  // 提交申请
  async submitApplication(application: ApplicationSubmit): Promise<WorkersApiResponse> {
    return this.request('/api/applications/submit', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  // ==================== 文件上传 API ====================

  // 上传简历
  async uploadResume(file: File, fileName?: string): Promise<WorkersApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    return this.request('/api/upload/resume', {
      method: 'POST',
      body: formData,
      headers: {}, // 不设置 Content-Type，让浏览器自动设置
    });
  }

  // 上传头像
  async uploadAvatar(file: File): Promise<WorkersApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/api/upload/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // 不设置 Content-Type，让浏览器自动设置
    });
  }

  // 获取签名 URL
  async getSignedUrl(fileName: string, fileType: string, bucket = 'resumes'): Promise<WorkersApiResponse> {
    return this.request('/api/upload/signed-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType, bucket }),
    });
  }

  // 删除文件
  async deleteFile(fileName: string): Promise<WorkersApiResponse> {
    return this.request(`/api/upload/delete/${fileName}`, {
      method: 'DELETE',
    });
  }

  // ==================== 通知 API ====================

  // 获取通知列表
  async getNotifications(query: NotificationsQuery = {}): Promise<WorkersApiResponse> {
    const params = new URLSearchParams();
    
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.unread_only) params.append('unread_only', 'true');

    const queryString = params.toString();
    const endpoint = `/api/notifications${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // 标记通知为已读
  async markNotificationAsRead(notificationId: string): Promise<WorkersApiResponse> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // 删除通知
  async deleteNotification(notificationId: string): Promise<WorkersApiResponse> {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // 批量标记为已读
  async markAllNotificationsAsRead(): Promise<WorkersApiResponse> {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  // 获取未读通知数量
  async getUnreadNotificationCount(): Promise<WorkersApiResponse> {
    return this.request('/api/notifications/unread-count');
  }

  // 创建通知
  async createNotification(notification: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
  }): Promise<WorkersApiResponse> {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }
}

// 导出单例实例
export const workersApi = new WorkersApiClient();

// 导出类型
export type {
  WorkersApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JobsQuery,
  ApplicationSubmit,
  NotificationsQuery,
};

// 导出类
export { WorkersApiClient };
