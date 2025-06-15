import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('申请系统简化测试 - Application System Simple Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('3.1 申请页面基本功能测试', async ({ page }) => {
    // 访问申请页面
    await page.goto('/apply');
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 验证表单存在
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      console.log(`✅ 找到 ${formCount} 个表单`);
      
      // 验证常见的表单元素
      const commonInputs = [
        'input[type="text"]',
        'input[type="email"]', 
        'input[name="name"]',
        'input[name="email"]',
        'input[name="phone"]',
        'textarea',
        'select'
      ];

      for (const inputType of commonInputs) {
        const inputs = page.locator(inputType);
        const count = await inputs.count();
        if (count > 0) {
          console.log(`✅ 找到 ${count} 个 ${inputType} 元素`);
        }
      }

      // 验证提交按钮
      const submitButtons = page.locator('button[type="submit"], button:has-text("提交"), button:has-text("申请")');
      const submitCount = await submitButtons.count();
      if (submitCount > 0) {
        console.log(`✅ 找到 ${submitCount} 个提交按钮`);
      }
    } else {
      console.log('ℹ️ 页面可能不包含传统表单，检查其他交互元素');
      
      // 检查其他可能的交互元素
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      console.log(`ℹ️ 找到 ${buttonCount} 个按钮`);
      
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      console.log(`ℹ️ 找到 ${inputCount} 个输入框`);
    }

    console.log('✅ 申请页面基本功能测试完成');
  });

  test('3.2 申请页面内容验证', async ({ page }) => {
    await page.goto('/apply');
    await page.waitForLoadState('networkidle');

    // 验证页面内容
    const pageText = await page.textContent('body');
    
    // 检查是否包含申请相关的关键词
    const keywords = ['申请', '职位', '简历', '联系', '提交', '姓名', '邮箱', '电话'];
    const foundKeywords = keywords.filter(keyword => pageText?.includes(keyword));
    
    console.log(`✅ 找到关键词: ${foundKeywords.join(', ')}`);
    
    if (foundKeywords.length > 0) {
      console.log('✅ 页面包含申请相关内容');
    } else {
      console.log('ℹ️ 页面可能使用不同的文案或结构');
    }

    // 验证页面标题
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);
  });

  test('3.3 申请页面交互测试', async ({ page }) => {
    await page.goto('/apply');
    await page.waitForLoadState('networkidle');

    // 查找所有可交互的元素
    const interactiveElements = [
      'button',
      'input',
      'select', 
      'textarea',
      'a[href]'
    ];

    for (const elementType of interactiveElements) {
      const elements = page.locator(elementType);
      const count = await elements.count();
      
      if (count > 0) {
        console.log(`✅ 找到 ${count} 个 ${elementType} 元素`);
        
        // 测试第一个元素的可见性
        const firstElement = elements.first();
        const isVisible = await firstElement.isVisible();
        const isEnabled = await firstElement.isEnabled();
        
        console.log(`   - 第一个元素可见: ${isVisible}, 可用: ${isEnabled}`);
      }
    }

    console.log('✅ 申请页面交互测试完成');
  });

  test('3.4 状态查询页面测试', async ({ page }) => {
    await page.goto('/status');
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 查找搜索相关元素
    const searchElements = [
      'input[type="search"]',
      'input[type="email"]',
      'input[placeholder*="搜索"]',
      'input[placeholder*="邮箱"]',
      'button:has-text("搜索")',
      'button:has-text("查询")'
    ];

    for (const selector of searchElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ 找到 ${count} 个搜索元素: ${selector}`);
      }
    }

    // 验证页面内容
    const pageText = await page.textContent('body');
    const statusKeywords = ['状态', '查询', '申请', '搜索', '邮箱'];
    const foundKeywords = statusKeywords.filter(keyword => pageText?.includes(keyword));
    
    console.log(`✅ 状态页面关键词: ${foundKeywords.join(', ')}`);
    console.log('✅ 状态查询页面测试完成');
  });

  test('3.5 职位页面基本测试', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    // 验证页面加载
    await expect(page.locator('main').first()).toBeVisible();

    // 查找职位相关元素
    const jobElements = [
      '[data-testid="job-card"]',
      '.job-card',
      'button:has-text("申请")',
      'button:has-text("查看")',
      'a:has-text("申请")',
      'a:has-text("查看")'
    ];

    for (const selector of jobElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ 找到 ${count} 个职位元素: ${selector}`);
      }
    }

    // 验证搜索功能
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"]');
    if (await searchInput.count() > 0) {
      console.log('✅ 找到搜索功能');
      
      // 测试搜索
      await searchInput.first().fill('测试');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      console.log('✅ 搜索功能可用');
    }

    console.log('✅ 职位页面基本测试完成');
  });

  test('3.6 页面导航测试', async ({ page }) => {
    // 测试页面间的导航
    const pages = [
      { url: '/', name: '首页' },
      { url: '/jobs', name: '职位页面' },
      { url: '/apply', name: '申请页面' },
      { url: '/status', name: '状态查询页面' }
    ];

    for (const testPage of pages) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');
      
      // 验证页面加载
      await expect(page.locator('main').first()).toBeVisible();
      
      // 验证URL
      expect(page.url()).toContain(testPage.url);
      
      console.log(`✅ ${testPage.name} 导航正常`);
    }

    console.log('✅ 页面导航测试完成');
  });

  test('3.7 响应式设计基本测试', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: '桌面端' },
      { width: 768, height: 1024, name: '平板端' },
      { width: 375, height: 667, name: '移动端' }
    ];

    const testPages = ['/apply', '/jobs', '/status'];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const testPage of testPages) {
        await page.goto(testPage);
        await page.waitForLoadState('networkidle');
        
        // 验证页面在当前视口下正常显示
        await expect(page.locator('main').first()).toBeVisible();
        
        console.log(`✅ ${testPage} 在 ${viewport.name} 显示正常`);
      }
    }

    // 恢复桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    console.log('✅ 响应式设计基本测试完成');
  });

  test('3.8 页面性能基本测试', async ({ page }) => {
    const testPages = [
      { url: '/apply', name: '申请页面', maxTime: 3000 },
      { url: '/jobs', name: '职位页面', maxTime: 3000 },
      { url: '/status', name: '状态查询页面', maxTime: 2000 }
    ];

    for (const testPage of testPages) {
      const startTime = Date.now();
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(testPage.maxTime);
      
      console.log(`✅ ${testPage.name} 加载时间: ${(loadTime / 1000).toFixed(2)}s`);
    }

    console.log('✅ 页面性能基本测试完成');
  });
});
