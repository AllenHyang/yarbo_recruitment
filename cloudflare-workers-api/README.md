# Yarbo Recruitment API - Cloudflare Workers

🚀 **完全原生的 Cloudflare Workers API 实现**

## 🎯 项目特点

- ✅ **零兼容性问题**：完全避免 Next.js 的 async_hooks 问题
- ✅ **极致性能**：运行在 Cloudflare 边缘网络
- ✅ **全球分布**：毫秒级响应时间
- ✅ **完整功能**：用户认证、文件上传、通知系统
- ✅ **生产就绪**：自动扩展、高可用性

## 📁 项目结构

```
cloudflare-workers-api/
├── 📄 wrangler.toml          # Cloudflare Workers 配置
├── 📄 package.json           # 项目依赖
├── 📄 .dev.vars             # 环境变量（本地开发）
├── 📄 test-api.sh           # API 测试脚本
└── src/
    ├── 📄 index.js          # 主入口文件
    └── routes/
        ├── 📄 test.js       # 测试 API
        ├── 📄 jobs.js       # 职位 API
        ├── 📄 applications.js # 申请 API
        ├── 📄 auth.js       # 认证 API
        ├── 📄 upload.js     # 文件上传 API
        └── 📄 notifications.js # 通知 API
```

## 🔧 API 端点

### 基础信息
- `GET /` - API 信息和端点列表
- `GET /api/test` - 测试端点

### 职位管理
- `GET /api/jobs` - 获取职位列表
  - 查询参数：`fields`, `limit`, `offset`

### 申请管理
- `POST /api/applications/submit` - 提交申请
  - 参数：`jobId`, `candidateId`, `coverLetter`, `resumeUrl`

### 用户认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/user` - 获取用户信息（需要认证）
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 用户登出

### 文件上传
- `POST /api/upload/resume` - 上传简历（需要认证）
- `POST /api/upload/avatar` - 上传头像（需要认证）
- `POST /api/upload/signed-url` - 获取签名 URL（需要认证）
- `DELETE /api/upload/delete/{fileName}` - 删除文件（需要认证）

### 通知系统
- `GET /api/notifications` - 获取通知列表（需要认证）
- `POST /api/notifications` - 创建通知（需要认证）
- `PATCH /api/notifications/{id}/read` - 标记通知已读（需要认证）
- `DELETE /api/notifications/{id}` - 删除通知（需要认证）
- `PATCH /api/notifications/mark-all-read` - 批量标记已读（需要认证）
- `GET /api/notifications/unread-count` - 获取未读数量（需要认证）

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.dev.vars.example` 到 `.dev.vars` 并填入配置：
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 启动开发服务器
```bash
npm run dev
```

服务器将运行在 `http://localhost:8787`

### 4. 测试 API
```bash
./test-api.sh
```

## 🧪 API 测试示例

### 测试基础功能
```bash
# 获取 API 信息
curl http://localhost:8787/

# 测试端点
curl http://localhost:8787/api/test

# 获取职位列表
curl "http://localhost:8787/api/jobs?limit=5"
```

### 测试用户认证
```bash
# 用户注册
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "用户姓名",
    "role": "candidate"
  }'

# 用户登录
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 测试申请提交
```bash
curl -X POST http://localhost:8787/api/applications/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "job-uuid",
    "candidateId": "user-uuid",
    "coverLetter": "求职信内容",
    "resumeUrl": "简历文件URL"
  }'
```

## 🌐 CORS 支持

API 支持跨域请求，配置如下：
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## 🔒 认证机制

使用 Supabase Auth 进行用户认证：
- JWT 令牌验证
- 自动令牌刷新
- 角色权限控制

需要认证的端点需要在请求头中包含：
```
Authorization: Bearer <access_token>
```

## 📦 部署

### 部署到 Cloudflare Workers
```bash
npm run deploy
```

### 设置生产环境变量
```bash
wrangler secret put NEXT_PUBLIC_SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# ... 其他环境变量
```

## 🎉 技术栈

- **运行时**：Cloudflare Workers
- **数据库**：Supabase PostgreSQL
- **认证**：Supabase Auth
- **存储**：Supabase Storage
- **开发工具**：Wrangler CLI

## 📊 性能特点

- ⚡ **冷启动时间**：< 10ms
- 🌍 **全球分布**：200+ 边缘节点
- 🔄 **自动扩展**：无需配置
- 💾 **内存使用**：极低资源消耗
- 🛡️ **安全防护**：内置 DDoS 防护

## 🎯 与 Next.js 的对比

| 特性 | Cloudflare Workers | Next.js API Routes |
|------|-------------------|-------------------|
| 兼容性问题 | ✅ 无 | ❌ async_hooks 问题 |
| 冷启动时间 | ✅ < 10ms | ❌ > 100ms |
| 全球分布 | ✅ 200+ 节点 | ❌ 单一区域 |
| 自动扩展 | ✅ 无限制 | ❌ 需要配置 |
| 开发体验 | ✅ 优秀 | ✅ 优秀 |

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Supabase 文档](https://supabase.com/docs)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

🎉 **Yarbo Recruitment API - 完全原生的 Cloudflare Workers 实现，零兼容性问题，极致性能！**
