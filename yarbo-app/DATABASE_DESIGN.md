# 📊 Yarbo招聘平台数据库设计文档

## 🎯 项目信息
- **Supabase项目**: yarbo-recruitment
- **项目ID**: eipqxgdqittupttmpiud
- **地区**: us-west-1
- **项目URL**: https://eipqxgdqittupttmpiud.supabase.co

## 📋 数据库架构

### 核心表结构

#### 1. **departments** - 部门表
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 部门唯一标识 |
| name | VARCHAR(100) | NOT NULL, UNIQUE | 部门名称 |
| color_theme | VARCHAR(20) | NOT NULL | 颜色主题 (blue/green/purple/orange) |
| description | TEXT | NULL | 部门描述 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**初始数据**:
- 产品研发部 (green)
- 机器人系统部 (blue)  
- 产品规划部 (green)
- 质量与可靠性部 (purple)
- 数据智能部 (orange)

#### 2. **jobs** - 职位表
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 职位唯一标识 |
| title | VARCHAR(200) | NOT NULL | 职位标题 |
| department_id | UUID | FOREIGN KEY | 关联部门ID |
| location | VARCHAR(100) | DEFAULT '上海' | 工作地点 |
| salary_min | INTEGER | NULL | 最低薪资 |
| salary_max | INTEGER | NULL | 最高薪资 |
| salary_display | VARCHAR(50) | NULL | 薪资显示文本 |
| description | TEXT | NOT NULL | 职位描述 |
| responsibilities | TEXT[] | NULL | 岗位职责数组 |
| requirements | TEXT[] | NULL | 任职要求数组 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态 (active/inactive/closed) |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 3. **applicants** - 申请者表
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 申请者唯一标识 |
| name | VARCHAR(100) | NOT NULL | 姓名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 邮箱地址 |
| phone | VARCHAR(20) | NOT NULL | 手机号码 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

#### 4. **resumes** - 简历文件表
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 简历唯一标识 |
| applicant_id | UUID | FOREIGN KEY | 关联申请者ID |
| filename | VARCHAR(255) | NOT NULL | 文件名 |
| file_path | VARCHAR(500) | NOT NULL | 文件路径 |
| file_size | INTEGER | NOT NULL | 文件大小 |
| content_type | VARCHAR(100) | DEFAULT 'application/pdf' | 文件类型 |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | 上传时间 |

#### 5. **applications** - 申请记录表
| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| id | UUID | PRIMARY KEY | 申请记录唯一标识 |
| job_id | UUID | FOREIGN KEY | 关联职位ID |
| applicant_id | UUID | FOREIGN KEY | 关联申请者ID |
| resume_id | UUID | FOREIGN KEY | 关联简历ID |
| status | VARCHAR(20) | DEFAULT 'submitted' | 申请状态 |
| applied_at | TIMESTAMP | DEFAULT NOW() | 申请时间 |
| reviewed_at | TIMESTAMP | NULL | 审核时间 |
| notes | TEXT | NULL | 备注信息 |

**申请状态枚举**:
- `submitted` - 已提交
- `reviewing` - 审核中
- `interview` - 面试中
- `rejected` - 已拒绝
- `offered` - 已发送offer

### 🔗 关系设计

```
departments (1) -----> (N) jobs
applicants (1) -----> (N) resumes
applicants (1) -----> (N) applications
jobs (1) -----> (N) applications
resumes (1) -----> (1) applications
```

### 📈 索引优化

#### 性能索引
- `idx_jobs_department` - jobs(department_id)
- `idx_jobs_status` - jobs(status)  
- `idx_jobs_created_at` - jobs(created_at DESC)
- `idx_applications_job` - applications(job_id)
- `idx_applications_applicant` - applications(applicant_id)
- `idx_applications_status` - applications(status)
- `idx_applications_applied_at` - applications(applied_at DESC)
- `idx_resumes_applicant` - resumes(applicant_id)

#### 唯一性索引
- `idx_applicants_email` - applicants(email) UNIQUE

### 🔒 行级安全策略 (RLS)

#### 公开访问策略
```sql
-- 部门表：公开读取
CREATE POLICY "Allow public read access to departments" ON departments
  FOR SELECT USING (true);

-- 职位表：公开读取活跃职位
CREATE POLICY "Allow public read access to active jobs" ON jobs
  FOR SELECT USING (status = 'active');
```

#### 用户数据保护
```sql
-- 申请者表：用户只能查看自己的数据
CREATE POLICY "Allow users to view their own data" ON applicants
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- 简历表：用户只能查看自己的简历
CREATE POLICY "Allow users to view their own resumes" ON resumes
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE email = auth.jwt() ->> 'email'
    )
  );
```

### 🔧 触发器和函数

#### 自动更新时间戳
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用到相关表
CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🚀 API设计

### 数据访问层 (`src/lib/api.ts`)

#### 职位相关
- `getJobs()` - 获取所有活跃职位（带部门信息）
- `getJobById(id)` - 根据ID获取职位详情
- `getJobStats()` - 获取统计数据

#### 申请相关  
- `createApplicant(data)` - 创建申请者
- `createResume(data)` - 创建简历记录
- `createApplication(data)` - 创建申请记录
- `findOrCreateApplicant(email, name, phone)` - 查找或创建申请者
- `submitJobApplication(jobId, applicantInfo, resumeFile)` - 完整申请流程

#### 部门相关
- `getDepartments()` - 获取所有部门

### TypeScript类型定义 (`src/lib/database.types.ts`)

```typescript
export type Job = Tables<'jobs'>
export type Department = Tables<'departments'>
export type Applicant = Tables<'applicants'>
export type Application = Tables<'applications'>
export type Resume = Tables<'resumes'>

// 带关联数据的类型
export type JobWithDepartment = Job & {
  departments: Department | null
}
```

## 🎨 前端集成

### 颜色主题映射
```typescript
// src/lib/supabase.ts
export function getDepartmentColor(colorTheme: string) {
  const colorMap = {
    green: { color: "text-green-600", bgColor: "bg-green-50", ... },
    blue: { color: "text-blue-600", bgColor: "bg-blue-50", ... },
    purple: { color: "text-purple-600", bgColor: "bg-purple-50", ... },
    orange: { color: "text-orange-600", bgColor: "bg-orange-50", ... }
  };
  return colorMap[colorTheme] || colorMap.blue;
}
```

### 环境变量配置
```env
NEXT_PUBLIC_SUPABASE_URL=https://eipqxgdqittupttmpiud.supabase.co
***REMOVED***=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 数据迁移历史

1. **create_core_tables** - 创建核心表结构和关系
2. **create_indexes** - 创建性能优化索引
3. **insert_initial_data** - 插入初始部门和职位数据
4. **enable_rls_and_policies** - 启用行级安全和访问策略

## 🔮 未来扩展计划

### 用户认证系统
- 申请者账户管理
- HR管理员权限
- 角色基础访问控制

### 高级功能
- 文件存储集成 (Supabase Storage)
- 实时通知系统
- 邮件自动化
- 申请状态跟踪
- 面试安排系统

### 性能优化
- 数据缓存策略
- 查询优化
- 分页和搜索
- 全文搜索索引

---

**📝 最后更新**: 2024-06-08  
**🗄️ 数据库状态**: 生产就绪，包含测试数据  
**🔧 下一步**: 前端集成和文件上传功能开发 