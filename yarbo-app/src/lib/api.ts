import { supabase } from './supabase'
import type {
  // Job, 
  Department,
  Applicant,
  Application,
  Resume,
  User,
  // UserProfile,
  HRDepartment,
  JobWithDepartment,
  UserWithProfile,
  // HRWithDepartments,
  UserRole,
  TablesInsert
} from './database.types'

// 用户和角色相关API
export async function createUser(
  userData: TablesInsert<'users'>
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  return data
}

export async function getUserByEmail(email: string): Promise<UserWithProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_profiles (*)
    `)
    .eq('email', email)
    .eq('status', 'active')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // User not found
    }
    throw error
  }

  // 转换数组为单个对象
  const userWithProfile = {
    ...data,
    user_profiles: data.user_profiles?.[0] || null
  }

  return userWithProfile as UserWithProfile
}

export async function getUserRole(email: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .rpc('get_user_role', { user_email: email })

  if (error) {
    console.error('Error getting user role:', error)
    return null
  }

  return data
}

export async function checkUserPermission(email: string, requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getUserRole(email)
  return userRole ? requiredRoles.includes(userRole) : false
}

export async function getHRDepartments(userId: string): Promise<Department[]> {
  const { data, error } = await supabase
    .from('hr_departments')
    .select(`
      departments (*)
    `)
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching HR departments:', error)
    throw error
  }

  return data.map(item => item.departments).filter(Boolean) as Department[]
}

export async function assignHRToDepartment(
  userId: string,
  departmentId: string
): Promise<HRDepartment> {
  const { data, error } = await supabase
    .from('hr_departments')
    .insert({
      user_id: userId,
      department_id: departmentId
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning HR to department:', error)
    throw error
  }

  return data
}

// 职位相关API
export async function getJobs(): Promise<JobWithDepartment[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      departments (*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    throw error
  }

  return data || []
}

export async function getJobById(id: string): Promise<JobWithDepartment | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      departments (*)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    if (error.code === 'PGRST116') {
      return null // Job not found
    }
    throw error
  }

  return data
}

// HR专用：根据部门权限获取职位
export async function getJobsByHRDepartments(hrUserId: string): Promise<JobWithDepartment[]> {
  // 首先获取HR可访问的部门
  const hrDepartments = await getHRDepartments(hrUserId)
  const departmentIds = hrDepartments.map(dept => dept.id)

  if (departmentIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      departments (*)
    `)
    .in('department_id', departmentIds)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs for HR:', error)
    throw error
  }

  return data || []
}

// 部门相关API
export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching departments:', error)
    throw error
  }

  return data || []
}

// 申请相关API
export async function createApplicant(
  applicantData: TablesInsert<'applicants'>
): Promise<Applicant> {
  const { data, error } = await supabase
    .from('applicants')
    .insert(applicantData)
    .select()
    .single()

  if (error) {
    console.error('Error creating applicant:', error)
    throw error
  }

  return data
}

export async function createResume(
  resumeData: TablesInsert<'resumes'>
): Promise<Resume> {
  const { data, error } = await supabase
    .from('resumes')
    .insert(resumeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating resume:', error)
    throw error
  }

  return data
}

export async function createApplication(
  applicationData: TablesInsert<'applications'>
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert(applicationData)
    .select()
    .single()

  if (error) {
    console.error('Error creating application:', error)
    throw error
  }

  return data
}

// 查找或创建申请者（避免重复）
export async function findOrCreateApplicant(
  email: string,
  name: string,
  phone: string,
  userId?: string
): Promise<Applicant> {
  // 首先尝试查找现有申请者
  const { data: existingApplicant, error: findError } = await supabase
    .from('applicants')
    .select('*')
    .eq('email', email)
    .single()

  if (findError && findError.code !== 'PGRST116') {
    throw findError
  }

  if (existingApplicant) {
    // 更新现有申请者信息
    const { data: updatedApplicant, error: updateError } = await supabase
      .from('applicants')
      .update({ name, phone, user_id: userId })
      .eq('id', existingApplicant.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return updatedApplicant
  }

  // 创建新申请者
  return createApplicant({ email, name, phone, user_id: userId })
}

// 统计数据API
export async function getJobStats() {
  const [jobsCount, departmentsCount] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('departments').select('id', { count: 'exact' })
  ])

  return {
    totalJobs: jobsCount.count || 0,
    totalDepartments: departmentsCount.count || 0,
    totalLocations: 1, // 目前只有上海
    satisfactionRate: 95 // 模拟数据
  }
}

// 文件上传API
export async function uploadResumeFile(
  file: File,
  applicantEmail: string
): Promise<{ filePath: string; fileUrl: string }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${applicantEmail}_${Date.now()}.${fileExt}`
  const filePath = `resumes/${fileName}`

  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading file:', error)
    throw error
  }

  // 获取文件的公开URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath)

  return {
    filePath: data.path,
    fileUrl: publicUrl
  }
}

// 完整的申请提交流程（包含文件上传）
export async function submitJobApplicationWithFile(
  jobId: string,
  applicantInfo: {
    name: string
    email: string
    phone: string
  },
  resumeFile: File,
  userId?: string
) {
  try {
    // 1. 上传简历文件
    const { filePath, fileUrl } = await uploadResumeFile(resumeFile, applicantInfo.email)

    // 2. 查找或创建申请者
    const applicant = await findOrCreateApplicant(
      applicantInfo.email,
      applicantInfo.name,
      applicantInfo.phone,
      userId
    )

    // 3. 创建简历记录
    const resume = await createResume({
      applicant_id: applicant.id,
      filename: resumeFile.name,
      file_path: filePath,
      file_size: resumeFile.size,
      content_type: resumeFile.type
    })

    // 4. 创建申请记录
    const application = await createApplication({
      job_id: jobId,
      applicant_id: applicant.id,
      resume_id: resume.id,
      status: 'submitted'
    })

    return {
      applicant,
      resume,
      application,
      fileUrl
    }

  } catch (error) {
    console.error('Error submitting application with file:', error)
    throw error
  }
}

// HR管理：获取申请列表
export async function getApplicationsForHR(hrUserId: string): Promise<any[]> {
  // 获取HR可访问的部门
  const hrDepartments = await getHRDepartments(hrUserId)
  const departmentIds = hrDepartments.map(dept => dept.id)

  if (departmentIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner (
        *,
        departments!inner (*)
      ),
      applicants (*),
      resumes (*)
    `)
    .in('jobs.department_id', departmentIds)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications for HR:', error)
    throw error
  }

  return data || []
}

// 状态更新相关API
export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  note?: string,
  changedBy?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`/api/hr/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        note,
        changed_by: changedBy
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '状态更新失败');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '状态更新失败'
    };
  }
}

// 获取申请状态历史
export async function getApplicationStatusHistory(
  applicationId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`/api/hr/applications/${applicationId}/status`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '获取状态历史失败');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error getting application status history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取状态历史失败'
    };
  }
}

// 消息管理相关API
export async function getMessages(
  userId: string,
  options?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const params = new URLSearchParams({
      userId,
      ...(options?.status && { status: options.status }),
      ...(options?.type && { type: options.type }),
      ...(options?.page && { page: options.page.toString() }),
      ...(options?.limit && { limit: options.limit.toString() })
    });

    const response = await fetch(`/api/messages?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '获取消息列表失败');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error getting messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取消息列表失败'
    };
  }
}

// 发送消息
export async function sendMessage(messageData: {
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  receiver_role: string;
  title: string;
  content: string;
  type: string;
  priority?: string;
  metadata?: any;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '发送消息失败');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '发送消息失败'
    };
  }
}

// 更新消息状态
export async function updateMessageStatus(
  messageId: string,
  status: string,
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '更新消息状态失败');
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error updating message status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新消息状态失败'
    };
  }
}

// 删除消息
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/messages/${messageId}?userId=${userId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '删除消息失败');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除消息失败'
    };
  }
}

// HR仪表板统计数据API
export async function getHRDashboardStats(hrUserId: string): Promise<{
  pendingApplications: number;
  monthlyApplications: number;
  interviewsPassed: number;
  monthlyHires: number;
  averageProcessingTime: number;
}> {
  try {
    // 获取HR可访问的部门
    const hrDepartments = await getHRDepartments(hrUserId);
    const departmentIds = hrDepartments.map(dept => dept.id);

    if (departmentIds.length === 0) {
      return {
        pendingApplications: 0,
        monthlyApplications: 0,
        interviewsPassed: 0,
        monthlyHires: 0,
        averageProcessingTime: 0
      };
    }

    // 获取当前月份的开始和结束时间
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 并行查询各种统计数据
    const [
      pendingAppsResult,
      monthlyAppsResult,
      interviewsPassedResult,
      monthlyHiresResult
    ] = await Promise.all([
      // 待处理申请数
      supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .in('jobs.department_id', departmentIds)
        .eq('status', 'submitted'),

      // 本月申请数
      supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .in('jobs.department_id', departmentIds)
        .gte('applied_at', monthStart.toISOString())
        .lte('applied_at', monthEnd.toISOString()),

      // 通过面试的申请数
      supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .in('jobs.department_id', departmentIds)
        .eq('status', 'interview_passed'),

      // 本月录用数
      supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .in('jobs.department_id', departmentIds)
        .eq('status', 'hired')
        .gte('updated_at', monthStart.toISOString())
        .lte('updated_at', monthEnd.toISOString())
    ]);

    return {
      pendingApplications: pendingAppsResult.count || 0,
      monthlyApplications: monthlyAppsResult.count || 0,
      interviewsPassed: interviewsPassedResult.count || 0,
      monthlyHires: monthlyHiresResult.count || 0,
      averageProcessingTime: 2.3 // 暂时使用固定值，后续可以计算实际平均时间
    };

  } catch (error) {
    console.error('Error fetching HR dashboard stats:', error);
    // 返回默认值而不是抛出错误，确保仪表板能正常显示
    return {
      pendingApplications: 0,
      monthlyApplications: 0,
      interviewsPassed: 0,
      monthlyHires: 0,
      averageProcessingTime: 0
    };
  }
}

// 获取申请趋势数据（用于图表）
export async function getApplicationTrendData(hrUserId: string, months: number = 6): Promise<Array<{
  month: string;
  applications: number;
  interviews: number;
  offers: number;
}>> {
  try {
    const hrDepartments = await getHRDepartments(hrUserId);
    const departmentIds = hrDepartments.map(dept => dept.id);

    if (departmentIds.length === 0) {
      return [];
    }

    // 获取过去几个月的数据
    const trendData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleDateString('zh-CN', { month: 'long' });

      const [applicationsResult, interviewsResult, offersResult] = await Promise.all([
        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .in('jobs.department_id', departmentIds)
          .gte('applied_at', monthStart.toISOString())
          .lte('applied_at', monthEnd.toISOString()),

        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .in('jobs.department_id', departmentIds)
          .in('status', ['interview_scheduled', 'interview_passed'])
          .gte('updated_at', monthStart.toISOString())
          .lte('updated_at', monthEnd.toISOString()),

        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .in('jobs.department_id', departmentIds)
          .eq('status', 'hired')
          .gte('updated_at', monthStart.toISOString())
          .lte('updated_at', monthEnd.toISOString())
      ]);

      trendData.push({
        month: monthName,
        applications: applicationsResult.count || 0,
        interviews: interviewsResult.count || 0,
        offers: offersResult.count || 0
      });
    }

    return trendData;

  } catch (error) {
    console.error('Error fetching application trend data:', error);
    return [];
  }
}

// 获取部门统计数据
export async function getDepartmentStats(hrUserId: string): Promise<Array<{
  department: string;
  applications: number;
  interviews: number;
  hires: number;
  color: string;
}>> {
  try {
    const hrDepartments = await getHRDepartments(hrUserId);

    if (hrDepartments.length === 0) {
      return [];
    }

    const departmentStats = [];

    for (const dept of hrDepartments) {
      const [applicationsResult, interviewsResult, hiresResult] = await Promise.all([
        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.department_id', dept.id),

        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.department_id', dept.id)
          .in('status', ['interview_scheduled', 'interview_passed']),

        supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.department_id', dept.id)
          .eq('status', 'hired')
      ]);

      departmentStats.push({
        department: dept.name,
        applications: applicationsResult.count || 0,
        interviews: interviewsResult.count || 0,
        hires: hiresResult.count || 0,
        color: dept.color_theme || 'blue'
      });
    }

    return departmentStats;

  } catch (error) {
    console.error('Error fetching department stats:', error);
    return [];
  }
}