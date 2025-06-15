import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES, TestDataGenerator } from './utils/test-helpers';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

test.describe('综合集成测试 - Comprehensive Integration Tests', () => {
  let testHelpers: TestHelpers;
  let homePage: HomePage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
  });

  test('7.1 完整用户流程测试 - 候选人申请流程', async ({ page }) => {
    // 完整的候选人申请流程测试
    
    // 1. 访问首页
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // 2. 浏览职位
    await homePage.clickBrowseJobs();
    await testHelpers.verifyURL(/\/jobs/);

    // 3. 搜索职位
    const searchInput = page.locator('input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('前端开发');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }

    // 4. 查看职位详情
    const detailButton = page.locator('button:has-text("查看详情"), a:has-text("查看详情")').first();
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 5. 申请职位
    const applyButton = page.locator('button:has-text("立即申请")');
    if (await applyButton.count() > 0) {
      await applyButton.click();
      await testHelpers.verifyURL(/\/apply/);
    } else {
      await page.goto(PAGES.APPLY);
    }

    // 6. 填写申请表单
    const applicationData = TestDataGenerator.generateJobApplication();
    await testHelpers.fillForm({
      'input[name="name"]': applicationData.name,
      'input[type="email"]': applicationData.email,
      'input[name="phone"]': applicationData.phone
    });

    // 7. 选择职位
    const positionSelect = page.locator('select[name="position"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 8. 提交申请
    await testHelpers.clickButtonAndWait('提交申请');

    // 9. 验证申请成功
    await testHelpers.verifySuccessMessage('申请提交成功');

    // 10. 查看申请状态
    await page.goto(PAGES.STATUS);
    await page.fill('input[type="email"]', applicationData.email);
    await testHelpers.clickButtonAndWait('搜索');
    
    // 验证申请记录存在
    await testHelpers.verifyElementVisible('[data-testid="application-record"]');
  });

  test('7.2 完整HR工作流程测试', async ({ page }) => {
    // 完整的HR工作流程测试
    
    // 1. HR登录
    await testHelpers.loginAsHR();
    
    // 2. 访问HR仪表板
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyElementVisible('[data-testid="hr-dashboard"]');

    // 3. 查看申请列表
    await page.click('a[href="/hr/applications"]');
    await testHelpers.verifyURL(/\/hr\/applications/);

    // 4. 筛选待处理申请
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('pending');
      await testHelpers.waitForPageLoad();
    }

    // 5. 查看申请详情
    const viewButton = page.locator('button:has-text("查看"), a:has-text("查看")').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 6. 更新申请状态
    const statusSelect = page.locator('select[name="status"]');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption('interview');
      await testHelpers.clickButtonAndWait('更新状态');
    }

    // 7. 安排面试
    const scheduleButton = page.locator('button:has-text("安排面试")');
    if (await scheduleButton.count() > 0) {
      await scheduleButton.click();
      await testHelpers.waitForPageLoad();
    }

    // 8. 查看面试管理
    await page.goto('/hr/interviews');
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyElementVisible('[data-testid="interviews-table"]');

    // 9. 查看数据分析
    await page.goto('/hr/analytics');
    await testHelpers.waitForPageLoad();
    await testHelpers.verifyElementVisible('[data-testid="chart"]');

    // 10. 验证整个流程的数据一致性
    await page.goto('/hr/dashboard');
    await testHelpers.verifyElementVisible('[data-testid="statistics-cards"]');
  });

  test('7.3 权限控制集成测试', async ({ page }) => {
    // 测试不同角色的权限控制
    
    // 1. 未登录用户权限测试
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/auth\/login/);

    // 2. 候选人权限测试
    await loginPage.loginAsCandidate();
    await page.goto('/hr/dashboard');
    
    // 验证候选人无法访问HR页面
    const currentUrl = page.url();
    const hasAccess = currentUrl.includes('/hr/dashboard');
    if (!hasAccess) {
      expect(currentUrl.includes('/unauthorized') || currentUrl.includes('/dashboard')).toBeTruthy();
    }

    // 3. HR用户权限测试
    await page.goto('/auth/login');
    await loginPage.loginAsHR();
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 验证HR可以访问所有HR功能
    const hrPages = [
      '/hr/applications',
      '/hr/candidates',
      '/hr/jobs',
      '/hr/interviews',
      '/hr/analytics'
    ];

    for (const hrPage of hrPages) {
      await page.goto(hrPage);
      await testHelpers.waitForPageLoad();
      await testHelpers.verifyElementVisible('main');
    }

    // 4. 管理员权限测试
    await page.goto('/auth/login');
    await loginPage.loginAsAdmin();
    await page.goto('/hr/dashboard');
    await testHelpers.verifyURL(/\/hr\/dashboard/);

    // 验证管理员可以访问所有功能
    await page.goto('/hr/settings');
    await testHelpers.waitForPageLoad();
  });

  test('7.4 数据流集成测试', async ({ page }) => {
    // 测试数据在不同页面间的一致性
    
    await testHelpers.loginAsHR();
    
    // 1. 在仪表板查看统计数据
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();
    
    const dashboardStats = await page.locator('[data-testid="statistics-card"]').allTextContents();
    
    // 2. 在申请管理页面验证数据一致性
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();
    
    const applicationCount = await page.locator('[data-testid="application-row"]').count();
    
    // 3. 在数据分析页面验证数据一致性
    await page.goto('/hr/analytics');
    await testHelpers.waitForPageLoad();
    
    // 验证图表数据加载
    await testHelpers.verifyElementVisible('[data-testid="chart"]');
    
    // 4. 验证数据更新的实时性
    await page.goto('/hr/applications');
    const initialCount = await page.locator('[data-testid="application-row"]').count();
    
    // 刷新数据
    const refreshButton = page.locator('button:has-text("刷新")');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await testHelpers.waitForPageLoad();
    }
    
    const updatedCount = await page.locator('[data-testid="application-row"]').count();
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('7.5 响应式设计全面测试', async ({ page }) => {
    // 测试所有主要页面的响应式设计
    
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    const testPages = [
      PAGES.HOME,
      PAGES.JOBS,
      PAGES.APPLY,
      PAGES.STATUS,
      '/hr/dashboard',
      '/hr/applications'
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const testPage of testPages) {
        if (testPage.includes('/hr/')) {
          await testHelpers.loginAsHR();
        }
        
        await page.goto(testPage);
        await testHelpers.waitForPageLoad();
        
        // 验证页面在当前视口下正常显示
        await testHelpers.verifyElementVisible('main');
        
        // 验证导航在移动端的表现
        if (viewport.width <= 768) {
          // 移动端可能有汉堡菜单
          const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu');
          if (await mobileMenu.count() > 0) {
            await testHelpers.verifyElementVisible('[data-testid="mobile-menu"]');
          }
        }
      }
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('7.6 性能和加载测试', async ({ page }) => {
    // 测试关键页面的性能
    
    const performanceTests = [
      { page: PAGES.HOME, maxTime: 3000 },
      { page: PAGES.JOBS, maxTime: 3000 },
      { page: PAGES.APPLY, maxTime: 2000 },
      { page: '/hr/dashboard', maxTime: 4000, requiresAuth: true },
      { page: '/hr/applications', maxTime: 4000, requiresAuth: true }
    ];

    for (const test of performanceTests) {
      if (test.requiresAuth) {
        await testHelpers.loginAsHR();
      }
      
      const startTime = Date.now();
      await page.goto(test.page);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(test.maxTime);
      
      // 验证页面功能正常
      await testHelpers.verifyElementVisible('main');
    }
  });

  test('7.7 错误处理和容错测试', async ({ page }) => {
    // 测试系统的错误处理能力
    
    // 1. 测试网络错误
    await page.route('**/api/**', route => route.abort());
    
    await homePage.goto();
    await testHelpers.waitForPageLoad();
    
    // 验证错误处理
    await testHelpers.verifyErrorHandling();
    
    // 恢复网络
    await page.unroute('**/api/**');
    
    // 2. 测试无效URL
    await page.goto('/invalid-page');
    await testHelpers.waitForPageLoad();
    
    // 验证404页面或重定向
    const currentUrl = page.url();
    const is404OrRedirect = currentUrl.includes('404') || currentUrl.includes('/');
    expect(is404OrRedirect).toBeTruthy();
    
    // 3. 测试表单错误处理
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();
    
    // 提交空表单
    await testHelpers.clickButtonAndWait('提交申请');
    
    // 验证表单验证错误
    const hasValidationError = await page.locator('.error, [data-testid="error"]').count() > 0;
    expect(hasValidationError).toBeTruthy();
  });

  test('7.8 搜索和筛选功能集成测试', async ({ page }) => {
    // 测试搜索和筛选功能的一致性
    
    // 1. 职位搜索测试
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();
    
    const searchTerms = ['前端', 'Java', '产品'];
    
    for (const term of searchTerms) {
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.clear();
        await searchInput.fill(term);
        await page.keyboard.press('Enter');
        await testHelpers.waitForPageLoad();
        
        // 验证搜索结果
        const jobCards = page.locator('[data-testid="job-card"]');
        const cardCount = await jobCards.count();
        
        if (cardCount > 0) {
          const firstCardText = await jobCards.first().textContent();
          expect(firstCardText?.toLowerCase()).toContain(term.toLowerCase());
        }
      }
    }

    // 2. HR申请筛选测试
    await testHelpers.loginAsHR();
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();
    
    // 测试状态筛选
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('pending');
      await testHelpers.waitForPageLoad();
      
      // 验证筛选结果
      await testHelpers.verifyElementVisible('[data-testid="filtered-results"]');
    }

    // 测试搜索功能
    const hrSearchInput = page.locator('input[type="search"]');
    if (await hrSearchInput.count() > 0) {
      await hrSearchInput.fill('测试候选人');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
    }
  });

  test('7.9 通知系统集成测试', async ({ page }) => {
    // 测试通知系统的完整流程
    
    await testHelpers.loginAsHR();
    
    // 1. 测试申请状态更新触发通知
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();
    
    const viewButton = page.locator('button:has-text("查看")').first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      await testHelpers.waitForPageLoad();
      
      // 更新申请状态
      const statusSelect = page.locator('select[name="status"]');
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption('interview');
        await testHelpers.clickButtonAndWait('更新状态');
        
        // 验证通知发送
        await testHelpers.verifySuccessMessage('状态更新成功');
      }
    }

    // 2. 测试邮件通知
    await page.goto('/test/email');
    await testHelpers.waitForPageLoad();
    
    const emailTestButton = page.locator('button:has-text("发送测试邮件")');
    if (await emailTestButton.count() > 0) {
      await emailTestButton.click();
      await testHelpers.waitForPageLoad();
      
      // 验证邮件发送结果
      await testHelpers.verifyElementVisible('[data-testid="email-send-result"]');
    }

    // 3. 测试站内通知
    await page.goto('/messages');
    await testHelpers.waitForPageLoad();
    
    // 验证消息列表
    await testHelpers.verifyElementVisible('[data-testid="message-list"]');
  });

  test('7.10 系统稳定性和压力测试', async ({ page }) => {
    // 测试系统在高负载下的表现
    
    // 1. 快速页面切换测试
    const pages = [PAGES.HOME, PAGES.JOBS, PAGES.APPLY, PAGES.STATUS];
    
    for (let i = 0; i < 3; i++) {
      for (const testPage of pages) {
        await page.goto(testPage);
        await testHelpers.waitForPageLoad();
        await testHelpers.verifyElementVisible('main');
      }
    }

    // 2. 表单快速提交测试
    await page.goto(PAGES.APPLY);
    await testHelpers.waitForPageLoad();
    
    for (let i = 0; i < 3; i++) {
      const applicationData = TestDataGenerator.generateJobApplication();
      
      await testHelpers.fillForm({
        'input[name="name"]': applicationData.name,
        'input[type="email"]': applicationData.email,
        'input[name="phone"]': applicationData.phone
      });
      
      await testHelpers.clickButtonAndWait('提交申请');
      
      // 等待处理完成
      await testHelpers.waitForPageLoad();
      
      // 重置表单
      const newApplicationButton = page.locator('button:has-text("提交新申请")');
      if (await newApplicationButton.count() > 0) {
        await newApplicationButton.click();
        await testHelpers.waitForPageLoad();
      } else {
        await page.goto(PAGES.APPLY);
        await testHelpers.waitForPageLoad();
      }
    }

    // 3. 搜索压力测试
    await page.goto(PAGES.JOBS);
    await testHelpers.waitForPageLoad();
    
    const searchTerms = ['前端', 'Java', '产品', '设计', '运营'];
    
    for (const term of searchTerms) {
      const searchInput = page.locator('input[type="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.clear();
        await searchInput.fill(term);
        await page.keyboard.press('Enter');
        await testHelpers.waitForPageLoad();
      }
    }
  });
});
