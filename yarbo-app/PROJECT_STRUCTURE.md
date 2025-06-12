# 📁 Yarbo招聘系统项目结构

## 📋 项目概览

本文档详细说明了Yarbo招聘系统的完整文件结构，包括新开发的批量操作、数据导出和智能面试调度功能。

## 🏗️ 完整文件结构

```
yarbo-app/
├── 📄 README.md                                    # 项目主文档
├── 📄 BULK_OPERATIONS_AND_EXPORT.md               # 批量操作和数据导出文档
├── 📄 SMART_INTERVIEW_SCHEDULING.md               # 智能面试调度文档
├── 📄 DEVELOPMENT_SUMMARY.md                      # 开发总结文档
├── 📄 PROJECT_STRUCTURE.md                        # 项目结构文档（本文件）
├── 📄 package.json                                # 项目依赖配置
├── 📄 next.config.js                              # Next.js配置
├── 📄 tailwind.config.js                          # Tailwind CSS配置
├── 📄 tsconfig.json                               # TypeScript配置
├── 📄 .eslintrc.json                              # ESLint配置
├── 📄 .gitignore                                  # Git忽略文件
│
├── 📁 src/                                        # 源代码目录
│   ├── 📁 app/                                    # Next.js App Router
│   │   ├── 📄 layout.tsx                         # 根布局组件
│   │   ├── 📄 page.tsx                           # 首页
│   │   ├── 📄 globals.css                        # 全局样式
│   │   │
│   │   ├── 📁 hr/                                # HR管理模块
│   │   │   ├── 📄 layout.tsx                     # HR模块布局
│   │   │   ├── 📁 dashboard/                     # 仪表板
│   │   │   │   └── 📄 page.tsx                   # 仪表板页面
│   │   │   ├── 📁 candidates/                    # 候选人管理
│   │   │   │   └── 📄 page.tsx                   # 候选人管理页面（含批量操作）
│   │   │   ├── 📁 jobs/                          # 职位管理
│   │   │   │   └── 📄 page.tsx                   # 职位管理页面
│   │   │   ├── 📁 interviews/                    # 面试管理
│   │   │   │   └── 📄 page.tsx                   # 面试管理页面（含智能调度）
│   │   │   ├── 📁 analytics/                     # 数据分析
│   │   │   │   └── 📄 page.tsx                   # 数据分析页面
│   │   │   ├── 📁 reports/                       # 报告中心
│   │   │   │   └── 📄 page.tsx                   # 报告中心页面
│   │   │   ├── 📁 settings/                      # 系统设置
│   │   │   │   └── 📄 page.tsx                   # 系统设置页面
│   │   │   ├── 📁 test-bulk-export/              # 🆕 批量操作测试
│   │   │   │   └── 📄 page.tsx                   # 批量操作和数据导出测试页面
│   │   │   └── 📁 test-smart-scheduling/         # 🆕 智能调度测试
│   │   │       └── 📄 page.tsx                   # 智能面试调度测试页面
│   │   │
│   │   ├── 📁 candidates/                        # 候选人相关页面
│   │   │   └── 📁 interview/                     # 🆕 面试相关
│   │   │       └── 📁 [token]/                   # 🆕 基于token的面试页面
│   │   │           └── 📄 page.tsx               # 候选人面试时间选择页面
│   │   │
│   │   └── 📁 api/                               # API路由
│   │       ├── 📁 hr/                            # HR相关API
│   │       │   ├── 📁 applications/              # 申请相关API
│   │       │   │   ├── 📄 route.ts               # 申请基础API
│   │       │   │   └── 📁 batch/                 # 🆕 批量操作API
│   │       │   │       └── 📄 route.ts           # 申请批量操作API
│   │       │   ├── 📁 candidates/                # 候选人相关API
│   │       │   │   ├── 📄 route.ts               # 候选人基础API
│   │       │   │   └── 📁 batch/                 # 🆕 候选人批量操作API
│   │       │   │       └── 📄 route.ts           # 候选人批量操作API
│   │       │   ├── 📁 export/                    # 🆕 数据导出API
│   │       │   │   └── 📄 route.ts               # 数据导出API
│   │       │   └── 📁 interviews/                # 面试相关API
│   │       │       ├── 📄 route.ts               # 面试基础API
│   │       │       └── 📁 smart-schedule/        # 🆕 智能调度API
│   │       │           └── 📄 route.ts           # 智能面试调度API
│   │       └── 📁 candidates/                    # 候选人公开API
│   │           └── 📁 interview-slots/           # 🆕 面试时间选择API
│   │               └── 📁 [token]/               # 基于token的API
│   │                   └── 📄 route.ts           # 候选人面试时间选择API
│   │
│   ├── 📁 components/                            # 可复用组件
│   │   ├── 📁 ui/                                # 基础UI组件（Shadcn/ui）
│   │   │   ├── 📄 button.tsx                     # 按钮组件
│   │   │   ├── 📄 card.tsx                       # 卡片组件
│   │   │   ├── 📄 input.tsx                      # 输入框组件
│   │   │   ├── 📄 select.tsx                     # 选择器组件
│   │   │   ├── 📄 dialog.tsx                     # 对话框组件
│   │   │   ├── 📄 table.tsx                      # 表格组件
│   │   │   ├── 📄 badge.tsx                      # 徽章组件
│   │   │   ├── 📄 checkbox.tsx                   # 复选框组件
│   │   │   ├── 📄 textarea.tsx                   # 文本域组件
│   │   │   ├── 📄 tabs.tsx                       # 标签页组件
│   │   │   └── 📄 label.tsx                      # 标签组件
│   │   └── 📁 hr/                                # HR业务组件
│   │       ├── 📄 BulkActionToolbar.tsx          # 🆕 批量操作工具栏
│   │       ├── 📄 DataExport.tsx                 # 🆕 数据导出组件
│   │       └── 📄 SmartInterviewScheduler.tsx    # 🆕 智能面试调度组件
│   │
│   └── 📁 lib/                                   # 工具函数和算法
│       ├── 📄 utils.ts                           # 通用工具函数
│       ├── 📄 export.ts                          # 🆕 数据导出工具函数
│       └── 📄 interview-scheduling.ts            # 🆕 智能面试调度算法
│
├── 📁 public/                                    # 静态资源
│   ├── 📄 favicon.ico                            # 网站图标
│   └── 📁 images/                                # 图片资源
│
└── 📁 .next/                                     # Next.js构建输出（自动生成）
```

## 🆕 新增功能文件详解

### 批量操作和数据导出模块

#### API层
- **`src/app/api/hr/applications/batch/route.ts`**
  - 申请批量操作API
  - 支持状态更新、邮件发送、标签管理、备注添加、归档删除
  - 包含操作历史记录和错误处理

- **`src/app/api/hr/candidates/batch/route.ts`**
  - 候选人批量操作API
  - 支持状态更新、评分修改、标签管理、候选人池移动
  - 完整的操作审计和历史记录

- **`src/app/api/hr/export/route.ts`**
  - 数据导出API
  - 支持CSV、Excel、JSON三种格式
  - 自定义字段选择和筛选条件

#### 组件层
- **`src/components/hr/BulkActionToolbar.tsx`**
  - 通用批量操作工具栏组件
  - 支持多种操作类型和确认机制
  - 实时进度显示和结果反馈

- **`src/components/hr/DataExport.tsx`**
  - 数据导出对话框组件
  - 分步骤的导出配置界面
  - 格式选择、字段定制、筛选设置

#### 工具库
- **`src/lib/export.ts`**
  - 数据导出核心工具函数
  - 格式转换、字段映射、文件生成
  - 统计信息和数据验证

### 智能面试调度模块

#### API层
- **`src/app/api/hr/interviews/smart-schedule/route.ts`**
  - 智能面试调度API
  - AI算法驱动的时间推荐
  - 多维度评分和冲突检测

- **`src/app/api/candidates/interview-slots/[token]/route.ts`**
  - 候选人面试时间选择API
  - 基于安全token的访问控制
  - 支持时间选择和重新安排

#### 组件层
- **`src/components/hr/SmartInterviewScheduler.tsx`**
  - 智能面试调度主组件
  - 分步骤的调度配置界面
  - AI推荐结果展示和确认

#### 算法库
- **`src/lib/interview-scheduling.ts`**
  - 智能调度核心算法
  - 多维度评分系统
  - 冲突检测和负载均衡

#### 页面层
- **`src/app/candidates/interview/[token]/page.tsx`**
  - 候选人面试时间选择页面
  - 友好的用户界面
  - 自助选择和确认流程

### 测试页面

- **`src/app/hr/test-bulk-export/page.tsx`**
  - 批量操作和数据导出功能测试页面
  - 完整的功能演示和验证
  - 实时测试结果展示

- **`src/app/hr/test-smart-scheduling/page.tsx`**
  - 智能面试调度功能测试页面
  - AI算法测试和演示
  - 多场景测试用例

## 📊 文件统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 新增API文件 | 4个 | 批量操作、数据导出、智能调度相关API |
| 新增组件文件 | 3个 | 批量操作工具栏、数据导出、智能调度组件 |
| 新增工具文件 | 2个 | 导出工具函数、智能调度算法 |
| 新增页面文件 | 3个 | 候选人选择页面、两个测试页面 |
| 更新页面文件 | 3个 | 申请管理、候选人管理、面试管理页面 |
| 文档文件 | 5个 | README、功能文档、开发总结等 |

## 🔧 技术架构

### 前端架构
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件**: Shadcn/ui + 自定义业务组件
- **状态管理**: React Hooks

### API架构
- **设计模式**: RESTful API
- **路由结构**: 基于文件系统的API路由
- **数据格式**: JSON
- **错误处理**: 统一的错误响应格式

### 算法架构
- **智能调度**: 多维度评分算法
- **数据处理**: 流式处理和批量操作
- **性能优化**: 缓存和异步处理

## 🚀 部署结构

### 开发环境
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
```

### 生产环境
- **平台**: Vercel（推荐）或自托管
- **域名**: 自定义域名配置
- **环境变量**: 生产环境配置
- **监控**: 性能和错误监控

---

**文档维护者**: Allen Huang  
**最后更新**: 2025-01-27  
**版本**: v1.0.0
