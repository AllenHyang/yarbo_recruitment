# 🚀 Yarbo 招聘系统 - Playwright 测试套件

这是一个全面的 Playwright 端到端测试套件，覆盖了 Yarbo 招聘系统的所有 45 个页面和 150+ 个交互元素。

## 📊 测试覆盖范围

### 测试统计
- **总页面数**: 45 个
- **测试模块**: 7 个
- **交互元素**: 150+ 个
- **测试用例**: 70+ 个

### 模块分布
| 模块 | 页面数 | 优先级 | 描述 |
|------|--------|--------|------|
| 基础功能测试 | 7 | High | 根页面和基础功能 |
| 认证系统测试 | 4 | High | 用户认证和权限控制 |
| 申请系统测试 | 2 | High | 职位申请和在线测评 |
| HR管理系统测试 | 22 | Medium | HR管理功能 |
| 职位和候选人测试 | 3 | Medium | 职位浏览和候选人系统 |
| 测试调试页面测试 | 9 | Low | 测试和调试功能 |
| 综合集成测试 | - | High | 系统集成和端到端测试 |

## 🛠️ 安装和配置

### 前置要求
- Node.js 18+
- npm 或 yarn
- 运行中的开发服务器 (localhost:3000)

### 安装依赖
```bash
# 安装 Playwright
npm install --save-dev @playwright/test

# 安装浏览器
npx playwright install
```

### 配置文件
- `playwright.config.ts` - Playwright 主配置
- `tests/utils/test-helpers.ts` - 测试工具类
- `tests/pages/` - 页面对象模型

## 🚀 运行测试

### 基本命令
```bash
# 运行所有测试
npm run test:e2e

# 运行测试并显示浏览器
npm run test:e2e:headed

# 运行测试 UI 模式
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:report
```

### 按优先级运行
```bash
# 运行高优先级测试
npx ts-node tests/test-runner.ts --priority=high

# 运行中优先级测试
npx ts-node tests/test-runner.ts --priority=medium

# 运行低优先级测试
npx ts-node tests/test-runner.ts --priority=low
```

### 按模块运行
```bash
# 运行基础功能测试
npx playwright test tests/01-basic-functionality.spec.ts

# 运行认证系统测试
npx playwright test tests/02-authentication.spec.ts

# 运行HR管理系统测试
npx playwright test tests/04-hr-management.spec.ts
```

## 📋 测试模块详情

### 1. 基础功能测试 (01-basic-functionality.spec.ts)
**覆盖页面**: 7 个
- 首页 (/)
- 仪表板 (/dashboard)
- 个人资料 (/profile)
- 消息中心 (/messages)
- 申请状态 (/status)
- 系统设置 (/setup)
- 未授权页面 (/unauthorized)

**测试内容**:
- 页面加载和导航
- 权限控制
- 响应式设计
- 错误处理

### 2. 认证系统测试 (02-authentication.spec.ts)
**覆盖页面**: 4 个
- 登录页面 (/auth/login)
- 注册页面 (/auth/register)
- 忘记密码 (/auth/forgot-password)
- 重置密码 (/auth/reset-password)

**测试内容**:
- 登录/注册流程
- 表单验证
- 会话管理
- 权限控制

### 3. 申请系统测试 (03-application-system.spec.ts)
**覆盖页面**: 2 个
- 职位申请 (/apply)
- 在线测评 (/assessment)

**测试内容**:
- 申请表单提交
- 文件上传
- 表单验证
- 状态跟踪

### 4. HR管理系统测试 (04-hr-management.spec.ts)
**覆盖页面**: 22 个
- HR仪表板 (/hr/dashboard)
- 申请管理 (/hr/applications)
- 候选人管理 (/hr/candidates)
- 职位管理 (/hr/jobs)
- 面试管理 (/hr/interviews)
- 数据分析 (/hr/analytics)
- 等等...

**测试内容**:
- 数据管理
- 批量操作
- 搜索筛选
- 图表展示

### 5. 职位和候选人测试 (05-jobs-and-candidates.spec.ts)
**覆盖页面**: 3 个
- 职位列表 (/jobs)
- 职位详情 (/jobs/[id])
- 面试时间选择 (/candidates/interview/[token])

**测试内容**:
- 职位浏览
- 搜索筛选
- 申请流程
- 面试安排

### 6. 测试调试页面测试 (06-testing-debug.spec.ts)
**覆盖页面**: 9 个
- 系统测试 (/test)
- API测试 (/test-api)
- 申请测试 (/test-apply)
- 等等...

**测试内容**:
- 系统功能验证
- API连接测试
- 调试工具

### 7. 综合集成测试 (07-comprehensive-integration.spec.ts)
**测试内容**:
- 完整用户流程
- 权限控制集成
- 数据流一致性
- 性能测试
- 错误处理

## 🔧 测试工具和页面对象

### 测试工具类 (TestHelpers)
```typescript
// 登录用户
await testHelpers.loginAsHR();
await testHelpers.loginAsAdmin();
await testHelpers.loginAsCandidate();

// 验证元素
await testHelpers.verifyElementVisible('selector');
await testHelpers.verifyTextContent('selector', 'text');

// 表单操作
await testHelpers.fillForm({ 'input[name="email"]': 'test@example.com' });
await testHelpers.clickButtonAndWait('提交');
```

### 页面对象模型
- `HomePage` - 首页操作
- `LoginPage` - 登录页面操作
- 更多页面对象可根据需要添加

### 测试数据生成器
```typescript
// 生成测试数据
const applicationData = TestDataGenerator.generateJobApplication();
const email = TestDataGenerator.generateRandomEmail();
```

## 📊 测试报告

### 报告类型
- **HTML报告**: `test-results/report.html` - 可视化测试报告
- **JSON报告**: `test-results/results.json` - 机器可读的测试结果
- **JUnit报告**: `test-results/results.xml` - CI/CD集成

### 查看报告
```bash
# 生成并查看HTML报告
npm run test:report

# 自定义测试运行器报告
npx ts-node tests/test-runner.ts
```

## 🎯 最佳实践

### 测试编写
1. **使用页面对象模型** - 提高代码复用性
2. **数据驱动测试** - 使用测试数据生成器
3. **等待策略** - 使用适当的等待方法
4. **错误处理** - 包含错误场景测试

### 测试维护
1. **模块化组织** - 按功能模块组织测试
2. **优先级管理** - 区分高中低优先级测试
3. **持续集成** - 集成到CI/CD流程
4. **定期更新** - 随功能更新测试用例

## 🚨 故障排除

### 常见问题
1. **测试超时** - 检查网络连接和服务器状态
2. **元素找不到** - 验证选择器和页面加载状态
3. **权限错误** - 确认测试用户权限配置
4. **数据不一致** - 检查测试数据和数据库状态

### 调试技巧
```bash
# 调试模式运行
npm run test:e2e:debug

# 显示浏览器运行
npm run test:e2e:headed

# 查看详细日志
npx playwright test --reporter=line
```

## 📈 性能基准

### 页面加载时间
- 首页: < 3秒
- 职位列表: < 3秒
- HR仪表板: < 4秒
- 申请页面: < 2秒

### 测试执行时间
- 基础功能测试: ~5分钟
- 认证系统测试: ~3分钟
- HR管理系统测试: ~10分钟
- 完整测试套件: ~25分钟

## 🔄 持续集成

### GitHub Actions 示例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## 📞 支持和贡献

### 获取帮助
- 查看测试文档和注释
- 运行调试模式分析问题
- 检查测试报告中的错误信息

### 贡献指南
1. 遵循现有的测试结构和命名规范
2. 添加适当的注释和文档
3. 确保新测试通过所有检查
4. 更新相关文档

---

**最后更新**: 2025年6月14日  
**版本**: v1.0.0
