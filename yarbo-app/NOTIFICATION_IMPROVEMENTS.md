# 通知中心功能改进文档

## 概述

本次改进为 yarbo-recruitment 应用的通知中心添加了点击跳转功能，大大提升了用户交互体验。

## 新增功能

### 🔗 点击跳转功能

- **通知可点击**：所有通知现在都可以点击，会根据通知类型跳转到相应页面
- **智能路由**：根据用户角色和通知类型自动生成正确的跳转 URL
- **自动标记已读**：点击通知后自动标记为已读

### 🎨 用户体验优化

- **视觉指示**：hover 时显示外部链接图标和"点击查看详情"提示
- **交互反馈**：鼠标悬停时的视觉效果
- **按钮优化**：标记已读和删除按钮仅在 hover 时显示

## 跳转规则

### 申请状态通知 (`application_status`)

- **候选人**：跳转到 `/status` - 查看申请状态
- **HR/管理员**：跳转到 `/hr/applications/{applicationId}` - 查看申请详情

### 新申请通知 (`new_application`)

- **HR/管理员**：跳转到 `/hr/applications/{applicationId}` - 查看新申请详情

### 面试安排通知 (`interview_scheduled`)

- **候选人**：跳转到 `/status` - 查看面试安排
- **HR/管理员**：跳转到 `/hr/interviews/{interviewId}` - 管理面试

### 系统更新通知 (`system_update`)

- **所有用户**：跳转到相应的仪表板页面

## 技术实现

### 数据结构扩展

```typescript
interface NotificationData {
  // ... 原有字段
  actionUrl?: string; // 跳转URL
  actionType?: "internal" | "external"; // 跳转类型
}
```

### 核心函数

- `generateNotificationActionUrl()` - 生成跳转 URL
- `handleNotificationClick()` - 处理点击事件
- 更新的通知发送函数支持自动生成跳转 URL

### UI 改进

- 添加了 hover 效果和视觉指示
- 优化了按钮显示逻辑
- 改进了点击区域和交互反馈

## 使用方法

### 对于用户

1. 点击右上角的通知铃铛打开通知中心
2. 将鼠标悬停在通知上查看交互效果
3. 直接点击通知项跳转到相关页面
4. 点击后通知会自动标记为已读

### 对于开发者

1. 发送通知时会自动生成跳转 URL
2. 可以手动指定 `actionUrl` 和 `actionType`
3. 使用 `generateNotificationActionUrl()` 函数生成标准跳转 URL

## 兼容性

- ✅ 保持了所有现有功能
- ✅ "标记为已读"按钮功能完整保留
- ✅ 删除通知功能正常工作
- ✅ 现有的通知显示和管理功能不受影响

## 测试验证

功能已通过以下测试：

- ✅ 通知点击跳转正确
- ✅ 自动标记已读功能
- ✅ 不同用户角色的跳转逻辑
- ✅ 视觉效果和交互反馈
- ✅ 现有功能兼容性

## 文件修改清单

### 修改的文件

1. **`src/lib/realtime.ts`**

   - 扩展了 `NotificationData` 接口
   - 添加了 `generateNotificationActionUrl()` 函数
   - 更新了通知发送函数

2. **`src/components/NotificationCenter.tsx`**
   - 添加了点击处理逻辑
   - 优化了 UI 和交互效果
   - 改进了视觉指示

### 新增功能

- 智能跳转 URL 生成
- 点击自动标记已读
- 增强的用户交互体验

## 🔧 跳转逻辑修复 (2024-12-19)

### 问题描述

管理员用户点击"申请状态更新"类型的通知时，系统错误地将其跳转到 `/status` 页面（候选人页面），而不是 `/hr/applications` 页面（管理员页面）。

### 根本原因

1. **错误的角色使用**：`handleNotificationClick` 函数使用 `notification.userRole` 而不是当前用户的角色
2. **硬编码 URL**：模拟通知数据中硬编码了 `actionUrl`，导致动态生成逻辑被跳过

### 修复措施

1. **修复角色判断**：

   ```typescript
   // 修复前
   generateNotificationActionUrl(
     notification.type,
     notification.metadata,
     notification.userRole // 错误：使用通知中的角色
   );

   // 修复后
   generateNotificationActionUrl(
     notification.type,
     notification.metadata,
     userProfile?.role || "candidate" // 正确：使用当前用户角色
   );
   ```

2. **移除硬编码 URL**：从模拟通知数据中移除 `actionUrl` 字段，让系统动态生成正确的跳转路径

### 验证结果

- ✅ 管理员点击申请状态通知 → 跳转到 `/hr/applications`
- ✅ 候选人点击申请状态通知 → 跳转到 `/status`
- ✅ 角色权限判断准确
- ✅ 动态 URL 生成正常工作

## 🎯 面试通知角色适配修复 (2024-12-19)

### 问题描述

管理员用户收到了不适当的面试通知，显示"您的产品经理面试已安排在明天下午 2 点"，但管理员角色不应该作为候选人参加面试。

### 根本原因

1. **静态通知数据**：所有用户都收到相同的模拟通知，不区分角色
2. **错误的通知内容**：面试通知使用候选人视角的文案，不适合管理员
3. **缺少角色权限验证**：没有根据用户角色生成适当的通知类型

### 修复措施

#### 1. **角色化通知数据生成**

```typescript
// 修复前 - 所有用户收到相同通知
const mockNotifications: NotificationData[] = [
  {
    type: "interview_scheduled",
    message: "您的产品经理面试已安排在明天下午2点", // 候选人视角
    // ...
  },
];

// 修复后 - 根据角色生成不同通知
if (currentRole === "candidate") {
  // 候选人通知
  mockNotifications.push({
    type: "interview_scheduled",
    message: "您的产品经理面试已安排在明天下午2点",
    // ...
  });
} else if (currentRole === "hr" || currentRole === "admin") {
  // HR/管理员通知
  mockNotifications.push({
    type: "interview_scheduled",
    message: "需要为李四安排UI设计师职位的面试",
    // ...
  });
}
```

#### 2. **通知内容角色适配**

- **候选人通知**：

  - "您的产品经理申请正在审核中"
  - "您的产品经理面试已安排在明天下午 2 点"

- **HR/管理员通知**：
  - "张三申请了高级前端工程师职位"
  - "需要为李四安排 UI 设计师职位的面试"
  - "王五的前端工程师申请等待您的审核"

#### 3. **实时订阅逻辑优化**

```typescript
// HR/管理员也订阅面试管理相关通知
if (userProfile.role === "hr" || userProfile.role === "admin") {
  const unsubscribeInterviews = subscribeToInterviewUpdates(
    user.id,
    (interview) => {
      // 处理面试管理通知
    }
  );
  unsubscribeFunctions.push(unsubscribeInterviews);
}
```

### 验证结果

| 用户角色   | 通知类型 | 通知内容                             | 状态          |
| ---------- | -------- | ------------------------------------ | ------------- |
| **候选人** | 面试安排 | "您的产品经理面试已安排..."          | ✅ 正确       |
| **候选人** | 申请状态 | "您的产品经理申请正在审核中"         | ✅ 正确       |
| **管理员** | 面试管理 | "需要为李四安排 UI 设计师职位的面试" | ✅ **已修复** |
| **管理员** | 新申请   | "张三申请了高级前端工程师职位"       | ✅ 正确       |
| **管理员** | 申请审核 | "王五的前端工程师申请等待您的审核"   | ✅ 正确       |

### 角色权限验证

- ✅ **候选人**：只收到与自己相关的申请和面试通知
- ✅ **HR/管理员**：收到需要处理的管理类通知
- ✅ **管理员**：不再收到作为候选人的面试通知
- ✅ **通知内容**：完全符合接收者的角色身份

## 后续扩展

可以考虑的进一步改进：

- 添加通知预览功能
- 支持批量操作
- 添加通知分类筛选
- 实现通知搜索功能
