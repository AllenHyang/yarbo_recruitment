# 📡 Yarbo招聘系统 API文档

## 📋 API概览

本文档详细说明了Yarbo招聘系统的所有API接口，包括新开发的批量操作、数据导出和智能面试调度功能。

## 🔗 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (生产环境)
- **响应格式**: JSON

## 📊 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据
  },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细错误信息"
}
```

## 🔄 批量操作API

### 1. 申请批量操作

**POST** `/hr/applications/batch`

批量处理申请数据，支持多种操作类型。

#### 请求参数
```json
{
  "action": "update_status | send_email | add_note | add_tags | delete | archive",
  "application_ids": ["id1", "id2", "id3"],
  "data": {
    "status": "reviewing",           // 状态更新时使用
    "note": "备注内容",              // 添加备注时使用
    "tags": ["标签1", "标签2"],      // 添加标签时使用
    "email_subject": "邮件主题",     // 发送邮件时使用
    "email_content": "邮件内容"      // 发送邮件时使用
  },
  "operator_id": "操作者ID"
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "action": "update_status",
    "total_requested": 3,
    "total_processed": 3,
    "total_errors": 0,
    "results": [
      {
        "id": "1",
        "success": true,
        "old_status": "pending",
        "new_status": "reviewing"
      }
    ],
    "errors": []
  },
  "message": "批量update_status操作完成，成功处理 3 条记录"
}
```

### 2. 候选人批量操作

**POST** `/hr/candidates/batch`

批量处理候选人数据。

#### 请求参数
```json
{
  "action": "update_status | add_tags | remove_tags | update_rating | add_note | move_to_pool | delete",
  "candidate_ids": ["id1", "id2"],
  "data": {
    "status": "active",              // 状态更新
    "tags": ["前端", "React"],       // 标签操作
    "rating": 4,                     // 评分更新
    "note": "备注内容",              // 添加备注
    "pool_id": "pool_001"            // 移动到候选人池
  },
  "operator_id": "操作者ID"
}
```

## 📤 数据导出API

### 1. 数据导出

**POST** `/hr/export`

导出各种类型的数据，支持多种格式。

#### 请求参数
```json
{
  "type": "applications | candidates | reports",
  "format": "csv | excel | json",
  "fields": ["field1", "field2"],     // 可选，自定义导出字段
  "dateRange": {                      // 可选，日期范围筛选
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "filters": {                        // 可选，其他筛选条件
    "status": "pending"
  },
  "filename": "自定义文件名"           // 可选
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "content": "导出的文件内容",
    "filename": "申请数据_2025-01-27.csv",
    "format": "csv",
    "stats": {
      "total_records": 150,
      "export_time": "2025-01-27T10:30:00Z",
      "status_pending": 45,
      "status_reviewing": 60
    }
  },
  "message": "成功导出 150 条申请数据"
}
```

### 2. 获取导出配置

**GET** `/hr/export?type=applications`

获取导出配置信息，包括可用字段和格式。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "available_fields": {
      "id": "申请ID",
      "candidate_name": "候选人姓名",
      "job_title": "申请职位"
    },
    "supported_formats": ["csv", "excel", "json"],
    "sample_data": {
      "id": "1",
      "candidate_name": "张三"
    },
    "total_records": 150
  }
}
```

## 🤖 智能面试调度API

### 1. 智能调度推荐

**POST** `/hr/interviews/smart-schedule`

使用AI算法生成智能面试时间推荐。

#### 请求参数
```json
{
  "application_id": "app_001",
  "candidate_id": "candidate_001",
  "job_id": "job_001",
  "interview_type": "technical | phone | video | onsite",
  "duration": 60,                     // 面试时长（分钟）
  "required_skills": ["React", "Node.js"],
  "preferred_interviewers": ["emp_001"],
  "candidate_preferences": [          // 候选人时间偏好
    {
      "date": "2025-01-29",
      "start_time": "10:00",
      "end_time": "12:00"
    }
  ],
  "urgency_level": "low | medium | high | urgent",
  "buffer_time": 15                   // 面试间隔时间（分钟）
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "application_id": "app_001",
    "scheduling_result": {
      "success": true,
      "recommended_slots": [
        {
          "date": "2025-01-29",
          "start_time": "10:00",
          "end_time": "11:00",
          "interviewer_ids": ["emp_001"],
          "interviewer_names": ["张技术总监"],
          "meeting_room_id": "room_1",
          "meeting_room_name": "会议室A",
          "confidence_score": 95,
          "conflict_risks": [],
          "scheduling_notes": [
            "时间偏好: 100分 (权重30%)",
            "工作量平衡: 90分 (权重25%)"
          ]
        }
      ],
      "alternative_options": [],
      "scheduling_summary": {
        "best_score": 95,
        "average_score": 88,
        "total_conflicts": 0,
        "recommendations": [
          "调度方案质量良好，可以选择推荐时间段"
        ]
      }
    },
    "generated_at": "2025-01-27T10:30:00Z",
    "expires_at": "2025-01-28T10:30:00Z"
  },
  "message": "成功生成 1 个推荐时间段"
}
```

### 2. 获取调度配置

**GET** `/hr/interviews/smart-schedule?type=config`

获取智能调度的配置信息。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "available_interview_types": [
      {
        "value": "technical",
        "label": "技术面试",
        "duration": 90
      }
    ],
    "urgency_levels": [
      {
        "value": "high",
        "label": "高优先级",
        "description": "3天内安排"
      }
    ],
    "default_settings": {
      "buffer_time": 15,
      "max_daily_interviews": 6
    },
    "available_skills": ["React", "Vue", "Node.js"]
  }
}
```

## 👤 候选人面试选择API

### 1. 获取面试邀请信息

**GET** `/candidates/interview-slots/{token}`

候选人通过token获取面试邀请信息。

#### 响应示例
```json
{
  "success": true,
  "data": {
    "invitation": {
      "candidate_name": "张三",
      "job_title": "资深全栈工程师",
      "company_name": "Yarbo Inc.",
      "interview_type": "technical",
      "duration": 60,
      "status": "pending",
      "available_slots": [
        {
          "id": "slot_1",
          "date": "2025-01-29",
          "start_time": "10:00",
          "end_time": "11:00",
          "interviewer_name": "张技术总监",
          "meeting_room": "会议室A",
          "is_available": true
        }
      ],
      "interview_details": {
        "description": "技术面试将包括算法、系统设计和项目经验讨论",
        "preparation_notes": [
          "请准备介绍您最有挑战性的项目"
        ],
        "contact_person": "王HR经理",
        "contact_phone": "+86 138-0000-0000"
      }
    },
    "expires_in_hours": 48
  }
}
```

### 2. 选择面试时间

**POST** `/candidates/interview-slots/{token}`

候选人选择面试时间。

#### 请求参数
```json
{
  "slot_id": "slot_1",
  "candidate_notes": "我会准时参加面试"
}
```

#### 响应示例
```json
{
  "success": true,
  "data": {
    "confirmed_slot": {
      "date": "2025-01-29",
      "start_time": "10:00",
      "end_time": "11:00",
      "interviewer_name": "张技术总监"
    },
    "confirmation_number": "INT-1706345400",
    "message": "面试时间已确认，确认邮件已发送到您的邮箱"
  },
  "message": "面试时间确认成功！"
}
```

### 3. 重新安排面试

**PUT** `/candidates/interview-slots/{token}`

候选人重新安排面试时间。

#### 请求参数
```json
{
  "new_slot_id": "slot_2",
  "reschedule_reason": "临时有事，需要调整时间"
}
```

## 📊 API状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 410 | 资源已过期 |
| 500 | 服务器内部错误 |

## 🔧 API测试

### 使用curl测试

```bash
# 批量操作测试
curl -X POST http://localhost:3000/api/hr/applications/batch \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "application_ids": ["1", "2"],
    "data": {"status": "reviewing"}
  }'

# 数据导出测试
curl -X POST http://localhost:3000/api/hr/export \
  -H "Content-Type: application/json" \
  -d '{
    "type": "applications",
    "format": "csv"
  }'

# 智能调度测试
curl -X POST http://localhost:3000/api/hr/interviews/smart-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "test",
    "candidate_id": "test",
    "job_id": "test",
    "interview_type": "technical"
  }'
```

## 📈 性能指标

- **响应时间**: < 500ms (智能调度 < 300ms)
- **并发处理**: 支持100+并发请求
- **数据处理**: 支持万级数据批量操作
- **可用性**: > 99.9%

---

**文档维护者**: Allen Huang  
**最后更新**: 2025-01-27  
**版本**: v1.0.0
