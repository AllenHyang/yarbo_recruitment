import { supabase } from './supabase'
import type {
  // Job,
  Department,
  Applicant,
  Application,
  Resume,
  User,
  UserProfile,
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

// 用户资料管理API - 使用 Supabase upsert 最佳实践（枚举问题已修复）
export async function updateUserProfile(
  userId: string,
  profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
  }
): Promise<UserProfile> {
  try {
    console.log('updateUserProfile called with:', { userId, profileData });

    // 获取当前会话并刷新认证状态
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', session?.user?.id, 'Target userId:', userId);

    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    if (!session) {
      throw new Error('No active session');
    }

    // 验证用户只能更新自己的资料
    if (session.user.id !== userId) {
      throw new Error('Unauthorized: Can only update own profile');
    }

    // 尝试刷新会话以确保最新的认证状态
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.warn('Failed to refresh session:', refreshError);
    } else if (refreshedSession) {
      console.log('Session refreshed successfully');
    }

    // 使用原始 Supabase 客户端进行 upsert 操作
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user profile:', error)
      throw error
    }

    console.log('Successfully upserted user profile:', data);
    return data
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    throw error
  }
}

export async function createUserProfile(
  userId: string,
  profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
  }
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profileData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  return data
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
    .select('*')
    .in('status', ['active', 'published'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
    throw error
  }

  // 转换数据格式以匹配 JobWithDepartment 类型
  const jobsWithDepartment = (data || []).map(job => ({
    ...job,
    departments: job.department ? { name: job.department } : null
  }))

  return jobsWithDepartment as JobWithDepartment[]
}

// 职位详情缓存
const jobDetailsCache = new Map<string, { data: JobWithDepartment, timestamp: number }>();
const JOB_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export async function getJobById(id: string, forceRefresh = false): Promise<JobWithDepartment | null> {
  const now = Date.now();

  // 检查缓存
  if (!forceRefresh) {
    const cached = jobDetailsCache.get(id);
    if (cached && (now - cached.timestamp) < JOB_CACHE_DURATION) {
      console.log(`使用缓存的职位详情数据: ${id}`);
      return cached.data;
    }
  }

  console.log(`从数据库获取职位详情: ${id}`);
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      department,
      location,
      salary_min,
      salary_max,
      salary_display,
      employment_type,
      experience_level,
      description,
      requirements,
      responsibilities,
      status,
      created_at,
      expires_at,
      job_category,
      graduation_year,
      is_featured,
      campus_specific,
      internship_duration,
      internship_type,
      start_date,
      stipend_amount,
      skills_gained,
      is_remote_internship
    `)
    .eq('id', id)
    .in('status', ['active', 'published'])
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    if (error.code === 'PGRST116') {
      return null // Job not found
    }
    throw error
  }

  // 转换数据格式以匹配 JobWithDepartment 类型
  const jobWithDepartment = {
    ...data,
    departments: data.department ? { name: data.department } : null
  } as JobWithDepartment;

  // 更新缓存
  jobDetailsCache.set(id, { data: jobWithDepartment, timestamp: now });

  return jobWithDepartment;
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

// 统计数据缓存
let jobStatsCache: { data: any, timestamp: number } | null = null;
const STATS_CACHE_DURATION = 2 * 60 * 1000; // 2分钟缓存

// 优化的统计数据API
export async function getJobStats(forceRefresh = false) {
  const now = Date.now();

  // 检查缓存
  if (!forceRefresh && jobStatsCache && (now - jobStatsCache.timestamp) < STATS_CACHE_DURATION) {
    console.log('使用缓存的统计数据');
    return jobStatsCache.data;
  }

  console.log('从数据库获取统计数据');
  try {
    const [jobsCount, uniqueDepartments, uniqueLocations] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('jobs').select('department').eq('status', 'active'),
      supabase.from('jobs').select('location').eq('status', 'active')
    ]);

    // 检查查询是否成功
    if (jobsCount.error || uniqueDepartments.error || uniqueLocations.error) {
      console.error('统计数据查询错误:', {
        jobsError: jobsCount.error,
        departmentsError: uniqueDepartments.error,
        locationsError: uniqueLocations.error
      });
      throw new Error('统计数据查询失败');
    }

    // 计算唯一部门数量
    const departments = new Set((uniqueDepartments.data || []).map(job => job.department).filter(Boolean));

    // 计算唯一地点数量
    const locations = new Set((uniqueLocations.data || []).map(job => job.location).filter(Boolean));

    const stats = {
      totalJobs: jobsCount.count || 0,
      totalDepartments: departments.size,
      totalLocations: locations.size,
      satisfactionRate: 95 // 模拟数据
    };

    // 更新缓存
    jobStatsCache = { data: stats, timestamp: now };

    console.log('统计数据获取成功:', stats);
    return stats;
  } catch (error) {
    console.error('获取统计数据失败:', error);

    // 返回降级数据
    const fallbackStats = {
      totalJobs: 37,
      totalDepartments: 12,
      totalLocations: 1,
      satisfactionRate: 95
    };

    console.log('使用降级统计数据:', fallbackStats);
    return fallbackStats;
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

// 用户简历管理相关API
export async function getUserResumes(userId: string): Promise<Resume[]> {
  try {
    // 首先获取用户的申请者记录
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (applicantError || !applicant) {
      // 如果没有申请者记录，说明用户还没有上传过简历
      return []
    }

    // 获取所有简历记录，按主简历和上传时间排序
    const { data: resumes, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('applicant_id', applicant.id)
      .order('is_primary', { ascending: false })
      .order('uploaded_at', { ascending: false })

    if (resumeError || !resumes) {
      return []
    }

    return resumes
  } catch (error) {
    console.error('Error getting user resumes:', error)
    return []
  }
}

// 向后兼容：获取用户的主简历
export async function getUserResume(userId: string): Promise<Resume | null> {
  try {
    const resumes = await getUserResumes(userId)
    // 返回主简历，如果没有主简历则返回最新的
    return resumes.find(r => r.is_primary) || resumes[0] || null
  } catch (error) {
    console.error('Error getting user resume:', error)
    return null
  }
}

export async function uploadUserResume(
  userId: string,
  file: File,
  userEmail: string
): Promise<{ success: boolean; data?: Resume; error?: string }> {
  try {
    // 1. 上传文件到存储
    const { filePath, fileUrl } = await uploadResumeFile(file, userEmail)

    // 2. 获取或创建申请者记录
    let { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (applicantError || !applicant) {
      // 如果申请者记录不存在，则创建一个
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('用户信息不存在')
      }

      // 获取用户资料
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, phone')
        .eq('user_id', userId)
        .single()

      // 构建用户姓名
      let userName = userEmail.split('@')[0] // 默认使用邮箱前缀
      if (profile?.first_name || profile?.last_name) {
        userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
      }

      // 创建申请者记录
      const { data: newApplicant, error: createError } = await supabase
        .from('applicants')
        .insert({
          user_id: userId,
          email: user.email,
          name: userName,
          phone: profile?.phone || '' // 使用用户资料中的电话号码
        })
        .select('id')
        .single()

      if (createError || !newApplicant) {
        throw new Error('创建申请者记录失败')
      }

      applicant = newApplicant
    }

    // 3. 检查是否是第一个简历（如果是，设为主简历）
    const { data: existingResumes, error: existingError } = await supabase
      .from('resumes')
      .select('id')
      .eq('applicant_id', applicant.id)

    const isFirstResume = !existingError && (!existingResumes || existingResumes.length === 0)

    // 4. 创建新的简历记录
    const resume = await createResume({
      applicant_id: applicant.id,
      filename: file.name,
      file_path: filePath,
      file_size: file.size,
      content_type: file.type,
      is_primary: isFirstResume // 第一个简历自动设为主简历
    })

    return { success: true, data: resume }
  } catch (error) {
    console.error('Error uploading user resume:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '简历上传失败'
    }
  }
}

export async function deleteUserResume(userId: string, resumeId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    let resumeToDelete: Resume | null = null

    if (resumeId) {
      // 删除指定的简历
      const resumes = await getUserResumes(userId)
      resumeToDelete = resumes.find(r => r.id === resumeId) || null
    } else {
      // 向后兼容：删除主简历
      resumeToDelete = await getUserResume(userId)
    }

    if (!resumeToDelete) {
      return { success: true } // 没有简历可删除
    }

    // 检查是否是主简历，如果是且还有其他简历，需要设置新的主简历
    if (resumeToDelete.is_primary) {
      const allResumes = await getUserResumes(userId)
      const otherResumes = allResumes.filter(r => r.id !== resumeToDelete.id)

      if (otherResumes.length > 0) {
        // 将最新的简历设为主简历
        await supabase
          .from('resumes')
          .update({ is_primary: true })
          .eq('id', otherResumes[0].id)
      }
    }

    // 删除存储中的文件
    await supabase.storage
      .from('resumes')
      .remove([resumeToDelete.file_path])

    // 删除数据库记录
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeToDelete.id)

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting user resume:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '简历删除失败'
    }
  }
}

// 设置主简历
export async function setPrimaryResume(userId: string, resumeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 获取用户的申请者记录
    const { data: applicant, error: applicantError } = await supabase
      .from('applicants')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (applicantError || !applicant) {
      return { success: false, error: '申请者记录不存在' }
    }

    // 验证简历是否属于该用户
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('id')
      .eq('id', resumeId)
      .eq('applicant_id', applicant.id)
      .single()

    if (resumeError || !resume) {
      return { success: false, error: '简历不存在或无权限' }
    }

    // 先将所有简历设为非主简历
    await supabase
      .from('resumes')
      .update({ is_primary: false })
      .eq('applicant_id', applicant.id)

    // 设置指定简历为主简历
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ is_primary: true })
      .eq('id', resumeId)

    if (updateError) {
      throw updateError
    }

    return { success: true }
  } catch (error) {
    console.error('Error setting primary resume:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '设置主简历失败'
    }
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

    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages?${params}`);
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
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages`, {
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
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages/${messageId}`, {
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
    // 使用 Cloudflare Workers API
    const workersApiUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_WORKERS_API_URL || 'https://your-worker.your-subdomain.workers.dev'
      : 'http://localhost:8787';

    const response = await fetch(`${workersApiUrl}/api/messages/${messageId}?userId=${userId}`, {
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