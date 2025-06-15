import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES } from './utils/test-helpers';

test.describe('测试和调试页面测试 - Testing & Debug (9个页面)', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('6.10 测试页面集成测试', async ({ page }) => {
    // 测试所有测试页面的导航和功能

    const testPages = [
      '/test',
      '/test-api',
      '/test-apply',
      '/test-nav',
      '/test-notifications',
      '/test-styles',
      '/test/email',
      '/test/realtime',
      '/debug-jobs'
    ];

    for (const testPage of testPages) {
      await page.goto(testPage);
      await testHelpers.waitForPageLoad();

      // 验证页面加载
      await testHelpers.verifyElementVisible('main');

      // 验证页面标题或主要内容
      const hasContent = await page.locator('h1, h2, [data-testid="page-title"]').count() > 0;
      expect(hasContent).toBeTruthy();

      // 验证测试功能按钮
      const hasTestButton = await page.locator('button:has-text("测试"), button:has-text("运行")').count() > 0;
      if (hasTestButton) {
        await testHelpers.verifyElementVisible('button:has-text("测试"), button:has-text("运行")');
      }
    }
  });

  test('6.11 性能监控测试', async ({ page }) => {
    // 测试各个测试页面的加载性能

    const testPages = [
      '/test-api',
      '/test/realtime',
      '/debug-jobs'
    ];

    for (const testPage of testPages) {
      const startTime = Date.now();
      await page.goto(testPage);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      // 验证页面在合理时间内加载完成
      expect(loadTime).toBeLessThan(5000);

      // 验证页面功能正常
      await testHelpers.verifyElementVisible('main');
    }
  });

  test('6.12 错误处理和容错测试', async ({ page }) => {
    // 测试网络错误情况下的页面表现

    // 模拟网络错误
    await page.route('**/api/**', route => route.abort());

    await page.goto('/test-api');
    await testHelpers.waitForPageLoad();

    // 验证错误处理
    await testHelpers.verifyErrorHandling();

    // 恢复网络
    await page.unroute('**/api/**');

    // 测试页面恢复
    await page.reload();
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyElementVisible('main');
  });

  test('6.1 系统测试 (/test) - 系统功能测试页面', async ({ page }) => {
    await page.goto('/test');
    await testHelpers.waitForPageLoad();

    // 验证测试页面加载
    await testHelpers.verifyElementVisible('main');

    // 验证测试功能列表
    const testFeatures = [
      '[data-testid="database-test"]',
      '[data-testid="api-test"]',
      '[data-testid="auth-test"]',
      '[data-testid="ui-test"]'
    ];

    for (const feature of testFeatures) {
      const featureExists = await page.locator(feature).count() > 0;
      if (featureExists) {
        await testHelpers.verifyElementVisible(feature);
      }
    }

    // 验证测试执行按钮
    const testButtons = [
      'button:has-text("运行所有测试")',
      'button:has-text("运行单元测试")',
      'button:has-text("运行集成测试")'
    ];

    for (const button of testButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试运行测试功能
    const runTestButton = page.locator('button:has-text("运行测试")').first();
    if (await runTestButton.count() > 0) {
      await runTestButton.click();
      await testHelpers.waitForPageLoad();

      // 验证测试结果显示
      await testHelpers.verifyElementVisible('[data-testid="test-results"]');
    }
  });

  test('6.2 API测试 (/test-api) - API连接和数据获取测试', async ({ page }) => {
    await page.goto('/test-api');
    await testHelpers.waitForPageLoad();

    // 验证API测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证API测试列表
    const apiTests = [
      '[data-testid="jobs-api-test"]',
      '[data-testid="applications-api-test"]',
      '[data-testid="users-api-test"]',
      '[data-testid="auth-api-test"]'
    ];

    for (const test of apiTests) {
      const testExists = await page.locator(test).count() > 0;
      if (testExists) {
        await testHelpers.verifyElementVisible(test);
      }
    }

    // 验证测试按钮
    await testHelpers.verifyElementVisible('button:has-text("测试API连接")');

    // 测试API连接
    await testHelpers.clickButtonAndWait('测试API连接');

    // 验证测试结果
    await testHelpers.verifyElementVisible('[data-testid="api-test-results"]');

    // 验证API响应数据显示
    await testHelpers.verifyElementVisible('[data-testid="api-response"]');
  });

  test('6.3 申请测试 (/test-apply) - 申请提交功能测试', async ({ page }) => {
    await page.goto('/test-apply');
    await testHelpers.waitForPageLoad();

    // 验证测试申请页面
    await testHelpers.verifyElementVisible('main');

    // 验证开始测试按钮
    await testHelpers.verifyElementVisible('button:has-text("开始测试申请提交")');

    // 执行申请测试
    await testHelpers.clickButtonAndWait('开始测试申请提交');

    // 验证测试执行结果
    await testHelpers.verifyElementVisible('[data-testid="test-execution-results"]');

    // 验证测试详细信息
    const testDetails = [
      '[data-testid="form-validation-test"]',
      '[data-testid="submission-test"]',
      '[data-testid="database-insert-test"]',
      '[data-testid="email-notification-test"]'
    ];

    for (const detail of testDetails) {
      const detailExists = await page.locator(detail).count() > 0;
      if (detailExists) {
        await testHelpers.verifyElementVisible(detail);
      }
    }

    // 验证功能特性说明
    await testHelpers.verifyElementVisible('[data-testid="feature-description"]');

    // 验证流程说明
    await testHelpers.verifyElementVisible('[data-testid="process-description"]');
  });

  test('6.4 导航测试 (/test-nav) - 导航栏功能测试', async ({ page }) => {
    await page.goto('/test-nav');
    await testHelpers.waitForPageLoad();

    // 验证导航测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证导航测试项目
    const navTests = [
      '[data-testid="home-nav-test"]',
      '[data-testid="jobs-nav-test"]',
      '[data-testid="apply-nav-test"]',
      '[data-testid="hr-nav-test"]'
    ];

    for (const test of navTests) {
      const testExists = await page.locator(test).count() > 0;
      if (testExists) {
        await testHelpers.verifyElementVisible(test);
      }
    }

    // 测试导航功能
    const testNavButton = page.locator('button:has-text("测试导航")');
    if (await testNavButton.count() > 0) {
      await testNavButton.click();
      await testHelpers.waitForPageLoad();

      // 验证导航测试结果
      await testHelpers.verifyElementVisible('[data-testid="nav-test-results"]');
    }

    // 验证导航一致性检查
    await testHelpers.verifyElementVisible('[data-testid="nav-consistency-check"]');
  });

  test('6.5 通知测试 (/test-notifications) - 通知系统功能测试', async ({ page }) => {
    await page.goto('/test-notifications');
    await testHelpers.waitForPageLoad();

    // 验证通知测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证通知类型测试
    const notificationTests = [
      '[data-testid="email-notification-test"]',
      '[data-testid="in-app-notification-test"]',
      '[data-testid="push-notification-test"]'
    ];

    for (const test of notificationTests) {
      const testExists = await page.locator(test).count() > 0;
      if (testExists) {
        await testHelpers.verifyElementVisible(test);
      }
    }

    // 验证测试按钮
    const testButtons = [
      'button:has-text("测试邮件通知")',
      'button:has-text("测试站内通知")',
      'button:has-text("测试推送通知")'
    ];

    for (const button of testButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }

    // 测试邮件通知
    const emailTestButton = page.locator('button:has-text("测试邮件通知")');
    if (await emailTestButton.count() > 0) {
      await emailTestButton.click();
      await testHelpers.waitForPageLoad();

      // 验证邮件测试结果
      await testHelpers.verifyElementVisible('[data-testid="email-test-result"]');
    }

    // 测试站内通知
    const inAppTestButton = page.locator('button:has-text("测试站内通知")');
    if (await inAppTestButton.count() > 0) {
      await inAppTestButton.click();
      await testHelpers.waitForPageLoad();

      // 验证站内通知显示
      await testHelpers.verifyElementVisible('[data-testid="notification-popup"]');
    }
  });

  test('6.6 样式测试 (/test-styles) - UI组件和样式测试', async ({ page }) => {
    await page.goto('/test-styles');
    await testHelpers.waitForPageLoad();

    // 验证样式测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证UI组件展示
    const uiComponents = [
      '[data-testid="button-styles"]',
      '[data-testid="form-styles"]',
      '[data-testid="card-styles"]',
      '[data-testid="table-styles"]',
      '[data-testid="modal-styles"]'
    ];

    for (const component of uiComponents) {
      const componentExists = await page.locator(component).count() > 0;
      if (componentExists) {
        await testHelpers.verifyElementVisible(component);
      }
    }

    // 验证颜色主题测试
    await testHelpers.verifyElementVisible('[data-testid="color-theme-test"]');

    // 验证响应式测试
    await testHelpers.verifyElementVisible('[data-testid="responsive-test"]');

    // 测试主题切换
    const themeToggle = page.locator('button:has-text("切换主题")');
    if (await themeToggle.count() > 0) {
      await themeToggle.click();
      await testHelpers.waitForPageLoad();

      // 验证主题变化
      const bodyClass = await page.locator('body').getAttribute('class');
      expect(bodyClass).toContain('dark');
    }

    // 测试组件交互
    const interactiveComponents = page.locator('[data-testid="interactive-component"]');
    if (await interactiveComponents.count() > 0) {
      await interactiveComponents.first().click();
      await testHelpers.waitForPageLoad();
    }
  });

  test('6.7 邮件测试 (/test/email) - 邮件发送功能测试', async ({ page }) => {
    await page.goto('/test/email');
    await testHelpers.waitForPageLoad();

    // 验证邮件测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证邮件模板测试
    const emailTemplates = [
      '[data-testid="welcome-email-template"]',
      '[data-testid="application-confirmation-template"]',
      '[data-testid="interview-invitation-template"]',
      '[data-testid="rejection-email-template"]'
    ];

    for (const template of emailTemplates) {
      const templateExists = await page.locator(template).count() > 0;
      if (templateExists) {
        await testHelpers.verifyElementVisible(template);
      }
    }

    // 验证邮件发送表单
    await testHelpers.verifyElementVisible('form[data-testid="email-test-form"]');

    // 验证表单字段
    const formFields = [
      'input[name="to"]',
      'input[name="subject"]',
      'textarea[name="content"]',
      'select[name="template"]'
    ];

    for (const field of formFields) {
      const fieldExists = await page.locator(field).count() > 0;
      if (fieldExists) {
        await testHelpers.verifyElementVisible(field);
      }
    }

    // 测试邮件发送
    await testHelpers.fillForm({
      'input[name="to"]': 'test@example.com',
      'input[name="subject"]': '测试邮件',
      'textarea[name="content"]': '这是一封测试邮件'
    });

    const sendButton = page.locator('button:has-text("发送测试邮件")');
    if (await sendButton.count() > 0) {
      await sendButton.click();
      await testHelpers.waitForPageLoad();

      // 验证发送结果
      await testHelpers.verifyElementVisible('[data-testid="email-send-result"]');
    }
  });

  test('6.8 实时数据测试 (/test/realtime) - 实时数据更新功能测试', async ({ page }) => {
    await page.goto('/test/realtime');
    await testHelpers.waitForPageLoad();

    // 验证实时数据测试页面
    await testHelpers.verifyElementVisible('main');

    // 验证运行测试按钮
    await testHelpers.verifyElementVisible('button:has-text("运行测试")');

    // 执行实时数据测试
    await testHelpers.clickButtonAndWait('运行测试');

    // 验证测试结果显示
    await testHelpers.verifyElementVisible('[data-testid="test-results"]');

    // 验证测试项目
    const testItems = [
      'text=数据加载状态',
      'text=错误处理',
      'text=招聘统计数据',
      'text=部门统计数据',
      'text=职位数据'
    ];

    for (const item of testItems) {
      await testHelpers.verifyElementVisible(item);
    }

    // 验证成功状态
    await testHelpers.verifyElementVisible('text=success');

    // 验证数据加载完成
    await testHelpers.verifyElementVisible('text=数据加载完成');

    // 验证无错误状态
    await testHelpers.verifyElementVisible('text=无错误');
  });

  test('6.9 数据库调试 (/debug-jobs) - Supabase数据库连接调试', async ({ page }) => {
    await page.goto('/debug-jobs');
    await testHelpers.waitForPageLoad();

    // 验证数据库调试页面
    await testHelpers.verifyElementVisible('main');

    // 页面加载时自动执行数据库连接测试
    await testHelpers.verifyDataLoading();

    // 验证API调用结果显示
    await testHelpers.verifyElementVisible('[data-testid="api-results"]');

    // 验证数据库连接状态
    const connectionStatus = page.locator('[data-testid="connection-status"]');
    if (await connectionStatus.count() > 0) {
      const statusText = await connectionStatus.textContent();
      expect(statusText).toContain('连接');
    }

    // 验证职位数据展示
    await testHelpers.verifyElementVisible('[data-testid="jobs-data"]');

    // 验证错误信息显示（如果有）
    const errorInfo = page.locator('[data-testid="error-info"]');
    if (await errorInfo.count() > 0) {
      await testHelpers.verifyElementVisible('[data-testid="error-info"]');
    }

    // 验证数据库查询结果
    const queryResults = page.locator('[data-testid="query-results"]');
    if (await queryResults.count() > 0) {
      const resultsText = await queryResults.textContent();
      expect(resultsText).toBeTruthy();
    }
  });

  test('6.10 测试页面集成测试', async ({ page }) => {
    // 测试所有测试页面的导航和功能

    const testPages = [
      '/test',
      '/test-api',
      '/test-apply',
      '/test-nav',
      '/test-notifications',
      '/test-styles',
      '/test/email',
      '/test/realtime',
      '/debug-jobs'
    ];

    for (const testPage of testPages) {
      await page.goto(testPage);
      await testHelpers.waitForPageLoad();

      // 验证页面加载
      await testHelpers.verifyElementVisible('main');

      // 验证页面标题或主要内容
      const hasContent = await page.locator('h1, h2, [data-testid="page-title"]').count() > 0;
      expect(hasContent).toBeTruthy();

      // 验证测试功能按钮
      const hasTestButton = await page.locator('button:has-text("测试"), button:has-text("运行")').count() > 0;
      if (hasTestButton) {
        await testHelpers.verifyElementVisible('button:has-text("测试"), button:has-text("运行")');
      }
    }
  });

  test('6.11 性能监控测试', async ({ page }) => {
    // 测试各个测试页面的加载性能

    const testPages = [
      '/test-api',
      '/test/realtime',
      '/debug-jobs'
    ];

    for (const testPage of testPages) {
      const startTime = Date.now();
      await page.goto(testPage);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      // 验证页面在合理时间内加载完成
      expect(loadTime).toBeLessThan(5000);

      // 验证页面功能正常
      await testHelpers.verifyElementVisible('main');
    }
  });

  test('6.12 错误处理和容错测试', async ({ page }) => {
    // 测试网络错误情况下的页面表现

    // 模拟网络错误
    await page.route('**/api/**', route => route.abort());

    await page.goto('/test-api');
    await testHelpers.waitForPageLoad();

    // 验证错误处理
    await testHelpers.verifyErrorHandling();

    // 恢复网络
    await page.unroute('**/api/**');

    // 测试页面恢复
    await page.reload();
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyElementVisible('main');
  });
});
