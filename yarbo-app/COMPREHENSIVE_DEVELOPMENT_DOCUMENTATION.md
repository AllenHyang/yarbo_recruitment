# Yarbo 招聘系统 - 完整开发文档

## 📋 项目概览

**项目名称**: Yarbo 招聘管理系统  
**版本**: v5.0.0  
**开发时间**: 2024 年 12 月 - 2025 年 6 月  
**技术栈**: Next.js 15, TypeScript, Supabase, Tailwind CSS, Playwright  
**部署状态**: ✅ 生产就绪

## 🎯 系统功能特性

### 1. 核心招聘功能

- **职位管理**: 创建、编辑、发布、暂停职位
- **申请管理**: 候选人申请、状态跟踪、批量操作
- **简历管理**: 多简历上传、主简历设置、文件管理
- **面试调度**: 智能面试安排、时间冲突检测
- **Offer 管理**: Offer 创建、发送、状态跟踪

### 2. 用户角色系统

- **候选人(Candidate)**: 职位浏览、申请投递、状态查询
- **HR 人员(HR)**: 申请审核、面试安排、候选人管理
- **管理员(Admin)**: 系统管理、用户管理、数据分析

### 3. 高级功能

- **Excel 批量上传**: JD 批量导入、模板下载
- **智能搜索**: 职位搜索、候选人筛选
- **通知系统**: 邮件通知、站内消息
- **数据导出**: 申请数据、统计报告
- **权限控制**: RLS 安全策略、角色权限

## 🏗️ 技术架构

### 前端架构

```
yarbo-app/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/            # 认证相关页面
│   │   ├── api/               # API路由
│   │   ├── hr/                # HR管理页面
│   │   └── [pages]/           # 公开页面
│   ├── components/            # 可复用组件
│   │   ├── ui/               # 基础UI组件
│   │   └── [feature]/        # 功能组件
│   ├── contexts/             # React Context
│   ├── hooks/                # 自定义Hooks
│   ├── lib/                  # 工具库
│   └── utils/                # 工具函数
```

### 后端架构

- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth (JWT)
- **存储**: Supabase Storage (简历文件)
- **API**: Next.js API Routes
- **安全**: Row Level Security (RLS)

### 数据库设计

```sql
-- 核心表结构
users                 # 用户基础信息
user_profiles         # 用户详细资料
jobs                  # 职位信息
applications          # 申请记录
applicants            # 申请人信息
resumes               # 简历文件
interviews            # 面试记录
offers                # Offer记录
departments           # 部门管理
office_locations      # 办公地点
notifications         # 通知消息
```

## 🔧 核心功能实现

### 1. 认证与权限系统

```typescript
// 认证上下文
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  userRole: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
});

// 权限检查
export async function requireHROrAdmin(request: NextRequest) {
  const { user, userRole } = await getUserFromRequest(request);
  if (!user || !["hr", "admin"].includes(userRole)) {
    return { success: false, error: "权限不足", status: 403 };
  }
  return { success: true, user, userRole };
}
```

### 2. 简历管理系统

```typescript
// 多简历上传
const handleResumeUpload = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("resumes")
    .upload(fileName, file);

  if (!error) {
    await supabase.from("resumes").insert({
      user_id: user.id,
      filename: file.name,
      file_path: fileName,
      is_primary: isFirstResume,
    });
  }
};
```

### 3. Excel 批量上传

```typescript
// Excel解析和批量创建职位
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // 数据验证和批量插入
  for (const job of jobs) {
    await supabase.from("jobs").insert(job);
  }
}
```

## 📊 API 接口文档

### 认证相关

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 职位管理

- `GET /api/jobs` - 获取职位列表
- `POST /api/jobs` - 创建职位
- `PUT /api/jobs/[id]` - 更新职位
- `DELETE /api/jobs/[id]` - 删除职位

### 申请管理

- `GET /api/applications` - 获取申请列表
- `POST /api/applications` - 提交申请
- `PUT /api/applications/[id]` - 更新申请状态
- `GET /api/applications/user` - 获取用户申请

### HR 管理

- `GET /api/hr/candidates` - 候选人管理
- `GET /api/hr/applications` - 申请管理
- `POST /api/hr/jobs/bulk-upload` - 批量上传职位
- `GET /api/hr/jobs/template` - 下载 Excel 模板

### 文件管理

- `POST /api/resumes/upload` - 上传简历
- `GET /api/resumes/[id]/url` - 获取简历下载链接
- `PUT /api/resumes/[id]/primary` - 设置主简历

## 🔒 安全策略

### Row Level Security (RLS)

```sql
-- 用户只能访问自己的数据
CREATE POLICY "Users can only access their own data" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- HR可以查看所有申请
CREATE POLICY "HR can view all applications" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('hr', 'admin')
    )
  );
```

### 权限控制

- **候选人**: 只能查看和修改自己的数据
- **HR**: 可以查看所有申请和候选人信息
- **管理员**: 拥有系统完整权限

## 🧪 测试策略

### Playwright 端到端测试

```typescript
// 测试套件覆盖
test.describe("招聘系统完整功能测试", () => {
  test("用户注册和登录流程", async ({ page }) => {
    // 测试用户认证流程
  });

  test("职位申请流程", async ({ page }) => {
    // 测试完整申请流程
  });

  test("HR管理功能", async ({ page }) => {
    // 测试HR管理界面
  });
});
```

### 测试覆盖范围

- ✅ 用户认证流程
- ✅ 职位浏览和申请
- ✅ 简历上传管理
- ✅ HR 申请审核
- ✅ 权限控制验证
- ✅ 数据安全测试

## 📈 性能优化

### 前端优化

- **代码分割**: Next.js 动态导入
- **图片优化**: Next.js Image 组件
- **缓存策略**: SWR 数据缓存
- **懒加载**: 组件按需加载

### 后端优化

- **数据库索引**: 关键字段索引优化
- **查询优化**: 减少 N+1 查询
- **文件存储**: CDN 加速
- **API 缓存**: 响应缓存策略

## 🚀 部署配置

### 环境变量

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
***REMOVED***=your_anon_key
***REMOVED***=your_service_role_key

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### 部署步骤

1. **构建项目**: `npm run build`
2. **环境配置**: 设置生产环境变量
3. **数据库迁移**: 执行 SQL 迁移脚本
4. **静态资源**: 配置 CDN
5. **域名配置**: SSL 证书设置

## 📋 功能清单

### ✅ 已完成功能

- [x] 用户认证系统
- [x] 职位管理系统
- [x] 申请管理系统
- [x] 简历管理系统
- [x] HR 管理界面
- [x] 权限控制系统
- [x] Excel 批量上传
- [x] 邮件通知系统
- [x] 数据导出功能
- [x] 响应式设计
- [x] 安全策略实施
- [x] 完整测试覆盖

### 🔄 持续改进

- [ ] 移动端 APP
- [ ] 高级分析报表
- [ ] AI 简历匹配
- [ ] 视频面试集成
- [ ] 多语言支持

## 🎉 项目成果

### 技术成就

- **现代化架构**: 基于 Next.js 15 的全栈应用
- **类型安全**: 100% TypeScript 覆盖
- **安全可靠**: 企业级安全策略
- **高性能**: 优化的用户体验
- **可维护**: 清晰的代码结构

### 业务价值

- **效率提升**: 自动化招聘流程
- **成本节约**: 减少人工操作
- **用户体验**: 直观的操作界面
- **数据洞察**: 完整的数据分析
- **扩展性**: 支持业务增长

## 🛠️ 开发工具和环境

### 开发环境

- **Node.js**: v18.0.0+
- **npm**: v9.0.0+
- **TypeScript**: v5.0.0+
- **Next.js**: v15.3.3

### 开发工具

- **IDE**: VS Code
- **版本控制**: Git
- **包管理**: npm
- **测试**: Playwright
- **部署**: Vercel/自托管

### 代码质量

- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Husky**: Git 钩子

## 📚 开发指南

### 本地开发设置

```bash
# 1. 克隆项目
git clone <repository-url>
cd yarbo-recruitment

# 2. 安装依赖
cd yarbo-app
npm install

# 3. 环境配置
cp .env.example .env.local
# 编辑 .env.local 添加必要的环境变量

# 4. 启动开发服务器
npm run dev
```

### 数据库设置

```bash
# 1. 创建Supabase项目
# 2. 执行数据库迁移
psql -h <host> -U <user> -d <database> -f 数据库/数据库迁移.sql

# 3. 插入演示数据
psql -h <host> -U <user> -d <database> -f 数据库/演示数据.sql
```

### 测试运行

```bash
# 运行所有测试
npm run test

# 运行特定测试
npx playwright test tests/01-basic-functionality.spec.ts

# 生成测试报告
npx playwright show-report
```

## 🔍 故障排除

### 常见问题

1. **认证失败**: 检查 Supabase 配置和 JWT 密钥
2. **文件上传失败**: 验证存储桶权限设置
3. **RLS 策略错误**: 检查数据库安全策略
4. **邮件发送失败**: 确认 SMTP 配置正确

### 调试技巧

- 使用浏览器开发者工具查看网络请求
- 检查 Supabase 仪表板中的日志
- 启用详细的错误日志记录
- 使用 Playwright 调试模式

## 📖 API 使用示例

### 获取职位列表

```javascript
const response = await fetch("/api/jobs?page=1&limit=10");
const { data } = await response.json();
```

### 提交职位申请

```javascript
const applicationData = {
  job_id: "job-uuid",
  resume_id: "resume-uuid",
  cover_letter: "求职信内容",
};

const response = await fetch("/api/applications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(applicationData),
});
```

### 上传简历

```javascript
const formData = new FormData();
formData.append("file", resumeFile);

const response = await fetch("/api/resumes/upload", {
  method: "POST",
  body: formData,
});
```

## 🎨 UI/UX 设计原则

### 设计系统

- **颜色方案**: 蓝色主题，专业简洁
- **字体**: 系统字体栈，优秀的可读性
- **间距**: 8px 网格系统
- **组件**: 基于 Radix UI 的可访问组件

### 响应式设计

- **移动优先**: 从小屏幕开始设计
- **断点**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **布局**: Flexbox 和 Grid 布局
- **图片**: 自适应图片和图标

### 可访问性

- **键盘导航**: 完整的键盘支持
- **屏幕阅读器**: ARIA 标签和语义化 HTML
- **颜色对比**: WCAG 2.1 AA 标准
- **焦点管理**: 清晰的焦点指示器

---

**开发团队**: Yarbo
**项目状态**: ✅ 生产就绪
**最后更新**: 2025 年 6 月 15 日
**文档版本**: v1.0.0
