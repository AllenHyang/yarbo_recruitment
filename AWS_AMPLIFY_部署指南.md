# AWS Amplify 部署指南

本指南将帮助您将 Yarbo 招聘系统部署到 AWS Amplify。

## 📋 前置准备

1. AWS 账户
2. GitHub/GitLab/Bitbucket 仓库
3. Supabase 项目配置

## 🚀 部署步骤

### 第一步：登录 AWS Amplify 控制台

1. 访问 [AWS Amplify 控制台](https://console.aws.amazon.com/amplify/)
2. 使用您的 AWS 账户登录

### 第二步：创建新应用

1. 点击 "Create new app"
2. 选择 "Host web app"
3. 选择您的代码仓库提供商（GitHub、GitLab、Bitbucket 等）

### 第三步：连接仓库

1. 授权 AWS Amplify 访问您的仓库
2. 选择包含 Yarbo 招聘系统的仓库
3. 选择要部署的分支（通常是 `main` 或 `master`）

### 第四步：配置构建设置

1. **App name**: 输入应用名称，例如 "yarbo-recruitment"
2. **Monorepo**: 选择 "Yes, this is a monorepo"
3. **Root directory**: 输入 `yarbo-app`
4. **Build command**: 使用默认的 `npm run build`
5. **Base directory**: 保持为 `yarbo-app`
6. **Artifact folder**: `.next`

构建配置会自动从根目录的 `amplify.yml` 文件读取。

### 第五步：环境变量配置

在 "Environment variables" 部分添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 您的 Supabase URL | 从 Supabase 项目设置获取 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的 Supabase 匿名密钥 | 从 Supabase 项目设置获取 |
| `SUPABASE_SERVICE_ROLE_KEY` | 您的 Supabase 服务角色密钥 | 从 Supabase 项目设置获取 |
| `NEXT_PUBLIC_APP_URL` | 您的 Amplify 应用 URL | 部署后会自动生成 |

### 第六步：审查并部署

1. 检查所有配置
2. 点击 "Save and deploy"
3. 等待构建和部署完成

## 🔧 构建配置详解

项目使用根目录的 `amplify.yml` 文件进行构建配置：

```yaml
version: 1
applications:
  - appRoot: yarbo-app
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

## 🌐 域名配置

### 使用 Amplify 提供的域名

部署完成后，Amplify 会自动分配一个域名，格式如下：
`https://branch-name.d111111abcdefg.amplifyapp.com`

### 配置自定义域名

1. 在 Amplify 控制台的左侧菜单中选择 "Domain management"
2. 点击 "Add domain"
3. 输入您的域名
4. 按照指引配置 DNS 记录
5. 等待 SSL 证书生成和域名验证完成

## 🔄 持续部署

Amplify 支持自动持续部署：

1. **自动部署**: 当代码推送到连接的分支时自动触发部署
2. **构建触发器**: 可以配置 webhook 来触发构建
3. **多分支部署**: 可以为不同分支设置不同的部署环境

## 📊 监控和日志

### 构建日志

在 Amplify 控制台中可以查看：
- 构建历史
- 详细的构建日志
- 错误信息和调试信息

### 性能监控

Amplify 提供内置的性能监控功能：
- 页面加载时间
- 错误率
- 用户会话信息

## 🚨 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确认所有依赖都在 package.json 中
   - 查看详细的构建日志

2. **环境变量问题**
   - 确认所有必需的环境变量都已设置
   - 检查变量名拼写是否正确
   - 验证 Supabase 配置

3. **API 路由问题**
   - 确认 Next.js API Routes 配置正确
   - 检查 Supabase 连接
   - 验证数据库权限

### 调试技巧

1. 使用 Amplify 控制台的构建日志
2. 检查浏览器开发者工具的网络标签
3. 查看 Supabase 日志

## 🔐 安全最佳实践

1. **环境变量管理**
   - 不要在代码中硬编码敏感信息
   - 使用 Amplify 的环境变量功能
   - 定期轮换密钥

2. **访问控制**
   - 设置适当的 Supabase RLS 策略
   - 使用最小权限原则
   - 定期审查访问权限

## 📚 更多资源

- [AWS Amplify 官方文档](https://docs.amplify.aws/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

## 🆘 获取帮助

如果遇到问题，可以：
1. 查看 AWS Amplify 支持文档
2. 在项目仓库中创建 Issue
3. 联系技术支持团队 