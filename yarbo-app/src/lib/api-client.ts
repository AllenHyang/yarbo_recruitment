import { supabase } from './supabase';

/**
 * 获取认证头信息
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

/**
 * 带认证的API客户端
 * 自动在请求头中添加认证令牌
 */
export class ApiClient {
  static async get(url: string, options?: RequestInit): Promise<Response> {
    const headers = await getAuthHeaders();

    return fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    });
  }

  static async post(url: string, data?: any, options?: RequestInit): Promise<Response> {
    const headers = await getAuthHeaders();

    return fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async put(url: string, data?: any, options?: RequestInit): Promise<Response> {
    const headers = await getAuthHeaders();

    return fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async patch(url: string, data?: any, options?: RequestInit): Promise<Response> {
    const headers = await getAuthHeaders();

    return fetch(url, {
      method: 'PATCH',
      headers: {
        ...headers,
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  static async delete(url: string, options?: RequestInit): Promise<Response> {
    const headers = await getAuthHeaders();

    return fetch(url, {
      method: 'DELETE',
      headers: {
        ...headers,
        ...options?.headers,
      },
      ...options,
    });
  }
}

/**
 * 简化的API调用函数
 */
export const apiClient = {
  get: ApiClient.get,
  post: ApiClient.post,
  put: ApiClient.put,
  patch: ApiClient.patch,
  delete: ApiClient.delete,
};

/**
 * 处理API响应的工具函数
 */
export async function handleApiResponse<T = any>(response: Response): Promise<{
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}> {
  const status = response.status;

  try {
    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        data,
        status,
      };
    } else {
      return {
        success: false,
        error: data.error || `请求失败 (${status})`,
        status,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `解析响应失败: ${error instanceof Error ? error.message : '未知错误'}`,
      status,
    };
  }
}

/**
 * 部门管理相关的API调用函数
 */
export const departmentApi = {
  // 获取部门列表
  async getDepartments(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const url = `/api/hr/departments${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await apiClient.get(url);
    return handleApiResponse(response);
  },

  // 获取部门统计
  async getDepartmentStats() {
    const response = await apiClient.get('/api/hr/departments/stats');
    return handleApiResponse(response);
  },

  // 获取部门详情
  async getDepartment(id: string) {
    const response = await apiClient.get(`/api/hr/departments/${id}`);
    return handleApiResponse(response);
  },

  // 创建部门
  async createDepartment(data: {
    name: string;
    description?: string;
    color_theme?: string;
  }) {
    const response = await apiClient.post('/api/hr/departments', data);
    return handleApiResponse(response);
  },

  // 更新部门
  async updateDepartment(id: string, data: {
    name: string;
    description?: string;
    color_theme?: string;
  }) {
    const response = await apiClient.put(`/api/hr/departments/${id}`, data);
    return handleApiResponse(response);
  },

  // 删除部门
  async deleteDepartment(id: string) {
    const response = await apiClient.delete(`/api/hr/departments/${id}`);
    return handleApiResponse(response);
  },
};

/**
 * 办公地点管理相关的API调用函数
 */
export const officeLocationApi = {
  // 获取办公地点列表
  async getAll(params?: {
    search?: string;
    page?: number;
    limit?: number;
    include_inactive?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.include_inactive) searchParams.set('include_inactive', 'true');

    const url = `/api/hr/office-locations${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await apiClient.get(url);
    return handleApiResponse(response);
  },

  // 获取办公地点详情
  async getById(id: string) {
    const response = await apiClient.get(`/api/hr/office-locations/${id}`);
    return handleApiResponse(response);
  },

  // 创建办公地点
  async create(data: any) {
    const response = await apiClient.post('/api/hr/office-locations', data);
    return handleApiResponse(response);
  },

  // 更新办公地点
  async update(id: string, data: any) {
    const response = await apiClient.put(`/api/hr/office-locations/${id}`, data);
    return handleApiResponse(response);
  },

  // 删除办公地点
  async delete(id: string) {
    const response = await apiClient.delete(`/api/hr/office-locations/${id}`);
    return handleApiResponse(response);
  },

  // 获取公开的活跃地点列表（用于职位申请等）
  async getPublic(params?: { include_remote?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.include_remote) searchParams.set('include_remote', 'true');

    const url = `/api/office-locations${searchParams.toString() ? `?${searchParams}` : ''}`;
    const response = await fetch(url); // 公开API不需要认证
    return handleApiResponse(response);
  },
};
