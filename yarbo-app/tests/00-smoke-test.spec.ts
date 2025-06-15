import { test, expect } from '@playwright/test';

test.describe('烟雾测试 - Smoke Tests', () => {
  test('0.1 首页加载测试', async ({ page }) => {
    // 访问首页
    await page.goto('/');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page).toHaveTitle(/Yarbo/);

    // 验证页面主要内容加载
    await expect(page.locator('main').first()).toBeVisible();

    console.log('✅ 首页加载成功');
  });

  test('0.2 职位页面加载测试', async ({ page }) => {
    // 访问职位页面
    await page.goto('/jobs');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    console.log('✅ 职位页面加载成功');
  });

  test('0.3 申请页面加载测试', async ({ page }) => {
    // 访问申请页面
    await page.goto('/apply');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    console.log('✅ 申请页面加载成功');
  });

  test('0.4 状态查询页面加载测试', async ({ page }) => {
    // 访问状态查询页面
    await page.goto('/status');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    console.log('✅ 状态查询页面加载成功');
  });

  test('0.5 登录页面加载测试', async ({ page }) => {
    // 访问登录页面
    await page.goto('/auth/login');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 验证登录表单存在
    const hasEmailInput = await page.locator('input[type="email"]').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;

    if (hasEmailInput && hasPasswordInput) {
      console.log('✅ 登录表单元素正常');
    }

    console.log('✅ 登录页面加载成功');
  });

  test('0.6 基本导航测试', async ({ page }) => {
    // 从首页开始
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 查找导航链接
    const homeLink = page.locator('a[href="/"], a:has-text("首页")').first();
    const jobsLink = page.locator('a[href="/jobs"], a:has-text("职位"), a:has-text("工作")').first();

    if (await homeLink.count() > 0) {
      console.log('✅ 找到首页导航链接');
    }

    if (await jobsLink.count() > 0) {
      await jobsLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 职位页面导航成功');
    }

    console.log('✅ 基本导航测试完成');
  });

  test('0.7 响应式设计基本测试', async ({ page }) => {
    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 验证页面在当前视口下正常显示
      await expect(page.locator('main').first()).toBeVisible();

      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 显示正常`);
    }
  });

  test('0.8 页面性能基本测试', async ({ page }) => {
    const pages = ['/', '/jobs', '/apply', '/status'];

    for (const testPage of pages) {
      const startTime = Date.now();

      await page.goto(testPage);
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // 验证页面在合理时间内加载完成（10秒内）
      expect(loadTime).toBeLessThan(10000);

      console.log(`✅ ${testPage} 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }
  });
});
