# Yarbo 招聘系统 - API 接口文档

## 📋 文档概览

本文档详细记录了 yarbo-recruitment 项目中所有 API 接口的功能、参数和使用方法。

**文档版本**: v1.0  
**更新时间**: 2025 年 6 月 14 日  
**API 基础路径**: `/api`  
**API 总数**: 25 个接口

---

## 🔐 认证说明

### 认证方式

- **Supabase Auth**: 使用 Supabase 提供的 JWT 认证
- **Session 管理**: 基于 HTTP-only cookies
- **权限控制**: 基于用户角色（admin、hr、candidate）

### 请求头设置

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

---

## 📊 API 统计总览

| 模块       | 接口数量  | 状态        |
| ---------- | --------- | ----------- |
| 申请管理   | 1 个      | ✅ 已完成   |
| 职位管理   | 2 个      | ✅ 已完成   |
| HR 管理    | 10 个     | 🔄 部分完成 |
| 候选人管理 | 1 个      | 🔄 部分完成 |
| 邮件系统   | 3 个      | ✅ 已完成   |
| 通知系统   | 4 个      | 🔄 部分完成 |
| 评估系统   | 1 个      | 📋 计划中   |
| 消息系统   | 3 个      | � 部分完成  |
| **总计**   | **25 个** | -           |

---

## 🗂️ API 接口分类

## 1. 申请管理 (Applications)

### 1.1 提交申请

**接口路径**: `POST /api/applications/submit`  
**功能描述**: 候选人提交职位申请，自动创建用户账户  
**权限要求**: 无需认证（公开接口）

**请求参数**:

```json
{
  "jobId": "string", // 必填 - 职位ID
  "applicantInfo": {
    "name": "string", // 必填 - 申请人姓名
    "email": "string", // 必填 - 邮箱地址
    "phone": "string" // 必填 - 手机号码
  },
  "coverLetter": "string", // 可选 - 求职信内容
  "useExistingResume": true, // 可选 - 使用用户已上传的简历
  "resumeFile": {
    // 可选 - 上传新简历（向后兼容）
    "name": "string", // 文件名
    "size": "number", // 文件大小(字节)
    "type": "string", // 文件类型
    "data": "string" // Base64编码的文件数据
  }
}
```

**响应格式**:

```json
{
  "success": true,
  "message": "申请提交成功",
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "role": "candidate",
      "status": "active"
    },
    "applicant": {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string"
    },
    "resume": {
      "id": "string",
      "filename": "string",
      "file_path": "string"
    },
    "application": {
      "id": "string",
      "job_id": "string",
      "cover_letter": "string",
      "status": "submitted"
    }
  }
}
```

**使用示例**:

```bash
curl -X POST http://localhost:3002/api/applications/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "b331caed-3f65-4d4f-8b92-f94e64ba357c",
    "applicantInfo": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000"
    },
    "coverLetter": "我对这个职位非常感兴趣，希望能够加入贵公司...",
    "useExistingResume": true
  }'
```

---

## 2. 职位管理 (Jobs)

### 2.1 获取职位列表

**接口路径**: `GET /api/jobs`  
**功能描述**: 获取所有活跃状态的职位列表  
**权限要求**: 无需认证（公开接口）

**查询参数**:

- 无

**响应格式**:

```json
{
  "success": true,
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "department": "string",
      "status": "active",
      "location": "string",
      "employment_type": "string",
      "created_at": "string"
    }
  ],
  "count": "number"
}
```

**使用示例**:

```bash
curl -X GET http://localhost:3002/api/jobs
```

### 2.2 创建职位

**接口路径**: `POST /api/jobs`  
**功能描述**: 创建新的职位  
**权限要求**: HR 或管理员

**请求参数**:

```json
{
  "title": "string", // 必填 - 职位标题
  "department": "string", // 必填 - 部门
  "description": "string", // 必填 - 职位描述
  "requirements": "string", // 可选 - 任职要求
  "location": "string", // 可选 - 工作地点
  "employment_type": "string" // 可选 - 工作类型
}
```

**响应格式**:

```json
{
  "success": true,
  "message": "职位创建成功",
  "job": {
    "id": "string",
    "title": "string",
    "department": "string",
    "status": "active"
  }
}
```

---

## 3. HR 管理 (HR Management)

### 3.1 获取候选人列表

**接口路径**: `GET /api/hr/candidates`  
**功能描述**: 获取候选人列表，支持搜索和筛选  
**权限要求**: HR 或管理员

**查询参数**:

- `search` (string): 搜索关键词（姓名、邮箱、技能）
- `status` (string): 状态筛选（active、passive、hired、rejected）
- `experience` (string): 经验筛选（1、3、5）
- `rating` (string): 评分筛选（1-5）
- `skills` (string): 技能筛选（逗号分隔）
- `location` (string): 地点筛选
- `source` (string): 来源筛选
- `page` (number): 页码（默认 1）
- `limit` (number): 每页数量（默认 20）

**响应格式**:

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "experience": "string",
      "skills": ["string"],
      "rating": "number",
      "status": "string",
      "applied_jobs": [
        {
          "job_id": "string",
          "job_title": "string",
          "applied_date": "string",
          "status": "string"
        }
      ]
    }
  ],
  "pagination": {
    "page": "number",
    "limit": "number",
    "total": "number",
    "totalPages": "number"
  }
}
```

### 3.2 创建候选人

**接口路径**: `POST /api/hr/candidates`  
**功能描述**: 手动创建候选人记录  
**权限要求**: HR 或管理员

**请求参数**:

```json
{
  "name": "string", // 必填 - 姓名
  "email": "string", // 必填 - 邮箱
  "phone": "string", // 必填 - 电话
  "location": "string", // 可选 - 地点
  "experience": "string", // 可选 - 工作经验
  "education": "string", // 可选 - 教育背景
  "skills": ["string"], // 可选 - 技能列表
  "rating": "number", // 可选 - 评分(1-5)
  "status": "string", // 可选 - 状态
  "source": "string" // 可选 - 来源
}
```

### 3.3 批量操作候选人

**接口路径**: `PUT /api/hr/candidates`  
**功能描述**: 批量更新候选人状态或信息  
**权限要求**: HR 或管理员

**请求参数**:

```json
{
  "action": "string", // 必填 - 操作类型
  "candidate_ids": ["string"], // 必填 - 候选人ID列表
  "data": {
    // 必填 - 更新数据
    "status": "string", // 状态更新
    "rating": "number", // 评分更新
    "note": "string" // 添加备注
  }
}
```

### 3.4 批量导出候选人

**接口路径**: `POST /api/hr/candidates/batch`  
**功能描述**: 批量导出候选人数据  
**权限要求**: HR 或管理员  
**开发状态**: 🔄 开发中

### 3.5 更新申请状态

**接口路径**: `PUT /api/hr/applications/[id]/status`  
**功能描述**: 更新申请状态  
**权限要求**: HR 或管理员  
**开发状态**: 🔄 开发中

### 3.6 智能面试调度

**接口路径**: `POST /api/hr/interviews/smart-schedule`  
**功能描述**: 智能安排面试时间  
**权限要求**: HR 或管理员  
**开发状态**: 🔄 开发中

---

## 4. 候选人系统 (Candidates)

### 4.1 获取面试时间段

**接口路径**: `GET /api/candidates/interview-slots/[token]`  
**功能描述**: 候选人通过 token 获取可选面试时间  
**权限要求**: 有效的面试 token

**路径参数**:

- `token` (string): 面试邀请 token

**响应格式**:

```json
{
  "success": true,
  "data": {
    "candidate_name": "string",
    "job_title": "string",
    "available_slots": [
      {
        "date": "string",
        "time": "string",
        "duration": "number"
      }
    ]
  }
}
```

---

## 5. 邮件系统 (Email)

### 5.1 发送邮件

**接口路径**: `POST /api/email`  
**功能描述**: 发送各类通知邮件  
**权限要求**: HR 或管理员

**请求参数**:

```json
{
  "type": "string", // 必填 - 邮件类型
  "to": "string", // 必填 - 收件人邮箱
  "data": {
    // 必填 - 邮件模板数据
    "candidateName": "string",
    "jobTitle": "string",
    "companyName": "string",
    "applicationId": "string"
  }
}
```

**邮件类型**:

- `APPLICATION_RECEIVED`: 申请确认邮件
- `APPLICATION_UNDER_REVIEW`: 申请审核中
- `INTERVIEW_SCHEDULED`: 面试安排通知
- `APPLICATION_ACCEPTED`: 申请通过
- `APPLICATION_REJECTED`: 申请拒绝
- `HR_NEW_APPLICATION`: HR 新申请通知

### 5.2 验证邮件服务

**接口路径**: `GET /api/email`  
**功能描述**: 验证邮件服务连接状态  
**权限要求**: HR 或管理员

**响应格式**:

```json
{
  "success": true,
  "connected": true,
  "message": "邮件服务连接正常"
}
```

---

## 6. 通知系统 (Notifications)

### 6.1 获取通知列表

**接口路径**: `GET /api/notifications`  
**功能描述**: 获取用户通知列表  
**权限要求**: 已认证用户  
**开发状态**: 📋 计划中

### 6.2 标记通知已读

**接口路径**: `PUT /api/notifications/[id]`  
**功能描述**: 标记单个通知为已读  
**权限要求**: 已认证用户  
**开发状态**: 📋 计划中

### 6.3 发送邮件通知

**接口路径**: `POST /api/notifications/email`  
**功能描述**: 发送邮件通知  
**权限要求**: HR 或管理员  
**开发状态**: 📋 计划中

---

## 7. 其他接口

### 7.1 在线评估

**接口路径**: `POST /api/assessment`  
**功能描述**: 候选人在线能力评估  
**权限要求**: 已认证候选人  
**开发状态**: 📋 计划中

### 7.2 消息系统

**接口路径**: `GET /api/messages`  
**功能描述**: 获取用户消息列表  
**权限要求**: 已认证用户  
**开发状态**: 📋 计划中

---

## ⚠️ 错误码说明

| 状态码 | 错误类型   | 说明                   |
| ------ | ---------- | ---------------------- |
| 200    | 成功       | 请求成功处理           |
| 400    | 请求错误   | 参数错误或缺少必要字段 |
| 401    | 未认证     | 需要登录或 token 无效  |
| 403    | 权限不足   | 用户角色权限不够       |
| 404    | 资源不存在 | 请求的资源不存在       |
| 500    | 服务器错误 | 内部服务器错误         |

**错误响应格式**:

```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

---

## 🔧 开发说明

### 技术栈

- **框架**: Next.js 14 App Router
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **文件存储**: Supabase Storage
- **邮件服务**: 自定义邮件服务

### 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
***REMOVED***=your_anon_key
***REMOVED***=your_service_key
```

### 数据库表结构

- `users`: 用户表
- `applicants`: 申请人表
- `jobs`: 职位表
- `applications`: 申请记录表
- `resumes`: 简历文件表
- `interviews`: 面试记录表
- `notifications`: 通知表

---

## 📝 常见问题

### Q: 如何处理文件上传？

A: 文件需要转换为 Base64 格式在请求体中发送，服务端会自动处理上传到 Supabase Storage。

### Q: API 有速率限制吗？

A: 目前没有实现速率限制，建议在生产环境中添加。

### Q: 如何获取用户权限？

A: 通过 Supabase Auth JWT token 中的用户信息和数据库中的角色字段确定权限。

---

## 📋 API 接口清单

### 已实现接口 (✅ 完成)

| 序号 | 接口路径                   | 方法 | 功能描述       | 权限要求  |
| ---- | -------------------------- | ---- | -------------- | --------- |
| 1    | `/api/applications/submit` | POST | 提交职位申请   | 无需认证  |
| 2    | `/api/jobs`                | GET  | 获取职位列表   | 无需认证  |
| 3    | `/api/jobs`                | POST | 创建职位       | HR/管理员 |
| 4    | `/api/hr/candidates`       | GET  | 获取候选人列表 | HR/管理员 |
| 5    | `/api/hr/candidates`       | POST | 创建候选人     | HR/管理员 |
| 6    | `/api/hr/candidates`       | PUT  | 批量操作候选人 | HR/管理员 |
| 7    | `/api/email`               | POST | 发送邮件       | HR/管理员 |
| 8    | `/api/email`               | GET  | 验证邮件服务   | HR/管理员 |

### 开发中接口 (🔄 部分完成)

| 序号 | 接口路径                                  | 方法 | 功能描述       | 开发状态             |
| ---- | ----------------------------------------- | ---- | -------------- | -------------------- |
| 9    | `/api/hr/candidates/batch`                | POST | 批量导出候选人 | 接口存在，功能待完善 |
| 10   | `/api/hr/applications/[id]/status`        | PUT  | 更新申请状态   | 接口存在，功能待完善 |
| 11   | `/api/hr/interviews/smart-schedule`       | POST | 智能面试调度   | 接口存在，功能待完善 |
| 12   | `/api/hr/interviews/feedback`             | POST | 面试反馈       | 接口存在，功能待完善 |
| 13   | `/api/hr/analytics`                       | GET  | HR 数据分析    | 接口存在，功能待完善 |
| 14   | `/api/candidates/interview-slots/[token]` | GET  | 获取面试时间段 | 接口存在，功能待完善 |

### 计划中接口 (📋 待开发)

| 序号 | 接口路径                  | 方法 | 功能描述     | 计划状态             |
| ---- | ------------------------- | ---- | ------------ | -------------------- |
| 15   | `/api/notifications`      | GET  | 获取通知列表 | 接口存在，功能待实现 |
| 16   | `/api/notifications/[id]` | PUT  | 标记通知已读 | 接口存在，功能待实现 |
| 17   | `/api/messages`           | GET  | 获取消息列表 | 接口存在，功能待实现 |
| 18   | `/api/assessment`         | POST | 在线评估     | 接口存在，功能待实现 |

---

## 🚀 快速开始

### 1. 环境配置

```bash
# 克隆项目
git clone <repository-url>
cd yarbo-recruitment

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入 Supabase 配置
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试 API 接口

```bash
# 测试职位列表接口
curl http://localhost:3002/api/jobs

# 测试申请提交接口
curl -X POST http://localhost:3002/api/applications/submit \
  -H "Content-Type: application/json" \
  -d @test-application.json
```

---

## 🔍 接口测试示例

### 测试数据文件

**test-application.json**:

```json
{
  "jobId": "b331caed-3f65-4d4f-8b92-f94e64ba357c",
  "applicantInfo": {
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "13800138000"
  },
  "resumeFile": {
    "name": "test-resume.pdf",
    "size": 1024,
    "type": "application/pdf",
    "data": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO4DQo="
  }
}
```

### Postman 集合

项目包含完整的 Postman 集合文件，包含所有 API 接口的测试用例。

---

## 📈 性能优化建议

### 1. 缓存策略

- 职位列表数据缓存 5 分钟
- 候选人列表数据缓存 2 分钟
- 静态数据（部门、地点）缓存 1 小时

### 2. 分页优化

- 默认分页大小：20 条记录
- 最大分页大小：100 条记录
- 使用游标分页优化大数据集查询

### 3. 文件上传优化

- 支持分片上传大文件
- 文件类型和大小验证
- 自动压缩和格式转换

---

## 🔒 安全考虑

### 1. 输入验证

- 所有用户输入进行严格验证
- SQL 注入防护
- XSS 攻击防护

### 2. 权限控制

- 基于角色的访问控制(RBAC)
- API 接口权限验证
- 敏感数据访问日志

### 3. 数据保护

- 个人信息加密存储
- 简历文件访问控制
- 数据传输 HTTPS 加密

---

## 📊 监控和日志

### 1. API 监控

- 响应时间监控
- 错误率统计
- 请求量统计

### 2. 日志记录

- 请求日志
- 错误日志
- 安全事件日志

### 3. 告警机制

- API 异常告警
- 性能阈值告警
- 安全事件告警

---

## 🔄 版本更新记录

### v1.0 (2025-06-14)

- ✅ 完成申请提交 API
- ✅ 完成职位管理 API
- ✅ 完成候选人管理 API
- ✅ 完成邮件系统 API
- 🔄 部分 HR 管理功能
- 📋 规划通知和消息系统

### 计划中的更新

- v1.1: 完善 HR 管理功能
- v1.2: 实现通知系统
- v1.3: 添加在线评估功能
- v1.4: 性能优化和缓存

---

## 🤝 贡献指南

### 1. 开发规范

- 遵循 RESTful API 设计原则
- 统一的错误处理和响应格式
- 完整的参数验证和类型检查

### 2. 代码提交

- 提交前运行测试用例
- 更新相关文档
- 遵循 Git 提交规范

### 3. API 设计原则

- 保持接口简洁明了
- 向后兼容性考虑
- 完整的错误信息返回

---

_文档更新时间: 2025 年 6 月 14 日_
_API 版本: v1.0_
_维护团队: Yarbo 技术团队_
