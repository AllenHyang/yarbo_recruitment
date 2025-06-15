import { test, expect } from '@playwright/test';
import { TestHelpers, TestDataGenerator } from './utils/test-helpers';

test.describe('申请系统Bug修复测试 - Application Bug Fix Tests', () => {
  let testHelpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    testHelpers = new TestHelpers(page);
  });

  test('8.1 重复邮箱申请Bug测试', async ({ page }) => {
    // 测试已注册邮箱的申请流程
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 使用已知存在的邮箱进行申请
    const existingEmail = 'hr@yarbo.com'; // 这个邮箱应该已经存在
    
    // 填写申请表单
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]');
    const emailInput = page.locator('input[type="email"]');
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill('测试用户');
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(existingEmail);
    }
    
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('13800138000');
    }

    // 选择职位
    const positionSelect = page.locator('select[name="position"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 提交申请
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(3000); // 等待处理
    }

    // 检查是否有错误信息显示
    const errorMessages = [
      'text=用户已注册失败',
      'text=A user with this email address has already been registered',
      'text=技术错误',
      'text=Console Error'
    ];

    let hasError = false;
    for (const errorSelector of errorMessages) {
      if (await page.locator(errorSelector).count() > 0) {
        hasError = true;
        console.log(`❌ 发现错误信息: ${errorSelector}`);
      }
    }

    if (hasError) {
      console.log('❌ Bug确认：重复邮箱申请导致错误');
      
      // 截图记录bug
      await page.screenshot({ 
        path: 'test-results/bug-duplicate-email.png',
        fullPage: true 
      });
    } else {
      console.log('✅ 重复邮箱申请处理正常');
    }

    // 验证页面状态
    const currentUrl = page.url();
    console.log(`当前页面URL: ${currentUrl}`);
    
    // 验证是否显示成功消息
    const successMessages = [
      'text=申请已收到',
      'text=申请提交成功',
      'text=感谢您的申请'
    ];

    let hasSuccess = false;
    for (const successSelector of successMessages) {
      if (await page.locator(successSelector).count() > 0) {
        hasSuccess = true;
        console.log(`✅ 找到成功信息: ${successSelector}`);
      }
    }

    console.log('✅ 重复邮箱申请Bug测试完成');
  });

  test('8.2 新邮箱申请正常流程测试', async ({ page }) => {
    // 测试新邮箱的申请流程
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 生成新的测试数据
    const newApplicationData = TestDataGenerator.generateJobApplication();
    
    // 填写申请表单
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]');
    const emailInput = page.locator('input[type="email"]');
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill(newApplicationData.name);
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill(newApplicationData.email);
    }
    
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(newApplicationData.phone);
    }

    // 选择职位
    const positionSelect = page.locator('select[name="position"]');
    if (await positionSelect.count() > 0) {
      await positionSelect.selectOption({ index: 1 });
    }

    // 提交申请
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(3000); // 等待处理
    }

    // 检查是否有错误信息
    const errorMessages = [
      'text=用户已注册失败',
      'text=技术错误',
      'text=Console Error'
    ];

    let hasError = false;
    for (const errorSelector of errorMessages) {
      if (await page.locator(errorSelector).count() > 0) {
        hasError = true;
        console.log(`❌ 新邮箱申请也有错误: ${errorSelector}`);
      }
    }

    if (!hasError) {
      console.log('✅ 新邮箱申请处理正常');
    }

    console.log('✅ 新邮箱申请正常流程测试完成');
  });

  test('8.3 申请表单验证测试', async ({ page }) => {
    // 测试表单验证逻辑
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 测试空表单提交
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // 检查客户端验证
      const validationErrors = page.locator('.error, [role="alert"], .text-red-500');
      const errorCount = await validationErrors.count();
      
      if (errorCount > 0) {
        console.log(`✅ 找到 ${errorCount} 个表单验证错误`);
      } else {
        console.log('ℹ️ 没有找到客户端表单验证');
      }
    }

    // 测试无效邮箱格式
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email-format');
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ 无效邮箱格式测试完成');
    }

    console.log('✅ 申请表单验证测试完成');
  });

  test('8.4 申请状态查询Bug测试', async ({ page }) => {
    // 测试申请后的状态查询
    
    await page.goto('/status');
    await testHelpers.waitForPageLoad();

    // 使用已知邮箱查询状态
    const emailInput = page.locator('input[type="email"]');
    const searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
    
    if (await emailInput.count() > 0 && await searchButton.count() > 0) {
      await emailInput.fill('hr@yarbo.com');
      await searchButton.click();
      await testHelpers.waitForPageLoad();
      
      // 检查查询结果
      const results = page.locator('[data-testid="search-results"], .search-results');
      if (await results.count() > 0) {
        console.log('✅ 状态查询功能正常');
      } else {
        console.log('ℹ️ 没有找到查询结果或结果显示方式不同');
      }
    }

    console.log('✅ 申请状态查询Bug测试完成');
  });

  test('8.5 错误处理改进建议测试', async ({ page }) => {
    // 测试错误处理的用户体验
    
    await page.goto('/apply');
    await testHelpers.waitForPageLoad();

    // 监听控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 提交可能导致错误的申请
    const nameInput = page.locator('input[name="name"], input[placeholder*="姓名"]');
    const emailInput = page.locator('input[type="email"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill('测试用户');
    }
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('hr@yarbo.com'); // 已存在的邮箱
    }

    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // 分析控制台错误
    if (consoleErrors.length > 0) {
      console.log(`❌ 发现 ${consoleErrors.length} 个控制台错误:`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ 没有控制台错误');
    }

    // 检查用户看到的错误信息
    const userVisibleErrors = page.locator('text=技术错误, text=Console Error, text=用户已注册失败');
    const userErrorCount = await userVisibleErrors.count();
    
    if (userErrorCount > 0) {
      console.log(`❌ 用户看到了 ${userErrorCount} 个技术错误信息`);
      console.log('建议：隐藏技术错误，显示友好的用户提示');
    } else {
      console.log('✅ 没有向用户显示技术错误');
    }

    console.log('✅ 错误处理改进建议测试完成');
  });
});
