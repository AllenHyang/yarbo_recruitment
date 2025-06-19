import { test, expect } from '@playwright/test';

test.describe('职位详情页测试', () => {
  test('应该能够从职位列表页导航到职位详情页', async ({ page }) => {
    // 1. 访问职位列表页
    await page.goto('/jobs');
    
    // 等待页面加载
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // 2. 查找第一个职位卡片
    const firstJobCard = page.locator('[class*="Card"]').first();
    await expect(firstJobCard).toBeVisible();
    
    // 获取职位标题用于后续验证
    const jobTitle = await firstJobCard.locator('[class*="CardTitle"]').textContent();
    console.log('找到职位:', jobTitle);
    
    // 3. 点击"查看详情"按钮
    const detailButton = firstJobCard.locator('text=查看详情');
    await expect(detailButton).toBeVisible();
    await detailButton.click();
    
    // 4. 等待导航到职位详情页
    await page.waitForURL(/\/job-detail\?id=/);
    
    // 5. 验证职位详情页正确显示
    // 检查标题
    const detailTitle = page.locator('h1').first();
    await expect(detailTitle).toBeVisible();
    await expect(detailTitle).toContainText(jobTitle || '');
    
    // 检查基本信息卡片
    await expect(page.locator('text=基本信息')).toBeVisible();
    await expect(page.locator('text=薪资范围')).toBeVisible();
    
    // 检查职位描述
    await expect(page.locator('text=职位描述')).toBeVisible();
    
    // 检查申请按钮
    const applyButton = page.locator('text=立即申请');
    await expect(applyButton).toBeVisible();
  });

  test('直接访问职位详情页应该正确显示', async ({ page }) => {
    // 先获取一个有效的职位ID
    await page.goto('/debug-job-ids');
    await page.waitForSelector('[href*="/job-detail?id="]', { timeout: 10000 });
    
    // 获取第一个职位详情链接
    const firstJobLink = await page.locator('[href*="/job-detail?id="]').first().getAttribute('href');
    console.log('测试职位详情页:', firstJobLink);
    
    // 直接访问职位详情页
    await page.goto(firstJobLink!);
    
    // 验证页面正确加载
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=职位描述')).toBeVisible();
    await expect(page.locator('text=基本信息')).toBeVisible();
  });

  test('职位详情页应该显示完整信息', async ({ page }) => {
    // 访问测试页面获取一个活跃职位
    await page.goto('/test-job-detail-direct');
    
    // 等待自动跳转
    await page.waitForURL(/\/job-detail\?id=/, { timeout: 5000 });
    
    // 验证所有必要的部分都存在
    const sections = [
      '职位描述',
      '职位要求',
      '福利待遇',
      '基本信息'
    ];
    
    for (const section of sections) {
      await expect(page.locator(`text=${section}`)).toBeVisible();
    }
    
    // 验证侧边栏信息
    await expect(page.locator('text=薪资范围')).toBeVisible();
    await expect(page.locator('text=发布时间')).toBeVisible();
    await expect(page.locator('text=职位状态')).toBeVisible();
    
    // 验证操作按钮
    await expect(page.locator('button:has-text("立即申请"), button:has-text("暂停招聘")')).toBeVisible();
    await expect(page.locator('text=复制链接')).toBeVisible();
    await expect(page.locator('text=分享')).toBeVisible();
  });

  test('职位详情页复制链接功能', async ({ page, context }) => {
    // 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // 访问一个职位详情页
    await page.goto('/test-job-detail-direct');
    await page.waitForURL(/\/job-detail\?id=/, { timeout: 5000 });
    
    // 点击复制链接按钮
    const copyButton = page.locator('text=复制链接');
    await expect(copyButton).toBeVisible();
    
    // 监听对话框
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('链接已复制');
      await dialog.accept();
    });
    
    await copyButton.click();
    
    // 等待对话框出现
    await page.waitForTimeout(1000);
  });

  test('无效职位ID应该显示错误信息', async ({ page }) => {
    // 访问一个无效的职位ID
    await page.goto('/job-detail?id=invalid-job-id-12345');
    
    // 等待错误信息显示
    await expect(page.locator('text=职位未找到')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=返回职位列表')).toBeVisible();
    
    // 点击返回按钮应该导航到职位列表
    await page.locator('text=返回职位列表').click();
    await expect(page).toHaveURL('/jobs');
  });
});