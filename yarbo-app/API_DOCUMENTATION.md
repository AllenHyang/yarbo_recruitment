# Yarbo 招聘系统 API 文档

## 📋 API 概览

**基础URL**: `http://localhost:3001/api`  
**认证方式**: Bearer Token (JWT)  
**数据格式**: JSON  
**字符编码**: UTF-8  

## 🔐 认证

### 获取访问令牌
所有需要认证的API都需要在请求头中包含访问令牌：

```http
Authorization: Bearer <access_token>
```

### 令牌获取
通过Supabase认证系统获取：
```javascript
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;
```

## 👤 用户认证 API

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "张",
  "lastName": "三",
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
```

## 💼 职位管理 API

### 获取职位列表
```http
GET /api/jobs?page=1&limit=10&department=技术部&location=深圳
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 50)
- `department`: 部门筛选
- `location`: 地点筛选
- `status`: 状态筛选 (published, draft, paused, closed)
- `search`: 关键词搜索

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "高级前端工程师",
      "department": "技术部",
      "location": "深圳市华南数字谷L栋",
      "description": "职位描述...",
      "requirements": "职位要求...",
      "salary_min": 15000,
      "salary_max": 25000,
      "salary_display": "15K-25K",
      "status": "published",
      "priority": 2,
      "expires_at": "2024-12-31",
      "created_at": "2024-06-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### 获取职位详情
```http
GET /api/jobs/{job_id}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "高级前端工程师",
    "department": "技术部",
    "location": "深圳市华南数字谷L栋",
    "description": "详细职位描述...",
    "requirements": "详细职位要求...",
    "benefits": "福利待遇...",
    "employment_type": "全职",
    "experience_required": "3-5年",
    "education_required": "本科",
    "salary_min": 15000,
    "salary_max": 25000,
    "salary_display": "15K-25K",
    "is_remote": false,
    "status": "published",
    "priority": 2,
    "expires_at": "2024-12-31",
    "created_at": "2024-06-15T10:00:00Z",
    "updated_at": "2024-06-15T10:00:00Z"
  }
}
```

### 创建职位 (需要HR/Admin权限)
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "高级前端工程师",
  "department": "技术部",
  "location": "深圳市华南数字谷L栋",
  "description": "职位描述...",
  "requirements": "职位要求...",
  "salary_min": 15000,
  "salary_max": 25000,
  "salary_display": "15K-25K",
  "status": "published",
  "priority": 2,
  "expires_at": "2024-12-31"
}
```

## 📝 申请管理 API

### 提交职位申请
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "job_id": "job_uuid",
  "resume_id": "resume_uuid",
  "cover_letter": "求职信内容..."
}
```

**响应**:
```json
{
  "success": true,
  "message": "申请提交成功",
  "data": {
    "id": "application_uuid",
    "job_id": "job_uuid",
    "status": "pending",
    "applied_at": "2024-06-15T10:00:00Z"
  }
}
```

### 获取用户申请列表
```http
GET /api/applications/user
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "pending",
      "applied_at": "2024-06-15T10:00:00Z",
      "notes": "HR备注",
      "jobs": {
        "id": "job_uuid",
        "title": "高级前端工程师",
        "department": "技术部",
        "location": "深圳市华南数字谷L栋"
      },
      "resumes": {
        "id": "resume_uuid",
        "filename": "resume.pdf",
        "uploaded_at": "2024-06-15T09:00:00Z"
      }
    }
  ]
}
```

### 更新申请状态 (需要HR/Admin权限)
```http
PUT /api/applications/{application_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "interview",
  "notes": "安排面试"
}
```

## 📄 简历管理 API

### 上传简历
```http
POST /api/resumes/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <resume_file>
```

**响应**:
```json
{
  "success": true,
  "message": "简历上传成功",
  "data": {
    "id": "resume_uuid",
    "filename": "resume.pdf",
    "file_size": 1024000,
    "uploaded_at": "2024-06-15T10:00:00Z"
  }
}
```

### 获取用户简历列表
```http
GET /api/resumes
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "resume.pdf",
      "file_size": 1024000,
      "is_primary": true,
      "uploaded_at": "2024-06-15T10:00:00Z"
    }
  ]
}
```

### 设置主简历
```http
PUT /api/resumes/{resume_id}/primary
Authorization: Bearer <token>
```

### 获取简历下载链接
```http
GET /api/resumes/{resume_id}/url
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "download_url": "https://storage.supabase.co/...",
    "expires_at": "2024-06-15T11:00:00Z"
  }
}
```

## 👥 HR管理 API

### 获取候选人列表 (需要HR/Admin权限)
```http
GET /api/hr/candidates?page=1&limit=10&search=张三
Authorization: Bearer <token>
```

### 获取申请列表 (需要HR/Admin权限)
```http
GET /api/hr/applications?page=1&limit=10&status=pending&job_id=uuid
Authorization: Bearer <token>
```

### 批量上传职位 (需要HR/Admin权限)
```http
POST /api/hr/jobs/bulk-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <excel_file>
```

### 下载职位模板 (需要HR/Admin权限)
```http
GET /api/hr/jobs/template
Authorization: Bearer <token>
```

## 🏢 系统管理 API

### 获取部门列表
```http
GET /api/departments
```

### 获取办公地点列表
```http
GET /api/office-locations
```

### 获取统计数据 (需要HR/Admin权限)
```http
GET /api/hr/stats
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "totalJobs": 25,
    "activeJobs": 20,
    "totalApplications": 150,
    "pendingApplications": 45,
    "totalCandidates": 120
  }
}
```

## 📊 错误响应格式

所有API错误都遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": {
    "field": "具体错误信息"
  }
}
```

### 常见错误码
- `400`: 请求参数错误
- `401`: 未授权访问
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `422`: 数据验证失败
- `500`: 服务器内部错误

## 🔄 状态码说明

### 申请状态 (Application Status)
- `pending`: 待审核
- `reviewing`: 审核中
- `interview`: 面试阶段
- `offer`: 已发Offer
- `hired`: 已录用
- `rejected`: 已拒绝

### 职位状态 (Job Status)
- `published`: 已发布
- `draft`: 草稿
- `paused`: 暂停
- `closed`: 已关闭

### 用户角色 (User Roles)
- `candidate`: 候选人
- `hr`: HR人员
- `admin`: 管理员

---

**API版本**: v1.0.0  
**最后更新**: 2025年6月15日
