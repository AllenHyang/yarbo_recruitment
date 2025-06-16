# Cloudflare Pages 部署指南

> **更新时间**: 2025-06-15 20:26 - 修复构建问题

## 🚀 部署步骤

### 1. 删除当前 Workers 配置

- 在 Cloudflare Dashboard 中删除当前的 Workers 项目
- 或者保留但停止使用

### 2. 创建 Cloudflare Pages 项目

#### 访问 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择您的账户
3. 点击左侧菜单的 "Pages"
4. 点击 "Create a project"

#### Git 集成设置

1. 选择 "Connect to Git"
2. 授权 GitHub 访问（如果还没有）
3. 选择仓库：`AllenHyang/yarbo_recruitment`
4. 点击 "Begin setup"

### 3. 项目配置

#### 基本设置

```
项目名称：yarbo-recruitment
生产分支：main
```

#### 构建设置

```
框架预设：Next.js
构建命令：cd yarbo-app && npm install && npm run build
构建输出目录：yarbo-app/.next
根目录：/ (保持默认)
Node.js 版本：18.x
```

### 4. 环境变量配置

在 "Environment variables" 部分添加：

#### 生产环境变量

```
NEXT_PUBLIC_SUPABASE_URL=https://eipqxgdqittupttmpiud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcHF4Z2RxaXR0dXB0dG1waXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTE3MzQsImV4cCI6MjA2NDk2NzczNH0.IBbdwA_4XgXA0JZjrQxvdkgLV3jHeDj6l8mmHEQr5bI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpcHF4Z2RxaXR0dXB0dG1waXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM5MTczNCwiZXhwIjoyMDY0OTY3NzM0fQ.7VyZoHmdBkoL7-f_9ADSqSGHBS5IpxfFXuTG-X2sDTI
NEXT_PUBLIC_APP_URL=https://yarbo-recruitment.pages.dev
```

### 5. 部署

1. 点击 "Save and Deploy"
2. 等待构建完成（通常需要 3-5 分钟）
3. 构建成功后，您将获得一个 `.pages.dev` 域名

### 6. 自定义域名（可选）

如果您有自己的域名：

1. 在 Pages 项目中点击 "Custom domains"
2. 添加您的域名
3. 按照指示配置 DNS 记录

## 🔧 故障排除

### 常见问题

#### 构建失败

- 检查 Node.js 版本是否为 18.x
- 确保构建命令正确
- 检查环境变量是否正确设置

#### 运行时错误

- 检查 Supabase 配置是否正确
- 确保所有环境变量都已设置
- 查看 Pages 的 Functions 日志

#### 性能问题

- 启用 Cloudflare 的缓存和优化功能
- 使用 Cloudflare Images 进行图片优化
- 配置适当的缓存策略

## 📊 监控和分析

### 启用分析

1. 在 Pages 项目中启用 "Web Analytics"
2. 配置 Real User Monitoring (RUM)
3. 设置自定义事件跟踪

### 性能监控

- 使用 Cloudflare 的 Speed 工具
- 监控 Core Web Vitals
- 设置性能预算和警报

## 🔒 安全配置

### 安全头设置

在 Pages 项目中配置安全头：

- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### 访问控制

- 配置 Cloudflare Access（如果需要）
- 设置 IP 白名单（如果需要）
- 启用 Bot Fight Mode

## 📈 优化建议

### 性能优化

1. 启用 Cloudflare 的 Auto Minify
2. 使用 Cloudflare Images 进行图片优化
3. 配置适当的缓存规则
4. 启用 Brotli 压缩

### SEO 优化

1. 配置正确的 meta 标签
2. 设置 robots.txt
3. 生成 sitemap.xml
4. 配置 Open Graph 标签

## 🚀 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 所有页面都能正确加载
- [ ] 用户认证功能正常
- [ ] Supabase 连接正常
- [ ] 环境变量配置正确
- [ ] 自定义域名配置（如果有）
- [ ] SSL 证书正常
- [ ] 性能指标良好
- [ ] 错误监控设置
- [ ] 备份策略配置
