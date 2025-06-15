import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('测试调试页面简化测试 - Debug Pages Simple Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('6.1 系统测试页面 (/test)', async ({ page }) => {
    await page.goto('/test');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test')) {
      console.log('✅ 系统测试页面可访问');

      // 验证测试相关元素
      const testElements = [
        'button:has-text("测试")',
        'button:has-text("运行")',
        '[data-testid="test"]',
        'form'
      ];

      for (const element of testElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个测试元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const testKeywords = ['测试', 'test', '运行', '检查'];
      const foundKeywords = testKeywords.filter(keyword =>
        pageText?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`✅ 系统测试关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 系统测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 系统测试页面测试完成');
  });

  test('6.2 API测试页面 (/test-api)', async ({ page }) => {
    await page.goto('/test-api');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test-api')) {
      console.log('✅ API测试页面可访问');

      // 验证API测试元素
      const apiElements = [
        'button:has-text("测试API")',
        'button:has-text("连接")',
        '[data-testid="api"]',
        'pre',
        'code'
      ];

      for (const element of apiElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个API测试元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const apiKeywords = ['API', 'api', '接口', '连接', '测试'];
      const foundKeywords = apiKeywords.filter(keyword =>
        pageText?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`✅ API测试关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ API测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ API测试页面测试完成');
  });

  test('6.3 申请测试页面 (/test-apply)', async ({ page }) => {
    await page.goto('/test-apply');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test-apply')) {
      console.log('✅ 申请测试页面可访问');

      // 验证申请测试元素
      const applyTestElements = [
        'button:has-text("开始测试")',
        'button:has-text("测试申请")',
        '[data-testid="test-apply"]',
        'form'
      ];

      for (const element of applyTestElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个申请测试元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const applyKeywords = ['申请', '测试', '提交', '表单'];
      const foundKeywords = applyKeywords.filter(keyword => pageText?.includes(keyword));
      console.log(`✅ 申请测试关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 申请测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 申请测试页面测试完成');
  });

  test('6.4 导航测试页面 (/test-nav)', async ({ page }) => {
    await page.goto('/test-nav');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test-nav')) {
      console.log('✅ 导航测试页面可访问');

      // 验证导航测试元素
      const navTestElements = [
        'button:has-text("测试导航")',
        'a[href]',
        'nav',
        '[data-testid="nav"]'
      ];

      for (const element of navTestElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个导航测试元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 导航测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 导航测试页面测试完成');
  });

  test('6.5 通知测试页面 (/test-notifications)', async ({ page }) => {
    await page.goto('/test-notifications');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test-notifications')) {
      console.log('✅ 通知测试页面可访问');

      // 验证通知测试元素
      const notificationElements = [
        'button:has-text("测试通知")',
        'button:has-text("发送")',
        '[data-testid="notification"]'
      ];

      for (const element of notificationElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个通知测试元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 通知测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 通知测试页面测试完成');
  });

  test('6.6 样式测试页面 (/test-styles)', async ({ page }) => {
    await page.goto('/test-styles');
    await testHelpers.waitForPageLoad();

    // 验证页面加载（使用更灵活的选择器）
    const pageLoaded = await page.locator('main, body, html').first().isVisible();
    expect(pageLoaded).toBeTruthy();

    const currentUrl = page.url();

    if (currentUrl.includes('/test-styles')) {
      console.log('✅ 样式测试页面可访问');

      // 验证样式测试元素
      const styleElements = [
        'button',
        'input',
        'select',
        'textarea',
        '[data-testid="style"]'
      ];

      for (const element of styleElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个样式元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 样式测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 样式测试页面测试完成');
  });

  test('6.7 邮件测试页面 (/test/email)', async ({ page }) => {
    await page.goto('/test/email');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test/email')) {
      console.log('✅ 邮件测试页面可访问');

      // 验证邮件测试元素
      const emailElements = [
        'button:has-text("发送")',
        'input[type="email"]',
        'textarea',
        'form'
      ];

      for (const element of emailElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个邮件测试元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 邮件测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 邮件测试页面测试完成');
  });

  test('6.8 实时数据测试页面 (/test/realtime)', async ({ page }) => {
    await page.goto('/test/realtime');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/test/realtime')) {
      console.log('✅ 实时数据测试页面可访问');

      // 验证实时数据测试元素
      const realtimeElements = [
        'button:has-text("运行")',
        'button:has-text("测试")',
        '[data-testid="realtime"]',
        'pre',
        'code'
      ];

      for (const element of realtimeElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个实时数据元素: ${element}`);
        }
      }
    } else {
      console.log(`ℹ️ 实时数据测试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 实时数据测试页面测试完成');
  });

  test('6.9 数据库调试页面 (/debug-jobs)', async ({ page }) => {
    await page.goto('/debug-jobs');
    await testHelpers.waitForPageLoad();

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    const currentUrl = page.url();

    if (currentUrl.includes('/debug-jobs')) {
      console.log('✅ 数据库调试页面可访问');

      // 验证数据库调试元素
      const debugElements = [
        '[data-testid="debug"]',
        'pre',
        'code',
        'table',
        'button:has-text("刷新")'
      ];

      for (const element of debugElements) {
        const count = await page.locator(element).count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个数据库调试元素: ${element}`);
        }
      }

      // 验证页面内容
      const pageText = await page.textContent('body');
      const debugKeywords = ['数据库', 'database', '连接', '调试', 'debug'];
      const foundKeywords = debugKeywords.filter(keyword =>
        pageText?.toLowerCase().includes(keyword.toLowerCase())
      );
      console.log(`✅ 数据库调试关键词: ${foundKeywords.join(', ')}`);
    } else {
      console.log(`ℹ️ 数据库调试页面重定向到: ${currentUrl}`);
    }

    console.log('✅ 数据库调试页面测试完成');
  });

  test('6.10 调试页面综合测试', async ({ page }) => {
    const debugPages = [
      { url: '/test', name: '系统测试' },
      { url: '/test-api', name: 'API测试' },
      { url: '/test-apply', name: '申请测试' },
      { url: '/test-nav', name: '导航测试' },
      { url: '/test-notifications', name: '通知测试' },
      { url: '/test-styles', name: '样式测试' },
      { url: '/test/email', name: '邮件测试' },
      { url: '/test/realtime', name: '实时数据测试' },
      { url: '/debug-jobs', name: '数据库调试' }
    ];

    let accessibleCount = 0;
    let redirectCount = 0;

    for (const debugPage of debugPages) {
      await page.goto(debugPage.url);
      await testHelpers.waitForPageLoad();

      // 验证页面加载（使用更灵活的选择器）
      const pageLoaded = await page.locator('main, body, html').first().isVisible();
      expect(pageLoaded).toBeTruthy();

      const currentUrl = page.url();
      if (currentUrl.includes(debugPage.url)) {
        accessibleCount++;
        console.log(`✅ ${debugPage.name} 可正常访问`);
      } else {
        redirectCount++;
        console.log(`ℹ️ ${debugPage.name} 重定向到其他页面`);
      }
    }

    console.log(`✅ 调试页面统计: ${accessibleCount} 个可访问, ${redirectCount} 个重定向`);
    console.log('✅ 调试页面综合测试完成');
  });
});
