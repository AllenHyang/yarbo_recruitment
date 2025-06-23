# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 常用命令

### 开发服务器
```bash
cd yarbo-app
npm run dev         # 启动开发服务器 (使用 Turbopack，端口 3002)
npm run build       # 构建生产版本
npm run build:amplify  # AWS Amplify 专用构建命令
npm run start       # 启动生产服务器
```

### 代码质量
```bash
cd yarbo-app
npm run lint        # ESLint 代码检查
```

### 测试
```bash
cd yarbo-app
npm run test:e2e           # 运行 Playwright 端到端测试
npm run test:e2e:ui        # 运行测试并显示 UI
npm run test:e2e:headed    # 运行有头模式测试
npm run test:e2e:debug     # 调试模式运行测试
npm run test:report        # 显示测试报告
```

## 🏗️ 项目架构

### 项目结构
这是一个基于 Next.js 14 的多角色招聘管理系统，位于 `yarbo-app/` 目录中。**重要**：所有开发工作都在 `yarbo-app/` 目录进行，不要在项目根目录运行 npm 命令。

### 技术栈
- **前端**: Next.js 14.2.22 + TypeScript + Tailwind CSS + shadcn/ui
- **数据库**: Supabase (PostgreSQL) 
- **认证**: Supabase Auth
- **实时数据**: Supabase Realtime
- **图表**: Chart.js + Recharts
- **部署**: AWS Amplify (配置在根目录 `amplify.yml`)
- **测试**: Playwright

### 核心组件架构

#### 权限管理系统
- `src/lib/permissions.ts` - 基于角色的访问控制 (RBAC)
- `src/components/withProtected.tsx` - 页面权限保护组件
- `src/components/RoleBasedNavigation.tsx` - 角色导航系统
- **三种角色**: 候选人 (Candidate) / HR 专员 (HR) / 系统管理员 (Admin)

#### 数据层
- `src/lib/supabase.ts` - Supabase 客户端配置
- `src/lib/database.types.ts` - 数据库类型定义
- `src/hooks/useRealtimeData.ts` - 实时数据订阅
- `src/lib/realtime.ts` - 实时数据管理

#### 通知系统
- 双通道设计：邮件通知 + 站内消息
- `src/lib/email.ts` 和 `src/lib/email-client.ts` - 邮件服务
- `src/components/MessageCenter.tsx` - 消息中心
- `src/lib/notification.ts` - 通知管理

### 页面结构
- `/` - 公开首页
- `/jobs/` - 职位列表和详情
- `/auth/` - 认证相关页面
- `/hr/` - HR 管理功能 (需要 HR 权限)
- `/admin/` - 管理员功能 (需要 Admin 权限)

### API 路由
- `/api/auth/` - 认证相关 API
- `/api/jobs/` - 职位管理 API
- `/api/applications/` - 申请管理 API

## 🧪 测试账户

开发和测试时可使用以下演示账户：

```
候选人: test.candidate@gmail.com / password123
HR专员: hr@yarbo.com / password123
管理员: admin@yarbo.com / password123
```

## 🔧 开发注意事项

### 环境配置
- 需要配置 `.env.local` 文件 (参考项目 README.md)
- Supabase 配置必须正确设置才能使用完整功能
- 开发服务器运行在端口 3002（非默认 3000）

### 权限开发模式
- 使用 `withRoleBasedAccess()` 包装需要权限保护的组件
- 通过 `hasFeatureAccess()` 检查功能权限
- 使用 `getDefaultHomePage()` 获取角色默认页面

### 样式系统
- 使用 Tailwind CSS + shadcn/ui 组件
- 部门颜色主题在 `src/lib/supabase.ts` 中定义
- 响应式设计优先

### 实时数据
- 使用 `useRealtimeData` Hook 订阅数据变更
- Supabase 实时订阅在组件卸载时自动清理

### 测试配置
- 使用 Playwright 进行端到端测试
- 测试文件位于 `yarbo-app/tests/` 目录
- 支持 Chrome、Firefox、Safari 及移动端测试
- 测试运行时自动启动开发服务器

## 📋 部署配置

### AWS Amplify
- 构建配置: 根目录的 `amplify.yml`
- 应用根目录: `yarbo-app`
- 输出目录: `.amplify-hosting`
- 使用 AWS Amplify 适配器支持 SSR
- 缓存: `.next/cache` 和 `node_modules`

### 构建注意事项
- 使用 `npm install --force` 解决依赖冲突
- 构建命令: `npm run build:amplify`
- 当前配置忽略构建时的 ESLint 和 TypeScript 错误
- **重要**: 项目配置为 SSR 模式 (`output: 'standalone'`)，支持动态路由和 API 路由
- 构建环境使用 Node.js 20

## 🧪 功能测试

参考 `yarbo-app/测试指南.md` 了解完整的功能测试流程，包括：
- 基础页面访问
- 用户认证系统
- 职位申请流程
- HR 管理功能
- 权限保护验证

## 📂 重要文件和目录

### 配置文件
- `yarbo-app/next.config.mjs` - Next.js 配置
- `yarbo-app/playwright.config.ts` - Playwright 测试配置
- `amplify.yml` - AWS Amplify 部署配置

### 文档资源
- `yarbo-app/测试指南.md` - 功能测试指南
- `yarbo-app/docs/` - API 和功能文档
- `yarbo-app/开发总结.md` - 开发经验总结

### 测试脚本
- `yarbo-app/test-*.js` - 各种功能测试脚本
- `yarbo-app/tests/` - Playwright E2E 测试

## 🔄 开发工作流

1. 切换到应用目录：`cd yarbo-app`
2. 安装依赖：`npm install`
3. 配置环境变量：创建 `.env.local` 文件
4. 启动开发服务器：`npm run dev`
5. 运行测试：`npm run test:e2e`
6. 代码检查：`npm run lint`
7. 构建生产版本：`npm run build`