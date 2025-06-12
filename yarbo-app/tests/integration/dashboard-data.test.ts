import { test, expect } from '@playwright/test';

test.describe('HR Dashboard Data Integration', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页面
    await page.goto('/auth/login');
    
    // 使用HR演示账号登录
    await page.fill('input[type="email"]', 'hr@yarbo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待重定向到HR仪表板
    await page.waitForURL('/hr/dashboard');
  });

  test('should load dashboard with real data', async ({ page }) => {
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('HR管理中心');
    
    // 检查统计卡片是否加载
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4);
    
    // 检查是否有加载状态
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeHidden();
    
    // 检查统计数据是否显示
    await expect(page.locator('text=待处理申请')).toBeVisible();
    await expect(page.locator('text=本月收到')).toBeVisible();
    await expect(page.locator('text=已通过面试')).toBeVisible();
    await expect(page.locator('text=本月录用')).toBeVisible();
  });

  test('should refresh data when refresh button is clicked', async ({ page }) => {
    // 等待初始数据加载完成
    await page.waitForSelector('[data-testid="stats-card"]');
    
    // 点击刷新按钮
    const refreshButton = page.locator('button:has-text("刷新数据")');
    await refreshButton.click();
    
    // 检查是否显示刷新状态
    await expect(page.locator('text=刷新中')).toBeVisible();
    
    // 等待刷新完成
    await expect(page.locator('text=刷新中')).toBeHidden();
    
    // 检查是否显示成功通知
    await expect(page.locator('text=数据刷新成功')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // 模拟网络错误
    await page.route('/api/hr/dashboard/stats', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // 刷新页面触发错误
    await page.reload();
    
    // 检查错误提示是否显示
    await expect(page.locator('text=加载统计数据失败')).toBeVisible();
    
    // 检查重试按钮是否可用
    const retryButton = page.locator('button:has-text("重试")');
    await expect(retryButton).toBeVisible();
  });

  test('should navigate to different sections', async ({ page }) => {
    // 测试导航到申请管理
    await page.click('text=申请管理');
    await page.waitForURL('/hr/applications');
    await expect(page.locator('h1')).toContainText('申请管理');
    
    // 返回仪表板
    await page.click('text=仪表板');
    await page.waitForURL('/hr/dashboard');
    
    // 测试导航到候选人管理
    await page.click('text=候选人管理');
    await page.waitForURL('/hr/candidates');
    await expect(page.locator('h1')).toContainText('候选人管理');
  });

  test('should display user profile information', async ({ page }) => {
    // 检查用户头像和信息是否显示
    const userProfile = page.locator('[data-testid="user-profile"]');
    await expect(userProfile).toBeVisible();
    
    // 检查用户角色是否正确显示
    await expect(page.locator('text=HR专员')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    // 直接访问HR仪表板
    await page.goto('/hr/dashboard');
    
    // 应该重定向到登录页面
    await page.waitForURL('/auth/login');
    await expect(page.locator('h1')).toContainText('欢迎回来');
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 点击忘记密码链接
    await page.click('text=忘记密码？');
    await page.waitForURL('/auth/forgot-password');
    
    // 检查忘记密码页面
    await expect(page.locator('h1')).toContainText('重置密码');
    
    // 输入邮箱
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("发送重置邮件")');
    
    // 检查成功消息
    await expect(page.locator('text=邮件已发送')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'hr@yarbo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/hr/dashboard');
    
    // 点击用户菜单
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.click();
    
    // 点击退出登录
    await page.click('text=退出登录');
    
    // 应该重定向到登录页面
    await page.waitForURL('/auth/login');
    await expect(page.locator('h1')).toContainText('欢迎回来');
  });
});
