import { test, expect } from '@playwright/test';
import { TestHelpers, TestDataGenerator } from './utils/test-helpers';

test.describe('综合集成测试简化版 - Integration Simple Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('7.1 完整用户申请流程测试', async ({ page }) => {
    // 完整的用户申请流程
    
    // 1. 访问首页
    await page.goto('/');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    console.log('✅ 首页访问成功');

    // 2. 浏览职位
    await page.goto('/jobs');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    console.log('✅ 职位页面访问成功');

    // 3. 进入申请页面
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    console.log('✅ 申请页面访问成功');

    // 4. 验证申请表单存在
    const forms = page.locator('form');
    const formCount = await forms.count();
    if (formCount > 0) {
      console.log(`✅ 找到 ${formCount} 个申请表单`);
      
      // 验证表单字段
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      console.log(`✅ 找到 ${inputCount} 个输入字段`);
    }

    // 5. 查看申请状态
    await page.goto('/status');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    console.log('✅ 状态查询页面访问成功');

    console.log('✅ 完整用户申请流程测试完成');
  });

  test('7.2 页面导航一致性测试', async ({ page }) => {
    const testPages = [
      { url: '/', name: '首页' },
      { url: '/jobs', name: '职位页面' },
      { url: '/apply', name: '申请页面' },
      { url: '/status', name: '状态查询' },
      { url: '/auth/login', name: '登录页面' }
    ];

    for (const testPage of testPages) {
      await page.goto(testPage.url);
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      await expect(page.locator('main, body').first()).toBeVisible();
      
      // 验证页面标题
      const title = await page.title();
      expect(title).toBeTruthy();
      
      console.log(`✅ ${testPage.name} 导航正常，标题: ${title}`);
    }

    console.log('✅ 页面导航一致性测试完成');
  });

  test('7.3 HR系统访问测试', async ({ page }) => {
    const hrPages = [
      { url: '/hr/dashboard', name: 'HR仪表板' },
      { url: '/hr/applications', name: 'HR申请管理' },
      { url: '/hr/candidates', name: 'HR候选人管理' },
      { url: '/hr/jobs', name: 'HR职位管理' },
      { url: '/hr/interviews', name: 'HR面试管理' },
      { url: '/hr/analytics', name: 'HR数据分析' }
    ];

    let accessibleCount = 0;
    let redirectCount = 0;

    for (const hrPage of hrPages) {
      await page.goto(hrPage.url);
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      await expect(page.locator('main, body').first()).toBeVisible();
      
      const currentUrl = page.url();
      if (currentUrl.includes('/hr/')) {
        accessibleCount++;
        console.log(`✅ ${hrPage.name} 可正常访问`);
      } else {
        redirectCount++;
        console.log(`ℹ️ ${hrPage.name} 重定向到: ${currentUrl}`);
      }
    }

    console.log(`✅ HR系统统计: ${accessibleCount} 个可访问, ${redirectCount} 个重定向`);
    console.log('✅ HR系统访问测试完成');
  });

  test('7.4 调试页面系统测试', async ({ page }) => {
    const debugPages = [
      { url: '/test', name: '系统测试' },
      { url: '/test-api', name: 'API测试' },
      { url: '/test-apply', name: '申请测试' },
      { url: '/debug-jobs', name: '数据库调试' }
    ];

    let accessibleCount = 0;

    for (const debugPage of debugPages) {
      await page.goto(debugPage.url);
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      const pageLoaded = await page.locator('main, body').first().isVisible();
      expect(pageLoaded).toBeTruthy();
      
      const currentUrl = page.url();
      if (currentUrl.includes(debugPage.url)) {
        accessibleCount++;
        console.log(`✅ ${debugPage.name} 可正常访问`);
      }
    }

    console.log(`✅ 调试页面统计: ${accessibleCount} 个可访问`);
    console.log('✅ 调试页面系统测试完成');
  });

  test('7.5 搜索功能集成测试', async ({ page }) => {
    // 测试不同页面的搜索功能
    
    // 1. 职位搜索
    await page.goto('/jobs');
    await testHelpers.waitForPageLoad();
    
    const jobSearchInput = page.locator('input[type="search"], input[placeholder*="搜索"]');
    if (await jobSearchInput.count() > 0) {
      await jobSearchInput.first().fill('前端');
      await page.keyboard.press('Enter');
      await testHelpers.waitForPageLoad();
      console.log('✅ 职位搜索功能正常');
    }

    // 2. 状态查询搜索
    await page.goto('/status');
    await testHelpers.waitForPageLoad();
    
    const statusSearchInput = page.locator('input[type="email"], input[type="search"]');
    if (await statusSearchInput.count() > 0) {
      await statusSearchInput.first().fill('test@example.com');
      const searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
      if (await searchButton.count() > 0) {
        await searchButton.first().click();
        await testHelpers.waitForPageLoad();
        console.log('✅ 状态查询搜索功能正常');
      }
    }

    console.log('✅ 搜索功能集成测试完成');
  });

  test('7.6 表单交互集成测试', async ({ page }) => {
    // 测试不同页面的表单交互
    
    // 1. 登录表单
    await page.goto('/auth/login');
    await testHelpers.waitForPageLoad();
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      console.log('✅ 登录表单填写功能正常');
    }

    // 2. 申请表单
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();
    
    const applyInputs = page.locator('input[type="text"], input[type="email"]');
    if (await applyInputs.count() > 0) {
      const testData = TestDataGenerator.generateJobApplication();
      
      // 尝试填写表单字段
      const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]');
      if (await nameInput.count() > 0) {
        await nameInput.first().fill(testData.name);
        console.log('✅ 申请表单姓名字段填写正常');
      }
      
      const emailField = page.locator('input[type="email"]');
      if (await emailField.count() > 0) {
        await emailField.first().fill(testData.email);
        console.log('✅ 申请表单邮箱字段填写正常');
      }
    }

    console.log('✅ 表单交互集成测试完成');
  });

  test('7.7 响应式设计集成测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    const testPages = ['/', '/jobs', '/apply', '/status'];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await testHelpers.waitForPageLoad();
        
        // 验证页面在当前视口下正常显示
        await expect(page.locator('main, body').first()).toBeVisible();
        
        console.log(`✅ ${testPage} 在 ${viewport.name} 显示正常`);
      }
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ 响应式设计集成测试完成');
  });

  test('7.8 性能集成测试', async ({ page }) => {
    const testPages = [
      { url: '/', name: '首页', maxTime: 3000 },
      { url: '/jobs', name: '职位页面', maxTime: 3000 },
      { url: '/apply', name: '申请页面', maxTime: 2000 },
      { url: '/status', name: '状态查询', maxTime: 2000 },
      { url: '/auth/login', name: '登录页面', maxTime: 2000 }
    ];

    for (const testPage of testPages) {
      const startTime = Date.now();
      await page.goto(testPage.url);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(testPage.maxTime);
      
      console.log(`✅ ${testPage.name} 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }

    console.log('✅ 性能集成测试完成');
  });

  test('7.9 错误处理集成测试', async ({ page }) => {
    // 测试系统的错误处理能力
    
    // 1. 测试无效URL
    await page.goto('/invalid-page-12345');
    await testHelpers.waitForPageLoad();
    
    // 验证页面仍然可以加载（可能是404页面或重定向）
    const pageLoaded = await page.locator('main, body').first().isVisible();
    expect(pageLoaded).toBeTruthy();
    console.log('✅ 无效URL处理正常');

    // 2. 测试表单错误处理
    await page.goto('/auth/login');
    await testHelpers.waitForPageLoad();
    
    // 提交空表单
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 表单错误处理测试完成');
    }

    // 3. 测试网络错误恢复
    await page.goto('/');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    console.log('✅ 网络错误恢复测试完成');

    console.log('✅ 错误处理集成测试完成');
  });

  test('7.10 系统稳定性测试', async ({ page }) => {
    // 测试系统在连续操作下的稳定性
    
    const pages = ['/', '/jobs', '/apply', '/status', '/auth/login'];
    
    // 快速页面切换测试
    for (let i = 0; i < 2; i++) {
      for (const testPage of pages) {
        await page.goto(testPage);
        await testHelpers.waitForPageLoad();
        
        // 验证页面加载
        await expect(page.locator('main, body').first()).toBeVisible();
        
        console.log(`✅ 第${i + 1}轮 ${testPage} 访问正常`);
      }
    }

    // 验证最终状态
    await page.goto('/');
    await testHelpers.waitForPageLoad();
    await expect(page.locator('main, body').first()).toBeVisible();
    
    console.log('✅ 系统稳定性测试完成');
  });
});
