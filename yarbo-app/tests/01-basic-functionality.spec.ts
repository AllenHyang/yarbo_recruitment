import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES } from './utils/test-helpers';
import { HomePage } from './pages/HomePage';

test.describe('基础功能测试 - 根页面和基础功能 (7个页面)', () => {
  let testHelpers: TestHelpers;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    homePage = new HomePage(page);
  });

  test('1.1 首页 (/) - 页面加载和交互元素', async ({ page }) => {
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // 验证页面标题
    await testHelpers.verifyPageTitle('Yarbo 人才招聘');

    // 验证导航栏
    await homePage.verifyNavigation();

    // 验证主要按钮
    await homePage.verifyMainButtons();

    // 测试按钮交互
    await homePage.clickBrowseJobs();
    await testHelpers.verifyURL(/\/jobs/);

    // 返回首页测试其他按钮
    await page.goto('/');
    await homePage.clickQuickApply();
    await testHelpers.verifyURL(/\/apply/);

    // 验证统计数据加载
    await page.goto('/');
    const hasStats = await homePage.verifyStatisticsLoaded();
    expect(hasStats).toBeTruthy();

    // 测试职位类别卡片
    await homePage.clickJobCategory(0);
    await testHelpers.verifyURL(/\/jobs/);

    // 测试响应式设计
    await page.goto('/');
    await homePage.verifyResponsiveDesign();
  });

  test('1.2 仪表板 (/dashboard) - 角色权限控制', async ({ page }) => {
    // 测试未登录访问
    await page.goto(PAGES.DASHBOARD);
    await testHelpers.verifyURL(/\/auth\/login/);

    // 测试HR用户登录后访问
    await testHelpers.loginAsHR();
    await page.goto(PAGES.DASHBOARD);
    
    // 验证HR管理后台链接
    await testHelpers.verifyElementVisible('a[href="/hr/dashboard"]');
    await testHelpers.verifyTextContent('a[href="/hr/dashboard"]', '前往 HR 管理后台');

    // 点击HR管理后台链接
    await page.click('a[href="/hr/dashboard"]');
    await testHelpers.verifyURL(/\/hr\/dashboard/);
  });

  test('1.3 个人资料 (/profile) - 信息管理', async ({ page }) => {
    // 登录后访问个人资料页面
    await testHelpers.loginAsCandidate();
    await page.goto(PAGES.PROFILE);
    await testHelpers.waitForPageLoad();

    // 验证个人信息编辑表单
    await testHelpers.verifyElementVisible('form');
    
    // 验证输入框
    const profileFields = [
      'input[name="name"]',
      'input[name="email"]', 
      'input[name="phone"]'
    ];

    for (const field of profileFields) {
      await testHelpers.verifyElementVisible(field);
    }

    // 验证操作按钮
    await testHelpers.verifyElementVisible('button[type="submit"]');
    
    // 测试表单提交
    await testHelpers.fillForm({
      'input[name="name"]': '测试用户',
      'input[name="phone"]': '13800138000'
    });

    await testHelpers.clickButtonAndWait('保存');
  });

  test('1.4 消息中心 (/messages) - 消息管理', async ({ page }) => {
    await testHelpers.loginAsCandidate();
    await page.goto(PAGES.STATUS);
    await testHelpers.waitForPageLoad();

    // 验证消息列表
    await testHelpers.verifyElementVisible('[data-testid="message-list"]');
    
    // 验证搜索功能
    await testHelpers.verifyElementVisible('input[type="search"]');
    
    // 测试搜索功能
    await page.fill('input[type="search"]', '面试');
    await page.keyboard.press('Enter');
    await testHelpers.waitForPageLoad();

    // 验证操作按钮
    const messageButtons = [
      'button:has-text("标记已读")',
      'button:has-text("删除")'
    ];

    for (const button of messageButtons) {
      const buttonExists = await page.locator(button).count() > 0;
      if (buttonExists) {
        await testHelpers.verifyElementVisible(button);
      }
    }
  });

  test('1.5 申请状态 (/status) - 状态查询', async ({ page }) => {
    await page.goto(PAGES.STATUS);
    await testHelpers.waitForPageLoad();

    // 验证邮箱搜索框
    await testHelpers.verifyElementVisible('input[type="email"]');
    
    // 验证搜索按钮
    await testHelpers.verifyElementVisible('button:has-text("搜索")');

    // 测试申请状态查询
    await page.fill('input[type="email"]', 'test.candidate@gmail.com');
    await testHelpers.clickButtonAndWait('搜索');

    // 验证标签切换
    const tabs = ['概览', '申请', '通知', '推荐'];
    for (const tab of tabs) {
      const tabElement = page.getByRole('tab', { name: tab });
      if (await tabElement.count() > 0) {
        await tabElement.click();
        await testHelpers.waitForPageLoad();
      }
    }

    // 验证申请状态表格
    await testHelpers.verifyElementVisible('table, [data-testid="application-list"]');
    
    // 验证状态徽章
    await testHelpers.verifyElementVisible('[data-testid="status-badge"]');
  });

  test('1.6 系统设置 (/setup) - 系统配置', async ({ page }) => {
    await testHelpers.loginAsAdmin();
    await page.goto(PAGES.HOME + 'setup');
    await testHelpers.waitForPageLoad();

    // 验证系统设置页面加载
    await testHelpers.verifyElementVisible('main');
    
    // 验证配置选项
    const configSections = [
      '[data-testid="database-config"]',
      '[data-testid="email-config"]',
      '[data-testid="system-config"]'
    ];

    for (const section of configSections) {
      const sectionExists = await page.locator(section).count() > 0;
      if (sectionExists) {
        await testHelpers.verifyElementVisible(section);
      }
    }
  });

  test('1.7 未授权页面 (/unauthorized) - 权限提示', async ({ page }) => {
    // 测试未登录用户访问受保护页面
    await page.goto('/hr/dashboard');
    
    // 应该重定向到登录页面或显示未授权页面
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('/auth/login');
    const isUnauthorizedPage = currentUrl.includes('/unauthorized');
    
    expect(isLoginPage || isUnauthorizedPage).toBeTruthy();

    if (isUnauthorizedPage) {
      // 验证未授权页面内容
      await testHelpers.verifyTextContent('main', '权限不足');
      await testHelpers.verifyElementVisible('a[href="/"]');
    }
  });

  test('1.8 综合功能测试 - 页面间导航', async ({ page }) => {
    // 测试完整的用户流程
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // 1. 从首页导航到职位页面
    await homePage.clickBrowseJobs();
    await testHelpers.verifyURL(/\/jobs/);

    // 2. 导航到申请页面
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();

    // 3. 导航到状态查询页面
    await page.goto(PAGES.STATUS);
    await testHelpers.waitForPageLoad();

    // 4. 返回首页
    await page.goto(PAGES.HOME);
    await homePage.verifyPageLoaded();

    // 验证导航一致性
    await homePage.verifyNavigation();
  });

  test('1.9 错误处理和容错机制', async ({ page }) => {
    // 测试网络错误处理
    await page.route('**/api/**', route => route.abort());
    
    await homePage.goto();
    await testHelpers.waitForPageLoad();

    // 验证错误处理
    await testHelpers.verifyErrorHandling();

    // 恢复网络
    await page.unroute('**/api/**');
    
    // 测试页面刷新后恢复
    await page.reload();
    await homePage.verifyPageLoaded();
  });

  test('1.10 性能和加载测试', async ({ page }) => {
    // 测试页面加载性能
    const startTime = Date.now();
    
    await homePage.goto();
    await homePage.verifyPageLoaded();
    
    const loadTime = Date.now() - startTime;
    
    // 验证页面在合理时间内加载完成（5秒内）
    expect(loadTime).toBeLessThan(5000);

    // 验证关键元素加载
    await homePage.verifyNavigation();
    await homePage.verifyMainButtons();
    
    // 测试数据加载
    await testHelpers.verifyDataLoading();
  });
});
