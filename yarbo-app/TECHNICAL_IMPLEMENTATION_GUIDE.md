# Yarbo 招聘系统 - 技术实现指南

## 🏗️ 系统架构详解

### 整体架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (Next.js) │    │   API Routes    │    │  Supabase DB    │
│                 │    │                 │    │                 │
│  - React 组件   │◄──►│  - 认证中间件   │◄──►│  - PostgreSQL   │
│  - TypeScript   │    │  - 业务逻辑     │    │  - RLS 策略     │
│  - Tailwind CSS │    │  - 数据验证     │    │  - 存储桶       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   用户界面      │    │   服务层        │    │   数据层        │
│                 │    │                 │    │                 │
│  - 响应式设计   │    │  - 邮件服务     │    │  - 数据持久化   │
│  - 状态管理     │    │  - 文件处理     │    │  - 备份恢复     │
│  - 路由管理     │    │  - 权限控制     │    │  - 性能优化     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈选择理由

#### 前端技术栈
- **Next.js 15**: 
  - App Router 提供更好的性能和开发体验
  - 内置 TypeScript 支持
  - 服务端渲染和静态生成
  - 优秀的开发者工具

- **TypeScript**:
  - 类型安全，减少运行时错误
  - 更好的IDE支持和代码提示
  - 大型项目的可维护性

- **Tailwind CSS**:
  - 实用优先的CSS框架
  - 快速原型开发
  - 一致的设计系统
  - 优秀的响应式支持

#### 后端技术栈
- **Supabase**:
  - 开源的Firebase替代品
  - 内置认证和授权
  - 实时数据库功能
  - 强大的RLS安全策略

- **PostgreSQL**:
  - 成熟稳定的关系型数据库
  - 强大的查询能力
  - 良好的扩展性
  - 丰富的数据类型支持

## 🔐 认证与授权系统

### 认证流程
```typescript
// 1. 用户登录
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  // 2. 获取用户角色
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();
    
  return { user: data.user, role: profile?.role };
};

// 3. 权限检查中间件
export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return NextResponse.json({ error: '认证失败' }, { status: 401 });
  }
  
  return { user };
}
```

### RLS 安全策略
```sql
-- 用户只能访问自己的资料
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- HR可以查看所有申请
CREATE POLICY "HR can view applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('hr', 'admin')
    )
  );

-- 候选人只能查看自己的申请
CREATE POLICY "Candidates can view own applications" ON applications
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants 
      WHERE user_id = auth.uid()
    )
  );
```

## 📁 文件管理系统

### 简历上传实现
```typescript
// 前端上传组件
const ResumeUpload: React.FC = () => {
  const handleFileUpload = async (file: File) => {
    // 1. 文件验证
    const allowedTypes = ['application/pdf', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('只支持PDF和Word文档');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('文件大小不能超过10MB');
    }
    
    // 2. 上传到Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);
      
    if (error) throw error;
    
    // 3. 保存文件记录到数据库
    const { data: resume } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_path: fileName,
        file_size: file.size,
        is_primary: false
      })
      .select()
      .single();
      
    return resume;
  };
};

// 后端API处理
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // 验证用户权限
  const { user } = await authMiddleware(request);
  
  // 处理文件上传
  const result = await uploadResume(file, user.id);
  
  return NextResponse.json({ success: true, data: result });
}
```

### 文件安全策略
```sql
-- 存储桶策略：用户只能访问自己的文件
CREATE POLICY "Users can upload own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 📊 数据库设计详解

### 核心表结构
```sql
-- 用户基础表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户详细资料表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'candidate',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 职位表
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_display VARCHAR(50),
  status VARCHAR(20) DEFAULT 'published',
  priority INTEGER DEFAULT 3,
  expires_at DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 申请人表
CREATE TABLE applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 申请表
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id),
  cover_letter TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 简历表
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 索引优化
```sql
-- 性能优化索引
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_is_primary ON resumes(is_primary);

-- 复合索引
CREATE INDEX idx_applications_job_status ON applications(job_id, status);
CREATE INDEX idx_jobs_status_department ON jobs(status, department);
```

## 🔄 状态管理

### React Context 状态管理
```typescript
// 认证状态管理
interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {}
});

// 应用状态管理
interface AppState {
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => {},
  actions: {
    fetchJobs: async () => {},
    submitApplication: async () => {},
    updateApplicationStatus: async () => {}
  }
});
```

### 数据获取策略
```typescript
// SWR 数据缓存
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const useJobs = (params?: JobsParams) => {
  const { data, error, mutate } = useSWR(
    params ? `/api/jobs?${new URLSearchParams(params)}` : '/api/jobs',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000 // 30秒自动刷新
    }
  );

  return {
    jobs: data?.data || [],
    loading: !error && !data,
    error,
    refresh: mutate
  };
};

// 乐观更新
export const useApplications = () => {
  const { data, error, mutate } = useSWR('/api/applications', fetcher);

  const updateStatus = async (id: string, status: string) => {
    // 乐观更新
    const optimisticData = {
      ...data,
      data: data.data.map((app: Application) =>
        app.id === id ? { ...app, status } : app
      )
    };
    
    mutate(optimisticData, false);
    
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      mutate(); // 重新验证数据
    } catch (error) {
      mutate(); // 回滚到服务器数据
      throw error;
    }
  };

  return {
    applications: data?.data || [],
    loading: !error && !data,
    error,
    updateStatus
  };
};
```

## 📧 邮件系统实现

### 邮件服务架构
```typescript
// 邮件模板系统
enum EmailType {
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_STATUS_UPDATE = 'application_status_update',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  OFFER_EXTENDED = 'offer_extended'
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private templates: Map<EmailType, EmailTemplate> = new Map();
  
  constructor() {
    this.loadTemplates();
  }
  
  private loadTemplates() {
    this.templates.set(EmailType.APPLICATION_RECEIVED, {
      subject: '申请确认 - {{jobTitle}}',
      html: `
        <h2>申请确认</h2>
        <p>亲爱的 {{candidateName}}，</p>
        <p>我们已收到您对 <strong>{{jobTitle}}</strong> 职位的申请。</p>
        <p>我们会在 {{reviewDays}} 个工作日内审核您的申请。</p>
        <p>感谢您对 {{companyName}} 的关注！</p>
      `,
      text: '申请确认...'
    });
  }
  
  async sendEmail(
    type: EmailType,
    to: string,
    data: Record<string, any>
  ): Promise<boolean> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`邮件模板不存在: ${type}`);
    }
    
    const subject = this.renderTemplate(template.subject, data);
    const html = this.renderTemplate(template.html, data);
    const text = this.renderTemplate(template.text, data);
    
    return this.sendRawEmail(to, subject, html, text);
  }
  
  private renderTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
  
  private async sendRawEmail(
    to: string,
    subject: string,
    html: string,
    text: string
  ): Promise<boolean> {
    // 实际的邮件发送逻辑
    // 可以使用 Nodemailer、SendGrid、AWS SES 等
    return true;
  }
}
```

---

**文档版本**: v1.0.0  
**最后更新**: 2025年6月15日
