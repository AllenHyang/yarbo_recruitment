# 雅宝招聘系统 (Yarbo Recruitment System)

一个现代化的企业招聘管理系统，基于 Next.js 开发，部署在 AWS Amplify 平台。

## 🌟 项目概览

雅宝招聘系统是一个全功能的企业招聘解决方案，提供完整的招聘流程管理，包括职位发布、候选人申请、HR管理、面试安排等核心功能。

### 主要特性

- 📱 **响应式设计**: 支持桌面端和移动端访问
- 🔐 **多角色权限**: 支持候选人、HR、管理员多角色管理
- 📊 **数据分析**: 提供招聘数据统计和分析报告
- 🎯 **智能匹配**: 职位和候选人智能匹配推荐
- 📧 **邮件通知**: 完整的邮件通知和提醒系统
- 🏫 **校园招聘**: 专门的校园招聘和实习生管理
- 📄 **简历管理**: 在线简历查看和管理
- 💬 **消息中心**: 实时消息和通知系统

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账户 (数据库)

### 安装和运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd yarbo_recruitment
   ```

2. **进入主应用目录**
   ```bash
   cd yarbo-app
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   
   复制环境变量模板：
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local` 文件，填入必要的配置：
   ```env
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # 邮件配置 (可选)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

6. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

## 📁 项目结构

```
yarbo_recruitment/
├── yarbo-app/              # 主应用 (Next.js)
│   ├── src/app/           # 页面和API路由
│   ├── src/components/    # React组件
│   ├── src/lib/          # 工具库
│   └── tests/            # 自动化测试
├── 文档/                  # 项目文档
├── 数据库/                # 数据库脚本
├── 项目规划/              # 设计文档
└── README.md             # 项目说明
```

详细的目录结构说明请查看 [项目结构说明.md](./项目结构说明.md)

## 🧪 测试

```bash
cd yarbo-app

# 运行所有测试
npm run test

# 运行端到端测试
npm run test:e2e

# 运行特定测试
npm run test tests/01-basic-functionality.spec.ts
```

## 🚢 部署

### AWS Amplify 部署

1. **推送代码到 Git 仓库**
2. **在 AWS Amplify 控制台连接仓库**
3. **配置构建设置** (使用项目中的 `amplify.yml`)
4. **设置环境变量**
5. **部署应用**

详细部署指南请查看 [AWS_AMPLIFY_部署指南.md](./AWS_AMPLIFY_部署指南.md)

## 📚 文档

- [项目结构说明](./项目结构说明.md) - 详细的目录结构说明
- [API接口文档](./API接口文档.md) - API接口详细说明
- [AWS部署指南](./AWS_AMPLIFY_部署指南.md) - AWS Amplify部署配置
- [迁移报告](./CLOUDFLARE_TO_AMPLIFY_迁移完成报告.md) - Cloudflare到AWS迁移记录
- [更新日志](./更新日志.md) - 版本更新记录

## 🔧 技术栈

### 前端
- **Next.js 14** - React全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI组件库
- **React Hook Form** - 表单管理

### 后端
- **Next.js API Routes** - 服务端API
- **Supabase** - 数据库和认证
- **Nodemailer** - 邮件服务

### 开发工具
- **Playwright** - 端到端测试
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

### 部署
- **AWS Amplify** - 托管平台
- **Supabase** - 数据库托管

## 👥 主要功能模块

### 候选人端
- 职位浏览和搜索
- 在线申请和简历上传
- 申请状态跟踪
- 个人资料管理

### HR管理端
- 职位发布和管理
- 候选人筛选和管理
- 面试安排和反馈
- 数据报表和分析

### 管理员端
- 用户权限管理
- 系统配置管理
- 数据统计监控

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或需要帮助，请：

1. 查看项目文档
2. 提交 Issue
3. 联系项目维护者

---

**注意**: 主要开发工作请在 `yarbo-app/` 目录中进行，不要在项目根目录运行 npm 命令。 # 触发AWS Amplify重新部署 - Tue Jun 17 17:23:36 WITA 2025
