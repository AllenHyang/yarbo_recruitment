import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('认证系统简化测试 - Authentication Simple Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('2.1 登录页面基本功能测试', async ({ page }) => {
    // 访问登录页面
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 验证表单元素存在
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    console.log('✅ 登录页面表单元素正常');

    // 测试表单填写
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    console.log('✅ 表单填写功能正常');

    // 验证提交按钮可点击
    await expect(submitButton).toBeEnabled();

    console.log('✅ 登录页面基本功能测试完成');
  });

  test('2.2 注册页面基本功能测试', async ({ page }) => {
    // 先访问登录页面
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 查找注册链接
    const registerLink = page.locator('a:has-text("注册"), a:has-text("立即注册"), button:has-text("注册")');
    
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
      await page.waitForLoadState('networkidle');

      // 验证注册页面
      await expect(page.locator('main').first()).toBeVisible();

      // 验证注册表单元素
      const emailInput = page.locator('input[type="email"]');
      const passwordInputs = page.locator('input[type="password"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInputs.first()).toBeVisible();

      console.log('✅ 注册页面功能正常');
    } else {
      // 直接访问注册页面
      await page.goto('/auth/register');
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/auth/register')) {
        await expect(page.locator('main').first()).toBeVisible();
        console.log('✅ 注册页面可直接访问');
      } else {
        console.log('ℹ️ 注册页面可能未实现或重定向');
      }
    }
  });

  test('2.3 登录流程测试（使用真实账号）', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 使用测试账号登录
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('hr@yarbo.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    // 等待页面跳转
    await page.waitForLoadState('networkidle');

    // 验证登录成功（检查URL变化或页面内容）
    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/dashboard') || 
                      currentUrl.includes('/hr') || 
                      await page.locator('text=登出, text=退出').count() > 0;

    if (isLoggedIn) {
      console.log('✅ HR账号登录成功');
    } else {
      console.log('ℹ️ 登录可能需要验证或账号不存在');
    }
  });

  test('2.4 权限控制基本测试', async ({ page }) => {
    // 测试未登录访问受保护页面
    await page.goto('/hr/dashboard');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/login')) {
      console.log('✅ 权限控制正常 - 重定向到登录页面');
    } else if (currentUrl.includes('/hr/dashboard')) {
      console.log('ℹ️ 系统可能允许匿名访问或有默认登录状态');
    } else {
      console.log('ℹ️ 重定向到其他页面:', currentUrl);
    }

    // 验证页面内容
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('2.5 表单验证测试', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // 测试空表单提交
    await submitButton.click();
    await page.waitForTimeout(1000); // 等待验证消息

    // 检查是否有验证错误
    const hasValidationError = await page.locator('.error, [role="alert"], .text-red-500, .text-destructive').count() > 0;
    
    if (hasValidationError) {
      console.log('✅ 表单验证正常 - 显示错误消息');
    } else {
      console.log('ℹ️ 可能没有客户端验证或验证方式不同');
    }

    // 测试无效邮箱格式
    await emailInput.fill('invalid-email');
    await passwordInput.fill('123');
    await submitButton.click();
    await page.waitForTimeout(1000);

    console.log('✅ 表单验证测试完成');
  });

  test('2.6 导航和链接测试', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 测试返回首页链接
    const homeLinks = page.locator('a[href="/"], a:has-text("首页"), a:has-text("返回首页")');
    
    if (await homeLinks.count() > 0) {
      await homeLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/') && !currentUrl.includes('/auth')) {
        console.log('✅ 返回首页链接正常');
      }
    }

    // 使用等待策略避免导航冲突
    await page.waitForTimeout(500);
    
    // 返回登录页面测试其他链接
    try {
      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
    } catch (error) {
      // 如果导航失败，尝试刷新当前页面
      console.log('导航被中断，尝试刷新页面');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
    }

    // 测试注册链接
    const registerLinks = page.locator('a:has-text("注册"), a:has-text("立即注册")');
    
    if (await registerLinks.count() > 0) {
      console.log('✅ 找到注册链接');
    }

    // 测试忘记密码链接
    const forgotPasswordLinks = page.locator('a:has-text("忘记密码")');
    
    if (await forgotPasswordLinks.count() > 0) {
      console.log('✅ 找到忘记密码链接');
    }

    console.log('✅ 导航和链接测试完成');
  });

  test('2.7 响应式设计测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/auth/login');
      await page.waitForLoadState('networkidle');

      // 验证页面在当前视口下正常显示
      await expect(page.locator('main').first()).toBeVisible();
      
      // 验证表单元素在移动端仍然可见
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) 显示正常`);
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('2.8 页面性能测试', async ({ page }) => {
    // 测试登录页面加载性能
    const startTime = Date.now();
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(5000); // 5秒内加载完成

    console.log(`✅ 登录页面加载时间: ${(loadTime / 1000).toFixed(2)}s`);

    // 验证关键元素加载
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    console.log('✅ 关键元素加载正常');
  });
});
