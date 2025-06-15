# 🎯 HR后台管理系统 - 核心功能定义

## 📋 1. 职位发布管理

### 1.1 发布新职位 `/hr/jobs/create`
**核心功能**:
- ✅ 职位基本信息填写
- ✅ 职位描述和要求编辑
- ✅ 薪资福利设置
- ✅ 发布状态控制
- ✅ 优先级设定

**数据字段**:
```typescript
interface JobCreateData {
  title: string;              // 职位名称
  department: string;         // 部门
  location: string;           // 工作地点  
  employment_type: string;    // 全职/兼职/合同工
  experience_level: string;   // 经验要求
  description: string;        // 职位描述
  requirements: string[];     // 任职要求
  salary_range: string;       // 薪资范围
  benefits: string[];         // 福利待遇
  priority: 1|2|3|4|5;       // 紧急程度
  deadline: Date;             // 截止日期
  status: 'draft'|'published'; // 状态
}
```

**API接口**:
```
POST /api/hr/jobs - 创建职位
PUT  /api/hr/jobs/:id - 更新职位
PATCH /api/hr/jobs/:id/publish - 发布职位
```

### 1.2 职位管理列表 `/hr/jobs`
**核心功能**:
- 📋 职位列表展示
- 🔍 搜索和筛选
- 📊 申请数量统计
- ⚡ 批量操作
- 📤 数据导出

**筛选条件**:
- 职位状态 (草稿/已发布/已关闭)
- 部门筛选
- 创建时间范围
- 申请数量范围

## 📨 2. 申请管理系统

### 2.1 申请列表管理 `/hr/applications`
**核心功能**:
- 📋 申请列表展示
- 🎯 状态筛选
- 👤 候选人信息预览
- 📊 批量状态更新
- 📧 批量邮件发送

**申请状态流转**:
```
pending → reviewing → interview → decision → hired/rejected
```

### 2.2 申请详情页面 `/hr/applications/[id]`
**核心功能**:
- 👤 候选人详细信息
- 📄 简历在线查看
- 📝 评估记录管理
- 💬 沟通记录追踪
- ⚡ 状态快速更新

**页面组件**:
- CandidateProfile - 候选人档案
- ResumeViewer - 简历查看器
- StatusManager - 状态管理
- NotesSection - 备注记录
- ActionButtons - 快捷操作

## 👥 3. 候选人管理

### 3.1 候选人数据库 `/hr/candidates`
**核心功能**:
- 👥 候选人档案管理
- 🔍 高级搜索功能
- 🏷️ 标签分类系统
- ⭐ 候选人评级
- 📞 联系记录管理

**搜索维度**:
- 姓名/邮箱关键词
- 技能标签
- 工作经验年限
- 期望薪资范围
- 最后联系时间

### 3.2 候选人池功能 `/hr/candidate-pools`
**池类型**:
- 🎯 主动求职池
- 💤 潜在人才池
- ⭐ 优质候选人池
- 🎓 校招储备池

## 📅 4. 面试管理

### 4.1 面试安排 `/hr/interviews`
**核心功能**:
- 📅 面试日程管理
- 👥 面试官分配
- 🔗 会议链接生成
- ⏰ 提醒通知
- 📝 反馈收集

**面试类型**:
- phone_screen - 电话筛选
- video_interview - 视频面试
- onsite_interview - 现场面试
- technical_test - 技术测试

### 4.2 面试反馈系统
**核心功能**:
- ⭐ 多维度评分
- 📝 详细反馈记录
- 🤝 协作评估
- 📊 数据统计

## 📊 5. 数据分析

### 5.1 管理仪表板 `/hr/dashboard`
**关键指标**:
- 📈 总申请数量
- ⏳ 待处理申请
- 📅 本周面试安排
- 🎯 本月录用人数
- ⏱️ 平均处理时间
- 📊 申请转换率

### 5.2 数据报告 `/hr/reports`
**报告类型**:
- 📊 招聘漏斗分析
- ⏰ 招聘周期报告
- 💰 成本效益分析
- 📈 渠道效果对比

## 🔧 API接口设计

### 职位管理
```
GET    /api/hr/jobs              - 获取职位列表
POST   /api/hr/jobs              - 创建新职位
GET    /api/hr/jobs/:id          - 获取职位详情
PUT    /api/hr/jobs/:id          - 更新职位
PATCH  /api/hr/jobs/:id/status   - 更新状态
DELETE /api/hr/jobs/:id          - 删除职位
```

### 申请管理
```
GET    /api/hr/applications      - 获取申请列表
GET    /api/hr/applications/:id  - 获取申请详情
PATCH  /api/hr/applications/:id  - 更新申请信息
POST   /api/hr/applications/batch - 批量操作
```

### 候选人管理
```
GET    /api/hr/candidates        - 获取候选人列表
GET    /api/hr/candidates/:id    - 获取候选人详情
POST   /api/hr/candidates/search - 高级搜索
```

### 面试管理
```
GET    /api/hr/interviews        - 获取面试列表
POST   /api/hr/interviews        - 安排面试
PUT    /api/hr/interviews/:id    - 更新面试
POST   /api/hr/interviews/:id/feedback - 提交反馈
```

## 📱 界面设计要求

### 设计原则
- 🎨 遵循现有设计系统
- 📱 响应式布局
- ⚡ 快速加载
- 🎯 操作便捷

### 关键页面布局

#### 1. 职位发布页面
- 步骤式引导界面
- 实时预览功能
- 草稿自动保存
- 发布前检查

#### 2. 申请管理页面
- 列表+详情双栏布局
- 快速筛选工具栏
- 批量操作工具
- 状态拖拽更新

#### 3. 面试管理页面
- 日历视图
- 时间冲突检测
- 一键发送邀请
- 反馈表单

## 🚀 开发优先级

### Phase 1 (高优先级)
1. ✅ 职位发布功能
2. ✅ 申请状态管理
3. ✅ 基础数据展示
4. ✅ 用户权限控制

### Phase 2 (中优先级)
1. ⭐ 面试管理系统
2. ⭐ 候选人搜索
3. ⭐ 邮件通知
4. ⭐ 数据导出

### Phase 3 (低优先级)
1. 🔮 高级分析报告
2. 🔮 移动端优化
3. 🔮 第三方集成
4. 🔮 AI辅助功能

## 📋 实现清单

### 数据库准备
- [ ] 扩展jobs表字段
- [ ] 创建interviews表
- [ ] 创建candidate_pools表
- [ ] 设置RLS策略

### 前端开发
- [ ] 创建页面路由结构
- [ ] 实现UI组件
- [ ] 集成状态管理
- [ ] 添加表单验证

### 后端开发
- [ ] 创建API路由
- [ ] 实现业务逻辑
- [ ] 添加权限验证
- [ ] 集成邮件服务

### 测试验证
- [ ] 单元测试
- [ ] 集成测试
- [ ] 用户验收测试
- [ ] 性能测试

---
**文档状态**: ✅ 核心功能已定义  
**下一步**: 开始数据库设计和API开发  
**预计工期**: 4-6周 