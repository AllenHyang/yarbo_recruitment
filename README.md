# Yarbo 招聘系统

一个基于 Next.js 和 Supabase 的现代化招聘管理系统，部署在 AWS Amplify 上。

## 🚀 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **部署**: AWS Amplify
- **测试**: Playwright

## 📁 项目结构

```
yarbo_recruitment/
├── yarbo-app/                  # Next.js 应用主目录
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── api/           # API Routes
│   │   │   ├── auth/          # 认证页面
│   │   │   ├── hr/            # HR 管理界面
│   │   │   └── ...
│   │   ├── components/        # React 组件
│   │   ├── lib/              # 工具函数和配置
│   │   └── hooks/            # 自定义 React Hooks
│   ├── tests/                # E2E 测试
│   └── ...
├── 数据库/                    # 数据库迁移文件
├── 文档/                      # 项目文档
└── amplify.yml               # AWS Amplify 构建配置
```

## 🔧 开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd yarbo_recruitment/yarbo-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境变量配置

复制 `.env.example` 到 `.env.local` 并填入配置：

```bash
cp .env.example .env.local
```

### 4. 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 启动。

## 🚀 AWS Amplify 部署

### 自动部署

1. 在 AWS Amplify 控制台创建新应用
2. 连接到 Git 仓库
3. 设置构建配置（使用根目录的 `amplify.yml`）
4. 配置环境变量
5. 部署应用

### 环境变量设置

在 AWS Amplify 控制台中设置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📊 主要功能

### 求职者功能
- 浏览职位列表
- 在线申请职位
- 个人资料管理
- 申请状态跟踪

### HR 功能
- 职位发布和管理
- 候选人管理
- 申请审查
- 面试安排
- 数据分析

### 管理员功能
- 用户管理
- 系统配置
- 数据导出
- 统计报告

## 🧪 测试

### 运行 E2E 测试

```bash
npm run test:e2e
```

### 运行测试并查看报告

```bash
npm run test:e2e:ui
npm run test:report
```

## 📝 API 端点

- `GET /api/test` - 测试 API 状态
- `GET /api/jobs` - 获取职位列表
- `POST /api/applications/submit` - 提交申请
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

## 🔒 安全性

- 使用 Supabase 内置的 RLS (行级安全)
- JWT 令牌认证
- CORS 配置
- 输入验证和清理

## 📈 性能优化

- Next.js 自动代码分割
- 图片优化
- 静态站点生成 (SSG)
- 服务端渲染 (SSR)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目使用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。 