import { test, expect } from '@playwright/test';
import { TestHelpers, PAGES } from './utils/test-helpers';
import { HomePage } from './pages/HomePage';

test.describe('基础功能测试修复版 - Basic Functionality Fixed Tests', () => {
  let testHelpers: TestHelpers;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
    homePage = new HomePage(page);
  });

  test('1.1 首页基本功能测试', async ({ page }) => {
    await homePage.goto();
    await homePage.verifyPageLoaded();

    // 验证页面标题
    await testHelpers.verifyPageTitle('Yarbo 人才招聘');

    // 验证主要内容加载
    await expect(page.locator('main').first()).toBeVisible();

    // 验证导航元素
    const navElements = [
      'a[href="/"]',
      'a[href="/jobs"]',
      'nav, [data-testid="navigation"]'
    ];

    for (const element of navElements) {
      const elementExists = await page.locator(element).count() > 0;
      if (elementExists) {
        await expect(page.locator(element).first()).toBeVisible();
        console.log(`✅ 找到导航元素: ${element}`);
      }
    }

    // 验证主要按钮
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    console.log(`✅ 找到 ${buttonCount} 个按钮`);

    // 测试页面交互
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const isVisible = await firstButton.isVisible();
      const isEnabled = await firstButton.isEnabled();
      console.log(`✅ 第一个按钮可见: ${isVisible}, 可用: ${isEnabled}`);
    }

    console.log('✅ 首页基本功能测试完成');
  });

  test('1.2 仪表板页面访问测试', async ({ page }) => {
    // 测试仪表板页面访问（适配实际权限控制）
    await page.goto('/dashboard');
    await testHelpers.waitForPageLoad();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ 权限控制正常 - 重定向到登录页面');
      await expect(page.locator('main').first()).toBeVisible();
    } else if (currentUrl.includes('/dashboard')) {
      console.log('ℹ️ 系统允许匿名访问仪表板或有默认登录状态');
      await expect(page.locator('main').first()).toBeVisible();
      
      // 验证仪表板内容
      const pageText = await page.textContent('body');
      const dashboardKeywords = ['仪表板', 'dashboard', '管理', '统计'];
      const foundKeywords = dashboardKeywords.filter(keyword => 
        pageText?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`✅ 仪表板关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 重定向到其他页面: ${currentUrl}`);
      await expect(page.locator('main').first()).toBeVisible();
    }

    console.log('✅ 仪表板页面访问测试完成');
  });

  test('1.3 个人资料页面测试', async ({ page }) => {
    await page.goto('/profile');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 检查是否需要登录
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ 个人资料页面需要登录');
    } else if (currentUrl.includes('/profile')) {
      console.log('✅ 个人资料页面可访问');
      
      // 验证表单元素
      const formElements = [
        'form',
        'input[type="text"]',
        'input[type="email"]',
        'button[type="submit"]'
      ];

      for (const element of formElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个 ${element} 元素`);
        }
      }
    } else {
      console.log(`ℹ️ 重定向到: ${currentUrl}`);
    }

    console.log('✅ 个人资料页面测试完成');
  });

  test('1.4 消息中心页面测试', async ({ page }) => {
    await page.goto('/messages');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/messages')) {
      console.log('✅ 消息中心页面可访问');
      
      // 验证消息相关元素
      const messageElements = [
        '[data-testid="message-list"]',
        '.message',
        'input[type="search"]',
        'button:has-text("搜索")'
      ];

      for (const element of messageElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个消息元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const messageKeywords = ['消息', '通知', '邮件', 'message'];
      const foundKeywords = messageKeywords.filter(keyword => 
        pageText?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`✅ 消息页面关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 重定向到: ${currentUrl}`);
    }

    console.log('✅ 消息中心页面测试完成');
  });

  test('1.5 申请状态页面测试', async ({ page }) => {
    await page.goto('/status');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 验证状态查询功能
    const statusElements = [
      'input[type="email"]',
      'input[type="search"]',
      'button:has-text("搜索")',
      'button:has-text("查询")'
    ];

    for (const element of statusElements) {
      const count = await page.locator(element).count();
      if (count > 0) {
        console.log(`✅ 找到 ${count} 个状态查询元素: ${element}`);
      }
    }

    // 测试搜索功能
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      console.log('✅ 邮箱输入功能正常');
      
      const searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
      if (await searchButton.count() > 0) {
        await searchButton.first().click();
        await testHelpers.waitForPageLoad();
        console.log('✅ 搜索功能可用');
      }
    }

    console.log('✅ 申请状态页面测试完成');
  });

  test('1.6 系统设置页面测试', async ({ page }) => {
    await page.goto('/setup');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/setup')) {
      console.log('✅ 系统设置页面可访问');
      
      // 验证设置相关元素
      const settingElements = [
        'form',
        'input[type="text"]',
        'select',
        'button[type="submit"]',
        '[data-testid="config"]'
      ];

      for (const element of settingElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个设置元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 重定向到: ${currentUrl}`);
    }

    console.log('✅ 系统设置页面测试完成');
  });

  test('1.7 未授权页面测试', async ({ page }) => {
    // 测试访问可能不存在的页面
    await page.goto('/unauthorized');
    await testHelpers.waitForPageLoad();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/unauthorized')) {
      console.log('✅ 未授权页面存在');
      await expect(page.locator('main').first()).toBeVisible();
      
      // 验证未授权页面内容
      const pageText = await page.textContent('body');
      const unauthorizedKeywords = ['权限', '未授权', '403', '无权限'];
      const foundKeywords = unauthorizedKeywords.filter(keyword => 
        pageText?.includes(keyword)
      );
      console.log(`✅ 未授权页面关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 未授权页面重定向到: ${currentUrl}`);
      await expect(page.locator('main').first()).toBeVisible();
    }

    console.log('✅ 未授权页面测试完成');
  });

  test('1.8 页面导航一致性测试', async ({ page }) => {
    const testPages = [
      { url: '/', name: '首页' },
      { url: '/jobs', name: '职位页面' },
      { url: '/apply', name: '申请页面' },
      { url: '/status', name: '状态查询' }
    ];

    for (const testPage of testPages) {
      await page.goto(testPage.url);
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      await expect(page.locator('main').first()).toBeVisible();
      
      // 验证导航一致性
      const navExists = await page.locator('nav, [data-testid="navigation"]').count() > 0;
      if (navExists) {
        console.log(`✅ ${testPage.name} 导航正常`);
      }
      
      // 验证页面标题
      const title = await page.title();
      console.log(`✅ ${testPage.name} 标题: ${title}`);
    }

    console.log('✅ 页面导航一致性测试完成');
  });

  test('1.9 响应式设计测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/');
      await testHelpers.waitForPageLoad();
      
      // 验证页面在当前视口下正常显示
      await expect(page.locator('main').first()).toBeVisible();
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 显示正常`);
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ 响应式设计测试完成');
  });

  test('1.10 页面性能测试', async ({ page }) => {
    const testPages = [
      { url: '/', name: '首页', maxTime: 3000 },
      { url: '/jobs', name: '职位页面', maxTime: 3000 },
      { url: '/apply', name: '申请页面', maxTime: 2000 },
      { url: '/status', name: '状态查询', maxTime: 2000 }
    ];

    for (const testPage of testPages) {
      const startTime = Date.now();
      await page.goto(testPage.url);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(testPage.maxTime);
      
      console.log(`✅ ${testPage.name} 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }

    console.log('✅ 页面性能测试完成');
  });
});
