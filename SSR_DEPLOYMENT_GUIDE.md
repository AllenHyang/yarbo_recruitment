# AWS Amplify SSR 部署指南

## 概述
本指南说明如何将 Yarbo 招聘系统从静态导出模式迁移到 AWS Amplify SSR 部署。

## 迁移前后对比

### 之前（静态导出）
- ❌ 不支持 API Routes
- ❌ 不支持服务端渲染
- ❌ 验证码等功能失效
- ✅ 部署成本低

### 之后（SSR 模式）
- ✅ 完整支持 Next.js 所有功能
- ✅ API Routes 正常工作
- ✅ 支持服务端验证和安全功能
- ✅ 更好的 SEO 和性能

## 部署步骤

### 1. 本地验证
```bash
cd yarbo-app
npm install
npm run build
npm run start
```

### 2. 提交代码
```bash
git add .
git commit -m "feat: 迁移到 SSR 部署模式"
git push origin main
```

### 3. AWS Amplify 控制台配置

1. **登录 AWS Amplify 控制台**
   - 访问：https://console.aws.amazon.com/amplify/
   - 选择你的应用

2. **更新构建设置**
   - 进入 "Build settings"
   - 确认 "Build type" 为 "SSR (Server-Side Rendering)"
   - 如果不是，点击 "Edit" 并更改

3. **配置环境变量**
   在 "Environment variables" 中添加以下变量：
   
   ```
   # 必需的环境变量
   NEXT_PUBLIC_SUPABASE_URL=<你的 Supabase URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的 Supabase Anon Key>
   SUPABASE_SERVICE_ROLE_KEY=<你的 Service Role Key>
   
   # 可选的环境变量
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=<你的邮箱>
   SMTP_PASS=<应用专用密码>
   EMAIL_FROM=noreply@yarbo.com
   ```

4. **重新部署**
   - 点击 "Redeploy this version" 或推送新的提交

### 4. 验证部署

部署完成后，验证以下功能：

- [ ] 网站能正常访问
- [ ] API Routes 正常工作（测试验证码功能）
- [ ] 邮件发送功能正常
- [ ] 文件上传功能正常
- [ ] 实时通知功能正常

## 性能优化

### ISR 缓存配置
已为以下页面配置了 ISR 缓存：
- 首页：10 分钟
- 职位列表：5 分钟  
- 职位详情：30 分钟

### 成本控制
1. **使用缓存**：减少服务器计算
2. **优化图片**：使用 Next.js Image 组件
3. **监控使用量**：定期检查 AWS CloudWatch

## 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确设置
   - 查看构建日志找出具体错误

2. **API 路由 404**
   - 确认已移除 `output: 'export'` 配置
   - 检查 Amplify 是否识别为 SSR 应用

3. **环境变量未生效**
   - 重新部署应用
   - 确认变量名称正确（注意 NEXT_PUBLIC_ 前缀）

### 回滚方案

如需回滚到静态导出：

1. 恢复 `next.config.ts` 中的 `output: 'export'`
2. 恢复 `amplify.yml` 中的 `baseDirectory: out`
3. 重新部署

## 监控和维护

### 日志查看
- AWS CloudWatch：查看服务器日志
- Amplify Console：查看构建和部署日志

### 性能监控
- 使用 Vercel Analytics 或类似工具
- 监控 Core Web Vitals

### 定期维护
- 每月检查 AWS 账单
- 定期更新依赖包
- 监控错误日志

## 联系支持

如遇到问题，请联系：
- 技术负责人：[联系方式]
- AWS 支持：[支持渠道]