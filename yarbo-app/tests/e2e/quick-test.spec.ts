import { test, expect } from '@playwright/test';

test('快速测试职位详情页', async ({ page }) => {
  // 直接访问debug页面获取职位ID
  await page.goto('http://localhost:3002/debug-job-ids');
  
  // 等待页面加载
  await page.waitForSelector('a[href*="/job-detail"]', { timeout: 30000 });
  
  // 获取第一个职位链接并点击
  const firstLink = page.locator('a[href*="/job-detail"]').first();
  const href = await firstLink.getAttribute('href');
  console.log('测试职位详情页:', href);
  
  await firstLink.click();
  
  // 等待页面跳转
  await page.waitForURL(/\/job-detail\?id=/);
  
  // 截图保存
  await page.screenshot({ path: 'test-results/job-detail-page.png', fullPage: true });
  
  // 验证页面元素
  const title = await page.locator('h1').first().textContent();
  console.log('职位标题:', title);
  
  // 检查关键元素是否存在
  const hasDescription = await page.locator('text=职位描述').isVisible();
  const hasRequirements = await page.locator('text=职位要求').isVisible();
  const hasBenefits = await page.locator('text=福利待遇').isVisible();
  
  console.log('页面包含职位描述:', hasDescription);
  console.log('页面包含职位要求:', hasRequirements);
  console.log('页面包含福利待遇:', hasBenefits);
  
  // 断言
  expect(title).toBeTruthy();
  expect(hasDescription || hasRequirements || hasBenefits).toBeTruthy();
});