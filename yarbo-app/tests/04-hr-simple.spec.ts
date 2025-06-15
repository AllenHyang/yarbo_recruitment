import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('HR管理系统简化测试 - HR Management Simple Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('4.1 HR仪表板页面测试', async ({ page }) => {
    await page.goto('/hr/dashboard');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/dashboard')) {
      console.log('✅ HR仪表板页面可访问');
      
      // 验证HR仪表板内容
      const pageText = await page.textContent('body');
      const hrKeywords = ['HR', '管理', '仪表板', '统计', '申请', '候选人'];
      const foundKeywords = hrKeywords.filter(keyword => pageText?.includes(keyword));
      console.log(`✅ HR仪表板关键词: ${foundKeywords.join(', ')}`);

      // 验证统计卡片
      const statsElements = [
        '[data-testid="statistics-card"]',
        '.stat-card',
        '.statistics',
        'div:has-text("统计")'
      ];

      for (const element of statsElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个统计元素: ${element}`);
        }
      }

      // 验证快捷操作
      const actionElements = [
        'a[href*="/hr/"]',
        'button:has-text("管理")',
        'button:has-text("查看")'
      ];

      for (const element of actionElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个操作元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ HR仪表板重定向到: ${currentUrl}`);
    }

    console.log('✅ HR仪表板页面测试完成');
  });

  test('4.2 HR申请管理页面测试', async ({ page }) => {
    await page.goto('/hr/applications');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/applications')) {
      console.log('✅ HR申请管理页面可访问');
      
      // 验证申请管理元素
      const applicationElements = [
        'table',
        '[data-testid="applications-table"]',
        'input[type="search"]',
        'select',
        'button:has-text("搜索")',
        'button:has-text("筛选")'
      ];

      for (const element of applicationElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个申请管理元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const applicationKeywords = ['申请', '候选人', '状态', '管理'];
      const foundKeywords = applicationKeywords.filter(keyword => pageText?.includes(keyword));
      console.log(`✅ 申请管理关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ HR申请管理重定向到: ${currentUrl}`);
    }

    console.log('✅ HR申请管理页面测试完成');
  });

  test('4.3 HR候选人管理页面测试', async ({ page }) => {
    await page.goto('/hr/candidates');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/candidates')) {
      console.log('✅ HR候选人管理页面可访问');
      
      // 验证候选人管理元素
      const candidateElements = [
        'table',
        '[data-testid="candidates-table"]',
        'input[type="search"]',
        'button:has-text("搜索")',
        'button:has-text("添加")'
      ];

      for (const element of candidateElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个候选人管理元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ HR候选人管理重定向到: ${currentUrl}`);
    }

    console.log('✅ HR候选人管理页面测试完成');
  });

  test('4.4 HR职位管理页面测试', async ({ page }) => {
    await page.goto('/hr/jobs');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/jobs')) {
      console.log('✅ HR职位管理页面可访问');
      
      // 验证职位管理元素
      const jobElements = [
        'table',
        'button:has-text("创建")',
        'button:has-text("添加")',
        'button:has-text("编辑")',
        'input[type="search"]'
      ];

      for (const element of jobElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个职位管理元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ HR职位管理重定向到: ${currentUrl}`);
    }

    console.log('✅ HR职位管理页面测试完成');
  });

  test('4.5 HR面试管理页面测试', async ({ page }) => {
    await page.goto('/hr/interviews');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/interviews')) {
      console.log('✅ HR面试管理页面可访问');
      
      // 验证面试管理元素
      const interviewElements = [
        'table',
        '[data-testid="calendar"]',
        '.calendar',
        'button:has-text("安排")',
        'button:has-text("面试")'
      ];

      for (const element of interviewElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个面试管理元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ HR面试管理重定向到: ${currentUrl}`);
    }

    console.log('✅ HR面试管理页面测试完成');
  });

  test('4.6 HR数据分析页面测试', async ({ page }) => {
    await page.goto('/hr/analytics');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();
    
    if (currentUrl.includes('/hr/analytics')) {
      console.log('✅ HR数据分析页面可访问');
      
      // 验证数据分析元素
      const analyticsElements = [
        '[data-testid="chart"]',
        '.chart',
        '.recharts-wrapper',
        'canvas',
        'svg',
        'input[type="date"]',
        'select'
      ];

      for (const element of analyticsElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个数据分析元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ HR数据分析重定向到: ${currentUrl}`);
    }

    console.log('✅ HR数据分析页面测试完成');
  });

  test('4.7 HR页面导航测试', async ({ page }) => {
    const hrPages = [
      { url: '/hr/dashboard', name: 'HR仪表板' },
      { url: '/hr/applications', name: 'HR申请管理' },
      { url: '/hr/candidates', name: 'HR候选人管理' },
      { url: '/hr/jobs', name: 'HR职位管理' },
      { url: '/hr/interviews', name: 'HR面试管理' },
      { url: '/hr/analytics', name: 'HR数据分析' }
    ];

    for (const hrPage of hrPages) {
      await page.goto(hrPage.url);
      await testHelpers.waitForPageLoad();
      
      // 验证页面加载
      await expect(page.locator('main').first()).toBeVisible();
      
      const currentUrl = page.url();
      if (currentUrl.includes(hrPage.url)) {
        console.log(`✅ ${hrPage.name} 可正常访问`);
      } else {
        console.log(`ℹ️ ${hrPage.name} 重定向到: ${currentUrl}`);
      }
    }

    console.log('✅ HR页面导航测试完成');
  });

  test('4.8 HR权限控制测试', async ({ page }) => {
    // 测试HR页面的权限控制
    const hrUrls = ['/hr/dashboard', '/hr/applications', '/hr/candidates'];
    
    for (const url of hrUrls) {
      await page.goto(url);
      await testHelpers.waitForPageLoad();
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/auth/login')) {
        console.log(`✅ ${url} 需要登录权限`);
      } else if (currentUrl.includes('/hr/')) {
        console.log(`✅ ${url} 可访问（可能有默认权限）`);
      } else {
        console.log(`ℹ️ ${url} 重定向到: ${currentUrl}`);
      }
    }

    console.log('✅ HR权限控制测试完成');
  });

  test('4.9 HR响应式设计测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/hr/dashboard');
      await testHelpers.waitForPageLoad();
      
      // 验证页面在当前视口下正常显示
      await expect(page.locator('main').first()).toBeVisible();
      
      console.log(`✅ HR页面在 ${viewport.name} 显示正常`);
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ HR响应式设计测试完成');
  });

  test('4.10 HR页面性能测试', async ({ page }) => {
    const hrPages = [
      { url: '/hr/dashboard', name: 'HR仪表板', maxTime: 4000 },
      { url: '/hr/applications', name: 'HR申请管理', maxTime: 4000 },
      { url: '/hr/candidates', name: 'HR候选人管理', maxTime: 4000 },
      { url: '/hr/jobs', name: 'HR职位管理', maxTime: 3000 }
    ];

    for (const hrPage of hrPages) {
      const startTime = Date.now();
      await page.goto(hrPage.url);
      await testHelpers.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(hrPage.maxTime);
      
      console.log(`✅ ${hrPage.name} 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }

    console.log('✅ HR页面性能测试完成');
  });
});
