import { test, expect } from '@playwright/test';

test.describe('基础功能测试', () => {
  test('首页应该正确加载', async ({ page }) => {
    await page.goto('/');
    
    // 检查页面标题
    await expect(page.locator('h1')).toContainText('开启你的职业新征程');
    
    // 检查主要导航元素
    await expect(page.locator('text=浏览职位')).toBeVisible();
  });

  test('职位列表页应该显示职位', async ({ page }) => {
    await page.goto('/jobs');
    
    // 等待职位卡片加载
    await page.waitForSelector('[class*="Card"]', { timeout: 10000 });
    
    // 检查至少有一个职位
    const jobCards = page.locator('[class*="Card"]');
    await expect(jobCards).toHaveCount(await jobCards.count());
    expect(await jobCards.count()).toBeGreaterThan(0);
    
    // 检查职位卡片包含必要信息
    const firstCard = jobCards.first();
    await expect(firstCard.locator('[class*="CardTitle"]')).toBeVisible();
    await expect(firstCard.locator('text=查看详情')).toBeVisible();
  });

  test('导航功能应该正常工作', async ({ page }) => {
    await page.goto('/');
    
    // 点击浏览职位按钮
    await page.locator('text=浏览职位').first().click();
    
    // 应该导航到职位列表页
    await expect(page).toHaveURL('/jobs');
    
    // 返回首页
    await page.locator('text=Yarbo').first().click();
    await expect(page).toHaveURL('/');
  });
});